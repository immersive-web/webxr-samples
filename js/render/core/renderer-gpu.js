// Copyright 2026 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {CAP, MAT_STATE, RENDER_ORDER, stateToBlendFunc} from './material.js';
import {Node} from './node.js';
import {DataTexture, ExternalTexture} from './texture.js';
import {mat4, vec3} from '../math/gl-matrix.js';

export const ATTRIB = {
  POSITION: 0,
  NORMAL: 1,
  TANGENT: 2,
  TEXCOORD_0: 3,
  TEXCOORD_1: 4,
  COLOR_0: 5,
};

export const ATTRIB_MASK = {
  POSITION: 0x0001,
  NORMAL: 0x0002,
  TANGENT: 0x0004,
  TEXCOORD_0: 0x0008,
  TEXCOORD_1: 0x0010,
  COLOR_0: 0x0020,
};

const DEF_LIGHT_DIR = new Float32Array([-0.1, -1.0, -0.2]);
const DEF_LIGHT_COLOR = new Float32Array([3.0, 3.0, 3.0]);

// Map GL blend constants to WebGPU blend factors.
// GL_ZERO=0, GL_ONE=1, GL_SRC_COLOR=0x0300, ...
function glBlendToGPU(glValue) {
  switch (glValue) {
    case 0: return 'zero';
    case 1: return 'one';
    case 0x0300: return 'src';
    case 0x0301: return 'one-minus-src';
    case 0x0302: return 'src-alpha';
    case 0x0303: return 'one-minus-src-alpha';
    case 0x0304: return 'dst-alpha';
    case 0x0305: return 'one-minus-dst-alpha';
    case 0x0306: return 'dst';
    case 0x0307: return 'one-minus-dst';
    default: return 'one';
  }
}

const GL_DEPTH_FUNC_TO_GPU = [
  'never', 'less', 'equal', 'less-equal',
  'greater', 'not-equal', 'greater-equal', 'always'
];

export const VIEW_INSTANCING_FEATURES = [
  {feature: 'view-instancing', wgslEnable: 'view_instancing'},
  {
    feature: 'chromium-experimental-multiview',
    wgslEnable: 'chromium_experimental_multiview',
  },
];

export const MULTISAMPLED_ARRAY_TEXTURE_FEATURES = [
  'multisampled-array-textures',
  'chromium-experimental-multisampled-array-textures',
];

export function getSupportedGPUFeature(features, candidates) {
  for (let candidate of candidates) {
    const feature = typeof candidate == 'string' ? candidate : candidate.feature;
    if (features && features.has(feature)) {
      return candidate;
    }
  }
  return null;
}

// Creates a WebGPU device with XR compatibility.
export async function createWebGPUContext(options) {
  if (!navigator.gpu) {
    console.error('WebGPU is not supported in this browser.');
    return null;
  }

  const adapter = await navigator.gpu.requestAdapter({
    xrCompatible: options?.xrCompatible ?? true,
  });
  if (!adapter) {
    console.error('Failed to get a WebGPU adapter.');
    return null;
  }

  const requiredFeatures = [];
  for (let feature of options?.requiredFeatures || []) {
    if (!adapter.features.has(feature)) {
      throw new Error(`Required WebGPU feature is not supported: ${feature}`);
    }
    requiredFeatures.push(feature);
  }

  for (let feature of options?.optionalFeatures || []) {
    if (adapter.features.has(feature) && !requiredFeatures.includes(feature)) {
      requiredFeatures.push(feature);
    }
  }

  const deviceDescriptor = requiredFeatures.length ? {requiredFeatures} : {};
  const device = await adapter.requestDevice(deviceDescriptor);
  return device;
}

export class RenderView {
  constructor(projectionMatrix, viewTransform, viewport = null, eye = 'left') {
    this.projectionMatrix = projectionMatrix;
    this.viewport = viewport;
    this._eye = eye;
    this._eyeIndex = (eye == 'left' ? 0 : 1);

    if (viewTransform instanceof Float32Array) {
      this._viewMatrix = mat4.clone(viewTransform);
      this.viewTransform = new XRRigidTransform();
    } else {
      this.viewTransform = viewTransform;
      this._viewMatrix = viewTransform.inverse.matrix;
    }
  }

  get viewMatrix() { return this._viewMatrix; }
  get eye() { return this._eye; }
  set eye(value) {
    this._eye = value;
    this._eyeIndex = (value == 'left' ? 0 : 1);
  }
  get eyeIndex() { return this._eyeIndex; }
}

// Wraps a GPUBuffer.
class GPURenderBuffer {
  constructor(buffer, length) {
    this._buffer = buffer;
    this._length = length;
  }
}

class GPURenderPrimitiveAttribute {
  constructor(primitiveAttribute) {
    this._attribIndex = ATTRIB[primitiveAttribute.name];
    this._componentCount = primitiveAttribute.componentCount;
    this._componentType = primitiveAttribute.componentType;
    this._stride = primitiveAttribute.stride;
    this._byteOffset = primitiveAttribute.byteOffset;
    this._normalized = primitiveAttribute.normalized;
  }
}

