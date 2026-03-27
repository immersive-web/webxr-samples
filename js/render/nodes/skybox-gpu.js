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

import {Material, RENDER_ORDER} from '../core/material.js';
import {Primitive, PrimitiveAttribute} from '../core/primitive.js';
import {Node} from '../core/node.js';
import {UrlTexture} from '../core/texture.js';

const GL = WebGLRenderingContext; // For depth func enums

const WGSL_SOURCE = `
// Bind group 0: Frame uniforms
struct FrameUniforms {
  projectionMatrix: mat4x4f,
  viewMatrix: mat4x4f,
  lightDirection: vec3f,
  _pad0: f32,
  lightColor: vec3f,
  _pad1: f32,
  cameraPosition: vec3f,
  _pad2: f32,
};
@group(0) @binding(0) var<uniform> frame: FrameUniforms;

// Bind group 1: Model uniforms
struct ModelUniforms {
  modelMatrix: mat4x4f,
};
@group(1) @binding(0) var<uniform> model: ModelUniforms;

// Bind group 2: Material uniforms + texture
struct MaterialUniforms {
  texCoordScaleOffset0: vec4f,
  texCoordScaleOffset1: vec4f,
};
@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var materialSampler: sampler;
@group(2) @binding(2) var diffuseTexture: texture_2d<f32>;

struct VertexInput {
  @location(0) position: vec3f,
  @location(3) texcoord: vec2f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) vTexCoord: vec2f,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  output.vTexCoord = input.texcoord;

  // Drop the translation portion of the view matrix
  var view = frame.viewMatrix;
  view[3] = vec4f(0.0, 0.0, 0.0, view[3].w);

  let out_vec = frame.projectionMatrix * view * model.modelMatrix * vec4f(input.position, 1.0);

  // Force depth to far plane (xyww trick)
  output.position = vec4f(out_vec.x, out_vec.y, out_vec.w, out_vec.w);

  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let scaleOffset = material.texCoordScaleOffset0;
  let uv = input.vTexCoord * scaleOffset.xy + scaleOffset.zw;
  return textureSample(diffuseTexture, materialSampler, uv);
}
`;

class SkyboxGPUMaterial extends Material {
  constructor() {
    super();
    this.renderOrder = RENDER_ORDER.SKY;
    this.state.depthFunc = GL.LEQUAL;
    this.state.depthMask = false;

    this.image = this.defineSampler('diffuse');

    this.texCoordScaleOffset = this.defineUniform('texCoordScaleOffset',
                                                      [1.0, 1.0, 0.0, 0.0,
                                                       1.0, 1.0, 0.0, 0.0], 4);
  }

  get materialName() {
    return 'SKYBOX_GPU';
  }

  get vertexSource() { return null; }
  get fragmentSource() { return null; }

  get wgslSource() {
    return WGSL_SOURCE;
  }

  getProgramDefines(renderPrimitive) {
    return {};
  }
}

export class SkyboxGPUNode extends Node {
  constructor(options) {
    super();

    this._url = options.url;
    this._displayMode = options.displayMode || 'mono';
    this._rotationY = options.rotationY || 0;
  }

  onRendererChanged(renderer) {
    let vertices = [];
    let indices = [];

    let latSegments = 40;
    let lonSegments = 40;

    for (let i = 0; i <= latSegments; ++i) {
      let theta = i * Math.PI / latSegments;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      let idxOffsetA = i * (lonSegments+1);
      let idxOffsetB = (i+1) * (lonSegments+1);

      for (let j=0; j <= lonSegments; ++j) {
        let phi = (j * 2 * Math.PI / lonSegments) + this._rotationY;
        let x = Math.sin(phi) * sinTheta;
        let y = cosTheta;
        let z = -Math.cos(phi) * sinTheta;
        let u = (j / lonSegments);
        let v = (i / latSegments);

        vertices.push(x, y, z, u, v);

        if (i < latSegments && j < lonSegments) {
          let idxA = idxOffsetA+j;
          let idxB = idxOffsetB+j;

          indices.push(idxA, idxB, idxA+1,
                       idxB, idxB+1, idxA+1);
        }
      }
    }

    let vertexBuffer = renderer.createRenderBuffer(new Float32Array(vertices), 'vertex');
    let indexBuffer = renderer.createRenderBuffer(new Uint16Array(indices), 'index');

    let attribs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 3, 5126, 20, 0),
      new PrimitiveAttribute('TEXCOORD_0', vertexBuffer, 2, 5126, 20, 12),
    ];

    let primitive = new Primitive(attribs, indices.length);
    primitive.setIndexBuffer(indexBuffer);

    let material = new SkyboxGPUMaterial();
    material.image.texture = new UrlTexture(this._url);

    switch (this._displayMode) {
      case 'mono':
        material.texCoordScaleOffset.value = [1.0, 1.0, 0.0, 0.0,
                                              1.0, 1.0, 0.0, 0.0];
        break;
      case 'stereoTopBottom':
        material.texCoordScaleOffset.value = [1.0, 0.5, 0.0, 0.0,
                                              1.0, 0.5, 0.0, 0.5];
        break;
      case 'stereoLeftRight':
        material.texCoordScaleOffset.value = [0.5, 1.0, 0.0, 0.0,
                                              0.5, 1.0, 0.5, 0.0];
        break;
    }

    let renderPrimitive = renderer.createRenderPrimitive(primitive, material);
    this.addRenderPrimitive(renderPrimitive);
  }
}