class GPURenderPrimitive {
  constructor() {
    this._activeFrameId = 0;
    this._instances = [];
    this._material = null;
    this._attributeBuffers = [];
    this._attributeMask = 0;
    this._indexBuffer = null;
    this._indexByteOffset = 0;
    this._indexType = 0;
    this._elementCount = 0;
    this._mode = 4; // triangles
    this._complete = false;
    this._min = null;
    this._max = null;
    this._pipeline = null;
    this._vertexBufferLayouts = null;
  }

  markActive(frameId) {
    if (this._complete && this._activeFrameId != frameId) {
      if (this._material) {
        if (!this._material.markActive(frameId)) {
          return;
        }
      }
      this._activeFrameId = frameId;
    }
  }

  get samplers() { return this._material._samplerDictionary; }
  get uniforms() { return this._material._uniform_dictionary; }

  waitForComplete() {
    if (!this._promise) {
      let pendingPromises = [];
      for (let ab of this._attributeBuffers) {
        if (ab.buffer && ab.buffer._promise) {
          pendingPromises.push(ab.buffer._promise);
        }
      }
      if (this._indexBuffer && this._indexBuffer._promise) {
        pendingPromises.push(this._indexBuffer._promise);
      }
      this._promise = Promise.all(pendingPromises).then(() => {
        this._complete = true;
        return this;
      });
    }
    return this._promise;
  }
}

class GPURenderTexture {
  constructor(gpuTexture, gpuView, sampler) {
    this._texture = gpuTexture;
    this._view = gpuView;
    this._sampler = sampler;
    this._complete = false;
    this._activeFrameId = 0;
  }

  markActive(frameId) {
    this._activeFrameId = frameId;
  }
}

class GPURenderMaterialSampler {
  constructor(renderer, materialSampler, index) {
    this._renderer = renderer;
    this._uniformName = materialSampler._uniformName;
    this._renderTexture = renderer._getRenderTexture(materialSampler._texture);
    this._index = index;
  }

  set texture(value) {
    this._renderTexture = this._renderer._getRenderTexture(value);
  }
}

class GPURenderMaterialUniform {
  constructor(materialUniform) {
    this._uniformName = materialUniform._uniformName;
    this._length = materialUniform._length;
    if (materialUniform._value instanceof Array) {
      this._value = new Float32Array(materialUniform._value);
    } else {
      this._value = new Float32Array([materialUniform._value]);
    }
  }

  set value(value) {
    if (this._value.length == 1) {
      this._value[0] = value;
    } else {
      for (let i = 0; i < this._value.length; ++i) {
        this._value[i] = value[i];
      }
    }
  }
}

class GPURenderMaterial {
  constructor(renderer, material, shaderModule) {
    this._shaderModule = shaderModule;
    this._state = material.state._state;
    this._activeFrameId = 0;
    this._completeForActiveFrame = false;

    this._samplerDictionary = {};
    this._samplers = [];
    for (let i = 0; i < material._samplers.length; ++i) {
      let s = new GPURenderMaterialSampler(renderer, material._samplers[i], i);
      this._samplers.push(s);
      this._samplerDictionary[s._uniformName] = s;
    }

    this._uniform_dictionary = {};
    this._uniforms = [];
    for (let uniform of material._uniforms) {
      let u = new GPURenderMaterialUniform(uniform);
      this._uniforms.push(u);
      this._uniform_dictionary[u._uniformName] = u;
    }

    this._materialName = material.materialName;

    this._renderOrder = material.renderOrder;
    if (this._renderOrder == RENDER_ORDER.DEFAULT) {
      if (this._state & CAP.BLEND) {
        this._renderOrder = RENDER_ORDER.TRANSPARENT;
      } else {
        this._renderOrder = RENDER_ORDER.OPAQUE;
      }
    }
  }

  markActive(frameId) {
    if (this._activeFrameId != frameId) {
      this._activeFrameId = frameId;
      this._completeForActiveFrame = true;
      for (let sampler of this._samplers) {
        if (sampler._renderTexture) {
          if (!sampler._renderTexture._complete) {
            this._completeForActiveFrame = false;
            break;
          }
          sampler._renderTexture.markActive(frameId);
        }
      }
    }
    return this._completeForActiveFrame;
  }

  get cullFace() { return !!(this._state & CAP.CULL_FACE); }
  get blend() { return !!(this._state & CAP.BLEND); }
  get depthTest() { return !!(this._state & CAP.DEPTH_TEST); }
  get colorMask() { return !!(this._state & CAP.COLOR_MASK); }
  get depthMask() { return !!(this._state & CAP.DEPTH_MASK); }
  get depthFunc() {
    let index = (this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT;
    return GL_DEPTH_FUNC_TO_GPU[index] || 'less';
  }
  get blendSrc() {
    return glBlendToGPU(stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT));
  }
  get blendDst() {
    return glBlendToGPU(stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT));
  }
}

// Byte sizes for uniform buffer layout (std140-aligned).
// Frame uniforms: projection(64) + view(64) + cameraPos(16) + lightDir(16) + lightColor(16) = 176
const FRAME_UNIFORM_SIZE = 176;
// Multiview frame uniforms: 2 view-projection matrices, 2 projection matrices,
// 2 view matrices, 2 vec4 camera positions, lightDir, and lightColor = 448
const VIEW_INSTANCING_FRAME_UNIFORM_SIZE = 448;
// Model uniforms: modelMatrix(64)
const MODEL_UNIFORM_SIZE = 64;
// Material uniforms: baseColorFactor(16) + metallicRoughnessFactor(8+pad8) + emissiveFactor(12+pad4) + occlusionStrength(4+pad12) = 64
const MATERIAL_UNIFORM_SIZE = 64;
const MAX_VIEW_INSTANCE_COUNT = 2;

const STANDARD_FRAME_UNIFORM_WGSL = `struct FrameUniforms {
  projectionMatrix: mat4x4f,
  viewMatrix: mat4x4f,
  cameraPosition: vec3f,
  lightDirection: vec3f,
  lightColor: vec3f,
};`;

const VIEW_INSTANCING_FRAME_UNIFORM_WGSL = `struct FrameUniforms {
  viewProjectionMatrices: array<mat4x4f, 2>,
  projectionMatrices: array<mat4x4f, 2>,
  viewMatrices: array<mat4x4f, 2>,
  cameraPositions: array<vec4f, 2>,
  lightDirection: vec3f,
  lightColor: vec3f,
};`;

const MOTION_FRAME_UNIFORM_WGSL = `struct FrameUniforms {
  projectionMatrix: mat4x4f,
  viewMatrix: mat4x4f,
  previousProjectionMatrix: mat4x4f,
  previousViewMatrix: mat4x4f,
};`;

const VIEW_INSTANCING_MOTION_FRAME_UNIFORM_WGSL = `struct FrameUniforms {
  projectionMatrices: array<mat4x4f, 2>,
  viewMatrices: array<mat4x4f, 2>,
  previousProjectionMatrices: array<mat4x4f, 2>,
  previousViewMatrices: array<mat4x4f, 2>,
};`;

function applyViewInstancingToWgsl(source, wgslEnable) {
  let output = `enable ${wgslEnable};\n` + source;

  if (output.includes(STANDARD_FRAME_UNIFORM_WGSL)) {
    output = output
        .replace(STANDARD_FRAME_UNIFORM_WGSL, VIEW_INSTANCING_FRAME_UNIFORM_WGSL)
        .replaceAll(
            'frame.projectionMatrix * frame.viewMatrix *',
            'frame.viewProjectionMatrices[viewIndex] *')
        .replaceAll('frame.projectionMatrix', 'frame.projectionMatrices[viewIndex]')
        .replaceAll('frame.viewMatrix', 'frame.viewMatrices[viewIndex]')
        .replaceAll('frame.cameraPosition', 'frame.cameraPositions[viewIndex].xyz');
  } else if (output.includes(MOTION_FRAME_UNIFORM_WGSL)) {
    output = output
        .replace(MOTION_FRAME_UNIFORM_WGSL, VIEW_INSTANCING_MOTION_FRAME_UNIFORM_WGSL)
        .replaceAll('frame.previousProjectionMatrix', 'frame.previousProjectionMatrices[viewIndex]')
        .replaceAll('frame.previousViewMatrix', 'frame.previousViewMatrices[viewIndex]')
        .replaceAll('frame.projectionMatrix', 'frame.projectionMatrices[viewIndex]')
        .replaceAll('frame.viewMatrix', 'frame.viewMatrices[viewIndex]');
  }

  return output.replace(
      'fn vs_main(input: VertexInput) -> VertexOutput {\n',
      'fn vs_main(input: VertexInput, @builtin(view_index) rawViewIndex: u32) -> VertexOutput {\n  let viewIndex = rawViewIndex;\n');
}

function vertexFormatForAttribute(attribute) {
  switch (attribute._componentCount) {
    case 1: return 'float32';
    case 2: return 'float32x2';
    case 3: return 'float32x3';
    case 4: return 'float32x4';
  }
  throw new Error(`Unsupported vertex component count: ${attribute._componentCount}`);
}

export class GPURenderer {
  constructor(device, colorFormat, options = {}) {
    options = typeof options == 'number' ? {sampleCount: options} : options;

    this._device = device;
    this._colorFormat = colorFormat || 'rgba8unorm';
    this._depthFormat = 'depth24plus';
    this._sampleCount = options.sampleCount > 1 ? 4 : 1;
    this._viewInstancing = !!options.viewInstancing;
    this._viewInstancingWgslEnable =
        options.viewInstancingWgslEnable || 'view_instancing';
    this._transientMsaaAttachments =
        !this._viewInstancing ||
        !!getSupportedGPUFeature(
            device.features,
            MULTISAMPLED_ARRAY_TEXTURE_FEATURES);
    this._frameUniformSize = this._viewInstancing ?
        VIEW_INSTANCING_FRAME_UNIFORM_SIZE :
        FRAME_UNIFORM_SIZE;
    this._frameId = 0;
    this._pipelineCache = {};
    this._shaderCache = {};
    this._textureCache = {};
    this._msaaColorAttachments = [];
    this._msaaDepthAttachments = [];
    this._viewProjectionMatrices = [mat4.create(), mat4.create()];
    this._renderPrimitives = Array(RENDER_ORDER.DEFAULT);
    this._cameraPositions = [];

    this._globalLightColor = vec3.clone(DEF_LIGHT_COLOR);
    this._globalLightDir = vec3.clone(DEF_LIGHT_DIR);

    // Create a default sampler.
    this._defaultSampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
    });

    // Create a 1x1 white texture for materials without textures.
    this._whiteTexture = device.createTexture({
      size: [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    device.queue.writeTexture(
      { texture: this._whiteTexture },
      new Uint8Array([255, 255, 255, 255]),
      { bytesPerRow: 4 },
      [1, 1]
    );
    this._whiteTextureView = this._whiteTexture.createView();

    // Frame uniforms are double-buffered by view so both eyes can be encoded
    // into one command buffer without racing on the same uniform contents.
    this._frameUniforms = [];
    this._frameData = new Float32Array(this._frameUniformSize / 4);

    // Create the frame bind group layout (group 0).
    this._frameBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    });

    // Model bind group layout (group 1).
    this._modelBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      ],
    });

    // Material bind group layout (group 2): uniforms + up to 1 texture+sampler.
    this._materialBindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
      ],
    });

    this._pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [
        this._frameBindGroupLayout,
        this._modelBindGroupLayout,
        this._materialBindGroupLayout,
      ],
    });

    // Pool of model uniform buffers and bind groups.
    this._modelUniforms = [];
    this._modelUniformIndex = 0;
  }

  get device() { return this._device; }
  get colorFormat() { return this._colorFormat; }
  get sampleCount() { return this._sampleCount; }

  set globalLightColor(value) { vec3.copy(this._globalLightColor, value); }
  get globalLightColor() { return vec3.clone(this._globalLightColor); }
  set globalLightDir(value) { vec3.copy(this._globalLightDir, value); }
  get globalLightDir() { return vec3.clone(this._globalLightDir); }

  _getFrameUniform(viewIndex) {
    if (viewIndex < this._frameUniforms.length) {
      return this._frameUniforms[viewIndex];
    }

    let buffer = this._device.createBuffer({
      size: this._frameUniformSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    let bindGroup = this._device.createBindGroup({
      layout: this._frameBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: buffer } },
      ],
    });
    let frameUniform = {buffer, bindGroup};
    this._frameUniforms.push(frameUniform);
    return frameUniform;
  }

  _getModelUniform() {
    if (this._modelUniformIndex < this._modelUniforms.length) {
      return this._modelUniforms[this._modelUniformIndex++];
    }

    let buffer = this._device.createBuffer({
      size: MODEL_UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    let bindGroup = this._device.createBindGroup({
      layout: this._modelBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: buffer } },
      ],
    });
    let modelUniform = {buffer, bindGroup};
    this._modelUniforms.push(modelUniform);
    this._modelUniformIndex++;
    return modelUniform;
  }

  _getMsaaAttachment(
      attachments,
      viewIndex,
      width,
      height,
      format,
      depthOrArrayLayers = 1,
      viewDimension = '2d') {
    let attachment = attachments[viewIndex];
    if (attachment &&
        attachment.width == width &&
        attachment.height == height &&
        attachment.format == format &&
        attachment.depthOrArrayLayers == depthOrArrayLayers &&
        attachment.viewDimension == viewDimension &&
        attachment.sampleCount == this._sampleCount) {
      return attachment;
    }

    if (attachment && attachment.texture) {
      attachment.texture.destroy();
    }

    let usage = GPUTextureUsage.RENDER_ATTACHMENT;
    if (GPUTextureUsage.TRANSIENT_ATTACHMENT && this._transientMsaaAttachments) {
      usage |= GPUTextureUsage.TRANSIENT_ATTACHMENT;
    }

    let texture = this._device.createTexture({
      size: [width, height, depthOrArrayLayers],
      sampleCount: this._sampleCount,
      format: format,
      usage: usage,
    });
    attachment = {
      texture,
      view: texture.createView({
        dimension: viewDimension,
        baseArrayLayer: 0,
        arrayLayerCount: depthOrArrayLayers,
      }),
      width,
      height,
      format,
      depthOrArrayLayers,
      viewDimension,
      sampleCount: this._sampleCount,
    };
    attachments[viewIndex] = attachment;
    return attachment;
  }

  _getViewAttachmentSize(view) {
    if (!view.viewport) {
      return null;
    }

    return {
      width: Math.max(1, Math.ceil(view.viewport.x + view.viewport.width)),
      height: Math.max(1, Math.ceil(view.viewport.y + view.viewport.height)),
    };
  }

  updateRenderBuffer(renderBuffer, data, byteOffset) {
    if (renderBuffer._buffer) {
      this._device.queue.writeBuffer(renderBuffer._buffer, byteOffset || 0, data);
    }
  }

  createRenderBuffer(data, usage) {
    let gpuUsage = GPUBufferUsage.COPY_DST;
    if (usage === 'vertex') {
      gpuUsage |= GPUBufferUsage.VERTEX;
    } else if (usage === 'index') {
      gpuUsage |= GPUBufferUsage.INDEX;
    }

    // data may be a Promise
    if (data instanceof Promise) {
      let renderBuffer = new GPURenderBuffer(null, 0);
      renderBuffer._promise = data.then((resolvedData) => {
        let alignedSize = Math.ceil(resolvedData.byteLength / 4) * 4;
        let buf = this._device.createBuffer({
          size: alignedSize,
          usage: gpuUsage,
          mappedAtCreation: true,
        });
        new Uint8Array(buf.getMappedRange()).set(new Uint8Array(resolvedData.buffer, resolvedData.byteOffset, resolvedData.byteLength));
        buf.unmap();
        renderBuffer._buffer = buf;
        renderBuffer._length = resolvedData.byteLength;
        return renderBuffer;
      });
      return renderBuffer;
    }

    let alignedSize = Math.ceil(data.byteLength / 4) * 4;
    let buf = this._device.createBuffer({
      size: alignedSize,
      usage: gpuUsage,
      mappedAtCreation: true,
    });
    new Uint8Array(buf.getMappedRange()).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    buf.unmap();
    return new GPURenderBuffer(buf, data.byteLength);
  }

  createRenderPrimitive(primitive, material) {
    let renderPrimitive = new GPURenderPrimitive();
    renderPrimitive._elementCount = primitive.elementCount;
    renderPrimitive._mode = primitive.mode;

    if (primitive._min) {
      renderPrimitive._min = vec3.clone(primitive._min);
      renderPrimitive._max = vec3.clone(primitive._max);
    }

    // Build attribute info.
    for (let attribute of primitive.attributes) {
      renderPrimitive._attributeMask |= ATTRIB_MASK[attribute.name];
      renderPrimitive._attributeBuffers.push({
        buffer: attribute.buffer,
        attrib: new GPURenderPrimitiveAttribute(attribute),
      });
    }

    if (primitive.indexBuffer) {
      renderPrimitive._indexBuffer = primitive.indexBuffer;
      renderPrimitive._indexByteOffset = primitive.indexByteOffset;
      // 5123 = UNSIGNED_SHORT, 5125 = UNSIGNED_INT
      renderPrimitive._indexType = primitive.indexType;
    }

    // Create material.
    let shaderModule = this._getShaderModule(material, renderPrimitive);
    let renderMaterial = new GPURenderMaterial(this, material, shaderModule);
    renderPrimitive._material = renderMaterial;

    // Create pipeline.
    renderPrimitive._pipeline = this._getOrCreatePipeline(renderPrimitive, renderMaterial);

    if (!this._renderPrimitives[renderMaterial._renderOrder]) {
      this._renderPrimitives[renderMaterial._renderOrder] = [];
    }
    this._renderPrimitives[renderMaterial._renderOrder].push(renderPrimitive);

    let pendingPromises = [];
    for (let ab of renderPrimitive._attributeBuffers) {
      if (ab.buffer && ab.buffer._promise) {
        pendingPromises.push(ab.buffer._promise);
      }
    }
    if (renderPrimitive._indexBuffer && renderPrimitive._indexBuffer._promise) {
      pendingPromises.push(renderPrimitive._indexBuffer._promise);
    }
    if (pendingPromises.length > 0) {
      Promise.all(pendingPromises).then(() => {
        renderPrimitive._complete = true;
      });
    } else {
      renderPrimitive._complete = true;
    }

    return renderPrimitive;
  }

  createMesh(primitive, material) {
    let meshNode = new Node();
    meshNode.addRenderPrimitive(this.createRenderPrimitive(primitive, material));
    return meshNode;
  }

  _getShaderModule(material, renderPrimitive) {
    let defines = material.getProgramDefines(renderPrimitive) || {};
    if (this._viewInstancing) {
      defines['VIEW_INSTANCING'] = 1;
      defines['VIEW_INSTANCING_WGSL_ENABLE'] = this._viewInstancingWgslEnable;
    }
    let key = `${material.materialName}:${JSON.stringify(defines)}`;

    if (key in this._shaderCache) {
      return this._shaderCache[key];
    }

    let wgslSource = material.getWgslSource ? material.getWgslSource(defines) : material.wgslSource;
    if (!wgslSource) {
      console.error('Material does not provide WGSL source. Use a GPU-compatible material (e.g., PbrGPUMaterial).');
      return null;
    }
    if (this._viewInstancing) {
      wgslSource = applyViewInstancingToWgsl(
          wgslSource,
          this._viewInstancingWgslEnable);
    }

    let module = this._device.createShaderModule({
      code: wgslSource,
    });
    this._shaderCache[key] = module;
    return module;
  }

  _vertexBufferLayoutForPrimitive(renderPrimitive) {
    let layouts = [];
    for (let ab of renderPrimitive._attributeBuffers) {
      let a = ab.attrib;
      let format = vertexFormatForAttribute(a);
      layouts.push({
        arrayStride: a._stride || (a._componentCount * 4),
        attributes: [{
          shaderLocation: a._attribIndex,
          offset: a._byteOffset,
          format: format,
        }],
      });
    }
    return layouts;
  }

  _vertexBufferLayoutKeyForPrimitive(renderPrimitive) {
    return renderPrimitive._attributeBuffers.map((ab) => {
      let a = ab.attrib;
      let stride = a._stride || (a._componentCount * 4);
      let format = vertexFormatForAttribute(a);
      return `${a._attribIndex}:${format}:${stride}:${a._byteOffset}`;
    }).join('|');
  }

  _getOrCreatePipeline(renderPrimitive, renderMaterial) {
    // WebGPU pipelines bake vertex buffer layouts, so primitives with the same
    // attribute mask but different buffer slot order need distinct pipelines.
    let vertexLayoutKey = this._vertexBufferLayoutKeyForPrimitive(renderPrimitive);
    let key = `${renderPrimitive._attributeMask}:${vertexLayoutKey}:${renderMaterial._state}:${renderMaterial._materialName}:${this._sampleCount}:${this._viewInstancing}`;
    if (key in this._pipelineCache) {
      return this._pipelineCache[key];
    }

    let vertexBuffers = this._vertexBufferLayoutForPrimitive(renderPrimitive);

    let targets = [{
      format: this._colorFormat,
      writeMask: renderMaterial.colorMask ? GPUColorWrite.ALL : 0,
    }];

    if (renderMaterial.blend) {
      let srcFactor = renderMaterial.blendSrc;
      let dstFactor = renderMaterial.blendDst;
      targets[0].blend = {
        color: {
          srcFactor: srcFactor,
          dstFactor: dstFactor,
          operation: 'add',
        },
        alpha: {
          srcFactor: srcFactor,
          dstFactor: dstFactor,
          operation: 'add',
        },
      };
    }

    let depthStencil = undefined;
    if (renderMaterial.depthTest) {
      depthStencil = {
        format: this._depthFormat,
        depthWriteEnabled: renderMaterial.depthMask,
        depthCompare: renderMaterial.depthFunc,
      };
    }

    let pipeline = this._device.createRenderPipeline({
      layout: this._pipelineLayout,
      vertex: {
        module: renderMaterial._shaderModule,
        entryPoint: 'vs_main',
        buffers: vertexBuffers,
      },
      fragment: {
        module: renderMaterial._shaderModule,
        entryPoint: 'fs_main',
        targets: targets,
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: renderMaterial.cullFace ? 'back' : 'none',
      },
      depthStencil: depthStencil,
      multisample: {
        count: this._sampleCount,
      },
    });

    this._pipelineCache[key] = pipeline;
    return pipeline;
  }

  _getRenderTexture(texture) {
    if (!texture) return null;

    let key = texture.textureKey;
    if (!key) return null;

    if (key in this._textureCache) {
      return this._textureCache[key];
    }

    if (texture instanceof DataTexture) {
      let gpuTexture = this._device.createTexture({
        size: [texture.width, texture.height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      this._device.queue.writeTexture(
        { texture: gpuTexture },
        texture._data,
        { bytesPerRow: texture.width * 4 },
        [texture.width, texture.height]
      );
      let renderTexture = new GPURenderTexture(gpuTexture, gpuTexture.createView(), this._defaultSampler);
      renderTexture._complete = true;
      this._textureCache[key] = renderTexture;
      return renderTexture;
    }

    // For image-based textures, load asynchronously.
    let renderTexture = new GPURenderTexture(null, null, this._defaultSampler);
    this._textureCache[key] = renderTexture;

    texture.waitForComplete().then(() => {
      let source = texture.source;
      createImageBitmap(source).then((bitmap) => {
        let gpuTexture = this._device.createTexture({
          size: [bitmap.width, bitmap.height],
          format: 'rgba8unorm',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this._device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture: gpuTexture },
          [bitmap.width, bitmap.height]
        );
        renderTexture._texture = gpuTexture;
        renderTexture._view = gpuTexture.createView();
        renderTexture._complete = true;
      });
    });

    return renderTexture;
  }

  _createMaterialBindGroup(renderMaterial) {
    if (!renderMaterial._uniformBuffer) {
      renderMaterial._uniformBuffer = this._device.createBuffer({
        size: MATERIAL_UNIFORM_SIZE,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      renderMaterial._uniformData = new Float32Array(MATERIAL_UNIFORM_SIZE / 4);
      renderMaterial._uniformFrameId = -1;
    }

    if (renderMaterial._uniformFrameId != this._frameId) {
      // Write material uniforms once per frame; the bind group can be reused.
      let materialData = renderMaterial._uniformData;
      materialData.fill(0);
      let offset = 0;
      for (let u of renderMaterial._uniforms) {
        materialData.set(u._value, offset);
        // Pad to vec4 alignment.
        offset += Math.ceil(u._value.length / 4) * 4;
      }

      this._device.queue.writeBuffer(renderMaterial._uniformBuffer, 0, materialData);
      renderMaterial._uniformFrameId = this._frameId;
    }

    // Find the base color texture, or use white.
    let textureView = this._whiteTextureView;
    let sampler = this._defaultSampler;
    for (let s of renderMaterial._samplers) {
      if (s._renderTexture && s._renderTexture._complete && s._renderTexture._view) {
        textureView = s._renderTexture._view;
        sampler = s._renderTexture._sampler || this._defaultSampler;
        break;
      }
    }

    if (!renderMaterial._bindGroup ||
        renderMaterial._bindGroupTextureView != textureView ||
        renderMaterial._bindGroupSampler != sampler) {
      renderMaterial._bindGroup = this._device.createBindGroup({
        layout: this._materialBindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: renderMaterial._uniformBuffer } },
          { binding: 1, resource: sampler },
          { binding: 2, resource: textureView },
        ],
      });
      renderMaterial._bindGroupTextureView = textureView;
      renderMaterial._bindGroupSampler = sampler;
    }

    return renderMaterial._bindGroup;
  }

  drawViews(views, rootNode) {
    if (!rootNode) return;
    this._frameId++;
    this._modelUniformIndex = 0;
    rootNode.markActive(this._frameId);

    for (let i = 0; i < views.length; ++i) {
      if (this._cameraPositions.length <= i) {
        this._cameraPositions.push(vec3.create());
      }
      let p = views[i].viewTransform.position;
      this._cameraPositions[i][0] = p.x;
      this._cameraPositions[i][1] = p.y;
      this._cameraPositions[i][2] = p.z;
    }

    if (this._viewInstancing) {
      this._drawViewInstanced(views);
      return;
    }

    this._drawViewsOneByOne(views);
  }

  _writeFrameUniformForView(view, viewIndex, frameUniform) {
    let frameData = this._frameData;
    frameData.set(view.projectionMatrix, 0);    // offset 0: projection (16 floats)
    frameData.set(view.viewMatrix, 16);          // offset 64: view (16 floats)
    frameData.set(this._cameraPositions[viewIndex], 32); // offset 128: cameraPos (3 floats)
    frameData.set(this._globalLightDir, 36);     // offset 144: lightDir (3 floats)
    frameData.set(this._globalLightColor, 40);   // offset 160: lightColor (3 floats)
    this._device.queue.writeBuffer(frameUniform.buffer, 0, frameData);
  }

  _writeViewInstancingFrameUniform(views, frameUniform) {
    let frameData = this._frameData;
    frameData.fill(0);
    const viewCount = Math.min(views.length, MAX_VIEW_INSTANCE_COUNT);
    for (let i = 0; i < viewCount; ++i) {
      mat4.multiply(
          this._viewProjectionMatrices[i],
          views[i].projectionMatrix,
          views[i].viewMatrix);
      frameData.set(this._viewProjectionMatrices[i], i * 16);
      frameData.set(views[i].projectionMatrix, 32 + i * 16);
      frameData.set(views[i].viewMatrix, 64 + i * 16);
      frameData.set(this._cameraPositions[i], 96 + i * 4);
    }
    frameData.set(this._globalLightDir, 104);
    frameData.set(this._globalLightColor, 108);
    this._device.queue.writeBuffer(frameUniform.buffer, 0, frameData);
  }

  _encodeRenderPrimitives(passEncoder) {
    for (let renderPrimitives of this._renderPrimitives) {
      if (renderPrimitives && renderPrimitives.length) {
        this._drawPrimitives(passEncoder, renderPrimitives);
      }
    }
  }

  _drawViewsOneByOne(views) {
    let commandEncoder = this._device.createCommandEncoder();
    let encodedPass = false;

    // For XR, we render one view at a time (each into a different texture array layer).
    for (let vi = 0; vi < views.length; vi++) {
      let view = views[vi];
      if (!view._colorView) continue;

      let colorView = view._colorView;
      let resolveTarget = undefined;
      let depthView = view._depthView;
      let colorStoreOp = 'store';
      let attachmentSize = null;
      if (this._sampleCount > 1 || !depthView) {
        attachmentSize = this._getViewAttachmentSize(view);
        if (!attachmentSize) {
          console.warn('Skipping view because no depth attachment or viewport size is available.');
          continue;
        }
      }

      if (this._sampleCount > 1) {
        colorView =
            this._getMsaaAttachment(
                this._msaaColorAttachments,
                vi,
                attachmentSize.width,
                attachmentSize.height,
                this._colorFormat).view;
        depthView =
            this._getMsaaAttachment(
                this._msaaDepthAttachments,
                vi,
                attachmentSize.width,
                attachmentSize.height,
                this._depthFormat).view;
        resolveTarget = view._colorView;
        colorStoreOp = 'discard';
      } else if (!depthView) {
        depthView =
            this._getMsaaAttachment(
                this._msaaDepthAttachments,
                vi,
                attachmentSize.width,
                attachmentSize.height,
                this._depthFormat).view;
      }

      // Update frame uniforms for this view.
      let frameUniform = this._getFrameUniform(vi);
      this._writeFrameUniformForView(view, vi, frameUniform);

      let passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: colorView,
          resolveTarget: resolveTarget,
          loadOp: vi === 0 || views.length > 1 ? 'clear' : 'load',
          storeOp: colorStoreOp,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
        }],
        depthStencilAttachment: depthView ? {
          view: depthView,
          depthLoadOp: vi === 0 || views.length > 1 ? 'clear' : 'load',
          depthClearValue: 1.0,
          depthStoreOp: 'discard',
        } : undefined,
      });

      if (view.viewport) {
        let vp = view.viewport;
        passEncoder.setViewport(vp.x, vp.y, vp.width, vp.height, 0.0, 1.0);
      }

      passEncoder.setBindGroup(0, frameUniform.bindGroup);
      this._encodeRenderPrimitives(passEncoder);

      passEncoder.end();
      encodedPass = true;
    }

    if (encodedPass) {
      this._device.queue.submit([commandEncoder.finish()]);
    }
  }

  _drawViewInstanced(views) {
    let view = views[0];
    if (!view._colorView) return;

    const viewCount = Math.min(views.length, MAX_VIEW_INSTANCE_COUNT);
    let colorView = view._colorView;
    let resolveTarget = undefined;
    let depthView = view._depthView;
    let colorStoreOp = 'store';
    let attachmentSize = null;
    if (this._sampleCount > 1 || !depthView) {
      attachmentSize = this._getViewAttachmentSize(view);
      if (!attachmentSize) {
        console.warn('Skipping multiview because no depth attachment or viewport size is available.');
        return;
      }
    }

    if (this._sampleCount > 1) {
      colorView =
          this._getMsaaAttachment(
              this._msaaColorAttachments,
              0,
              attachmentSize.width,
              attachmentSize.height,
              this._colorFormat,
              viewCount,
              '2d-array').view;
      depthView =
          this._getMsaaAttachment(
              this._msaaDepthAttachments,
              0,
              attachmentSize.width,
              attachmentSize.height,
              this._depthFormat,
              viewCount,
              '2d-array').view;
      resolveTarget = view._colorView;
      colorStoreOp = 'discard';
    } else if (!depthView) {
      depthView =
          this._getMsaaAttachment(
              this._msaaDepthAttachments,
              0,
              attachmentSize.width,
              attachmentSize.height,
              this._depthFormat,
              viewCount,
              '2d-array').view;
    }

    let frameUniform = this._getFrameUniform(0);
    this._writeViewInstancingFrameUniform(views, frameUniform);

    let commandEncoder = this._device.createCommandEncoder();
    let passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: colorView,
        resolveTarget: resolveTarget,
        loadOp: 'clear',
        storeOp: colorStoreOp,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
      }],
      depthStencilAttachment: depthView ? {
        view: depthView,
        depthLoadOp: 'clear',
        depthClearValue: 1.0,
        depthStoreOp: 'discard',
      } : undefined,
      viewCount: viewCount,
    });

    if (view.viewport) {
      let vp = view.viewport;
      passEncoder.setViewport(vp.x, vp.y, vp.width, vp.height, 0.0, 1.0);
    }

    passEncoder.setBindGroup(0, frameUniform.bindGroup);
    this._encodeRenderPrimitives(passEncoder);

    passEncoder.end();
    this._device.queue.submit([commandEncoder.finish()]);
  }

  _drawPrimitives(passEncoder, renderPrimitives) {
    for (let primitive of renderPrimitives) {
      if (primitive._activeFrameId != this._frameId) continue;
      if (!primitive._pipeline) continue;
      if (!primitive._elementCount) continue;

      passEncoder.setPipeline(primitive._pipeline);

      // Bind vertex buffers.
      for (let i = 0; i < primitive._attributeBuffers.length; i++) {
        let ab = primitive._attributeBuffers[i];
        if (ab.buffer && ab.buffer._buffer) {
          passEncoder.setVertexBuffer(i, ab.buffer._buffer);
        }
      }

      // Bind index buffer if present.
      let indexed = false;
      if (primitive._indexBuffer && primitive._indexBuffer._buffer) {
        let indexFormat = primitive._indexType === 5125 ? 'uint32' : 'uint16';
        passEncoder.setIndexBuffer(primitive._indexBuffer._buffer, indexFormat, primitive._indexByteOffset);
        indexed = true;
      }

      // Create and bind material bind group.
      let materialBindGroup = this._createMaterialBindGroup(primitive._material);
      passEncoder.setBindGroup(2, materialBindGroup);

      // Draw each instance.
      for (let instance of primitive._instances) {
        if (instance._activeFrameId != this._frameId) continue;

        let modelUniform = this._getModelUniform();
        this._device.queue.writeBuffer(modelUniform.buffer, 0, instance.worldMatrix);
        passEncoder.setBindGroup(1, modelUniform.bindGroup);

        if (indexed) {
          passEncoder.drawIndexed(primitive._elementCount);
        } else {
          passEncoder.draw(primitive._elementCount);
        }
      }
    }
  }
}
