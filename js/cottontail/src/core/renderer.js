// Copyright 2018 The Immersive Web Community Group
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

import { CAP, MAT_STATE, RENDER_ORDER, stateToBlendFunc } from './material.js'
import { Node } from './node.js'
import { Program } from './program.js'
import { DataTexture, VideoTexture } from './texture.js'

export const ATTRIB = {
  POSITION: 1,
  NORMAL: 2,
  TANGENT: 3,
  TEXCOORD_0: 4,
  TEXCOORD_1: 5,
  COLOR_0: 6,
};

export const ATTRIB_MASK = {
  POSITION:   0x0001,
  NORMAL:     0x0002,
  TANGENT:    0x0004,
  TEXCOORD_0: 0x0008,
  TEXCOORD_1: 0x0010,
  COLOR_0:    0x0020,
};

const DEF_LIGHT_DIR = new Float32Array([-0.1, -1.0, -0.2]);
const DEF_LIGHT_COLOR = new Float32Array([1.0, 1.0, 0.9]);

const PRECISION_REGEX = new RegExp('precision (lowp|mediump|highp) float;');

const VERTEX_SHADER_SINGLE_ENTRY = `
uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;

void main() {
  gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);
}
`;

const VERTEX_SHADER_MULTI_ENTRY = `
#ERROR Multiview rendering is not implemented
void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_ENTRY = `
void main() {
  gl_FragColor = fragment_main();
}
`;

function isPowerOfTwo(n) {
  return (n & (n - 1)) === 0;
}

// Creates a WebGL context and initializes it with some common default state.
export function createWebGLContext(glAttribs) {
  glAttribs = glAttribs || { alpha: false };

  let webglCanvas = document.createElement('canvas');
  let contextTypes = glAttribs.webgl2 ? ['webgl2'] : ['webgl', 'experimental-webgl'];
  let context = null;

  for (let contextType of contextTypes) {
    context = webglCanvas.getContext(contextType, glAttribs);
    if (context)
      break;
  }

  if (!context) {
    let webglType = (glAttribs.webgl2 ? 'WebGL 2' : 'WebGL')
    console.error('This browser does not support ' + webglType + '.');
    return null;
  }

  return context;
}

export class RenderView {
  constructor(projection_matrix, view_matrix, viewport = null, eye = 'left') {
    this.projection_matrix = projection_matrix;
    this.view_matrix = view_matrix;
    this.viewport = viewport;
    // If an eye isn't given the left eye is assumed.
    this._eye = eye;
    this._eye_index = (eye == 'left' ? 0 : 1);
  }

  get eye() {
    return this._eye;
  }

  set eye(value) {
    this._eye = value;
    this._eye_index = (value == 'left' ? 0 : 1);
  }

  get eye_index() {
    return this._eye_index;
  }
}

class RenderBuffer {
  constructor(target, usage, buffer, length = 0) {
    this._target = target;
    this._usage = usage;
    this._length = length;
    if (buffer instanceof Promise) {
      this._buffer = null;
      this._promise = buffer.then((buffer) => {
        this._buffer = buffer;
        return this;
      });
    } else {
      this._buffer = buffer;
      this._promise = Promise.resolve(this);
    }
  }

  waitForComplete() {
    return this._promise;
  }
}

class RenderPrimitiveAttribute {
  constructor(primitive_attribute) {
    this._attrib_index = ATTRIB[primitive_attribute.name];
    this._component_count = primitive_attribute.component_count;
    this._component_type = primitive_attribute.component_type;
    this._stride = primitive_attribute.stride;
    this._byte_offset = primitive_attribute.byte_offset;
    this._normalized = primitive_attribute.normalized;
  }
}

class RenderPrimitiveAttributeBuffer {
  constructor(buffer) {
    this._buffer = buffer;
    this._attributes = [];
  }
}

class RenderPrimitive {
  constructor(primitive) {
    this._instances = [];
    this._material = null;

    this.setPrimitive(primitive);
  }

  setPrimitive(primitive) {
    this._mode = primitive.mode;
    this._element_count = primitive.element_count;
    this._promise = null;
    this._vao = null;
    this._complete = false;
    this._attribute_buffers = [];
    this._attribute_mask = 0;

    for (let attribute of primitive.attributes) {
      this._attribute_mask |= ATTRIB_MASK[attribute.name];
      let render_attribute = new RenderPrimitiveAttribute(attribute);
      let found_buffer = false;
      for (let attribute_buffer of this._attribute_buffers) {
        if (attribute_buffer._buffer == attribute.buffer) {
          attribute_buffer._attributes.push(render_attribute);
          found_buffer = true;
          break;
        }
      }
      if (!found_buffer) {
        let attribute_buffer = new RenderPrimitiveAttributeBuffer(attribute.buffer);
        attribute_buffer._attributes.push(render_attribute);
        this._attribute_buffers.push(attribute_buffer);
      }
    }

    this._index_buffer = null;
    this._index_byte_offset = 0;
    this._index_type = 0;

    if (primitive.index_buffer) {
      this._index_byte_offset = primitive.index_byte_offset;
      this._index_type = primitive.index_type;
      this._index_buffer = primitive.index_buffer;
    }

    if (primitive._min) {
      this._min = vec3.clone(primitive._min);
      this._max = vec3.clone(primitive._max);
    } else {
      this._min = null;
      this._max = null;
    }

    if (this._material != null) {
      this.waitForComplete(); // To flip the _complete flag.
    }
  }

  setRenderMaterial(material) {
    this._material = material;
    this._promise = null;
    this._complete = false;

    if (this._material != null) {
      this.waitForComplete(); // To flip the _complete flag.
    }
  }

  markActive(frame_id) {
    if (this._complete) {
      this._active_frame_id = frame_id;

      if (this.material) {
        this.material.markActive(frame_id);
      }

      if (this.program) {
        this.program.markActive(frame_id);
      }
    }
  }

  get samplers() {
    return this._material._sampler_dictionary;
  }

  get uniforms() {
    return this._material._uniform_dictionary;
  }

  waitForComplete() {
    if (!this._promise) {
      if (!this._material) {
        return Promise.reject("RenderPrimitive does not have a material");
      }

      let completion_promises = [];
      completion_promises.push(this._material.waitForComplete());

      for (let attribute_buffer of this._attribute_buffers) {
        if (!attribute_buffer._buffer._buffer) {
          completion_promises.push(attribute_buffer._buffer._promise);
        }
      }
      
      if (this._index_buffer && !this._index_buffer._buffer) {
        completion_promises.push(this._index_buffer._promise);
      }

      this._promise = Promise.all(completion_promises).then(() => {
        this._complete = true;
        return this;
      });
    }
    return this._promise;
  }
}

const inverse_matrix = mat4.create();

function setCap(gl, gl_enum, cap, prev_state, state) {
  let change = (state & cap) - (prev_state & cap);
  if (!change)
    return;

  if (change > 0) {
    gl.enable(gl_enum);
  } else {
    gl.disable(gl_enum);
  }
}

class RenderMaterialSampler {
  constructor(renderer, material_sampler, index) {
    this._renderer = renderer;
    this._uniform_name = material_sampler._uniform_name;
    this._texture = renderer._getRenderTexture(material_sampler._texture);
    this._index = index;
  }

  set texture(value) {
    this._texture = this._renderer._getRenderTexture(value);
  }
}

class RenderMaterialUniform {
  constructor(material_uniform) {
    this._uniform_name = material_uniform._uniform_name;
    this._uniform = null;
    this._length = material_uniform._length;
    if (material_uniform._value instanceof Array) {
      this._value = new Float32Array(material_uniform._value);
    } else {
      this._value = new Float32Array([material_uniform._value]);
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

class RenderMaterial {
  constructor(renderer, material, program) {
    this._program = program;
    this._state = material.state._state;

    this._sampler_dictionary = {};
    this._samplers = [];
    for (let i = 0; i < material._samplers.length; ++i) {
      let render_sampler = new RenderMaterialSampler(renderer, material._samplers[i], i);
      this._samplers.push(render_sampler);
      this._sampler_dictionary[render_sampler._uniform_name] = render_sampler;
    }

    this._uniform_dictionary = {};
    this._uniforms = [];
    for (let uniform of material._uniforms) {
      let render_uniform = new RenderMaterialUniform(uniform);
      this._uniforms.push(render_uniform);
      this._uniform_dictionary[render_uniform._uniform_name] = render_uniform;
    }

    this._complete_promise = null;
    this._first_bind = true;

    this._render_order = material.render_order;
    if (this._render_order == RENDER_ORDER.DEFAULT) {
      if (this._state & CAP.BLEND) {
        this._render_order = RENDER_ORDER.TRANSPARENT;
      } else {
        this._render_order = RENDER_ORDER.OPAQUE;
      }
    }
  }

  bind(gl) {
    // First time we do a binding, cache the uniform locations and remove
    // unused uniforms from the list.
    if (this._first_bind) {
      for (let i = 0; i < this._samplers.length;) {
        let sampler = this._samplers[i];
        if (!this._program.uniform[sampler._uniform_name]) {
          this._samplers.splice(i, 1);
          continue;
        }
        ++i;
      }

      for (let i = 0; i < this._uniforms.length;) {
        let uniform = this._uniforms[i];
        uniform._uniform = this._program.uniform[uniform._uniform_name];
        if (!uniform._uniform) {
          this._uniforms.splice(i, 1);
          continue;
        }
        ++i;
      }
      this._first_bind = false;
    }

    for (let sampler of this._samplers) {
      gl.activeTexture(gl.TEXTURE0 + sampler._index);
      if (sampler._texture) {
        //sampler._texture.bind(i);
        gl.bindTexture(gl.TEXTURE_2D, sampler._texture);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }

    for (let uniform of this._uniforms) {
      switch(uniform._length) {
        case 1: gl.uniform1fv(uniform._uniform, uniform._value); break;
        case 2: gl.uniform2fv(uniform._uniform, uniform._value); break;
        case 3: gl.uniform3fv(uniform._uniform, uniform._value); break;
        case 4: gl.uniform4fv(uniform._uniform, uniform._value); break;
      }
    }
  }

  waitForComplete() {
    if (!this._complete_promise) {
      if (this._samplers.length == 0) {
        this._complete_promise = Promise.resolve(this);
      } else {
        let promises = [];
        for (let sampler of this._samplers) {
          if (sampler._texture && !sampler._texture._complete) {
            promises.push(sampler._texture._promise);
          }
        }
        this._complete_promise = Promise.all(promises).then(() => this);
      }
    }
    return this._complete_promise;
  }

  // Material State fetchers
  get cull_face() { return !!(this._state & CAP.CULL_FACE); }
  get blend() { return !!(this._state & CAP.BLEND); }
  get depth_test() { return !!(this._state & CAP.DEPTH_TEST); }
  get stencil_test() { return !!(this._state & CAP.STENCIL_TEST); }
  get color_mask() { return !!(this._state & CAP.COLOR_MASK); }
  get depth_mask() { return !!(this._state & CAP.DEPTH_MASK); }
  get stencil_mask() { return !!(this._state & CAP.STENCIL_MASK); }
  get depth_func() { return ((this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT) + WebGLRenderingContext.NEVER; }
  get blend_func_src() { return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT); }
  get blend_func_dst() { return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT); }

  // Only really for use from the renderer
  _capsDiff(other_state) {
    return (other_state & MAT_STATE.CAPS_RANGE) ^ (this._state & MAT_STATE.CAPS_RANGE)
  }

  _blendDiff(other_state) {
    if (!(this._state & CAP.BLEND))
      return 0;
    return (other_state & MAT_STATE.BLEND_FUNC_RANGE) ^ (this._state & MAT_STATE.BLEND_FUNC_RANGE);
  }

  _depthFuncDiff(other_state) {
    if (!(this._state & CAP.DEPTH_TEST))
      return 0;
    return (other_state & MAT_STATE.DEPTH_FUNC_RANGE) ^ (this._state & MAT_STATE.DEPTH_FUNC_RANGE);
  }
}

export class Renderer {
  constructor(gl) {
    this._gl = gl || createWebGLContext();
    this._frame_id = -1;
    this._program_cache = {};
    this._texture_cache = {};
    this._render_primitives = Array(RENDER_ORDER.DEFAULT);
    this._camera_positions = [];

    this._vao_ext = gl.getExtension("OES_vertex_array_object");

    let frag_high_precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    this._default_frag_precision = frag_high_precision.precision > 0 ? 'highp' : 'mediump';

    this._depth_mask_needs_reset = false;
    this._color_mask_needs_reset = false;
  }

  get gl() {
    return this._gl;
  }

  createRenderBuffer(target, data, usage = WebGLRenderingContext.STATIC_DRAW) {
    let gl = this._gl;
    let gl_buffer = gl.createBuffer();

    if (data instanceof Promise) {
      let render_buffer = new RenderBuffer(target, usage, data.then((data) => {
        gl.bindBuffer(target, gl_buffer);
        gl.bufferData(target, data, usage);
        render_buffer._length = data.byteLength;
        return gl_buffer;
      }));
      return render_buffer;
    } else {
      gl.bindBuffer(target, gl_buffer);
      gl.bufferData(target, data, usage);
      return new RenderBuffer(target, usage, gl_buffer, data.byteLength);
    }
  }

  updateRenderBuffer(buffer, data, offset = 0) {
    if (buffer._buffer) {
      let gl = this._gl;
      gl.bindBuffer(buffer._target, buffer._buffer);
      if (offset == 0 && buffer._length == data.byteLength) {
        gl.bufferData(buffer._target, data, buffer._usage);
      } else {
        gl.bufferSubData(buffer._target, offset, data);
      }
    } else {
      buffer.waitForComplete().then((buffer) => {
        this.updateRenderBuffer(buffer, data, offset);
      });
    }
  }

  createRenderPrimitive(primitive, material) {
    let render_primitive = new RenderPrimitive(primitive);

    let program = this._getMaterialProgram(material, render_primitive);
    let render_material = new RenderMaterial(this, material, program);
    render_primitive.setRenderMaterial(render_material);

    if (!this._render_primitives[render_material._render_order]) {
      this._render_primitives[render_material._render_order] = [];
    }

    this._render_primitives[render_material._render_order].push(render_primitive);

    return render_primitive;
  }

  createMesh(primitive, material) {
    let mesh_node = new Node();
    mesh_node.addRenderPrimitive(this.createRenderPrimitive(primitive, material));
    return mesh_node;
  }

  drawViews(views, root_node) {
    if (!root_node) {
      return;
    }

    let gl = this._gl;
    this._frame_id++;

    root_node.markActive(this._frame_id);

    // If there's only one view then flip the algorithm a bit so that we're only
    // setting the viewport once.
    if (views.length == 1 && views[0].viewport) {
      let vp = views[0].viewport;
      this._gl.viewport(vp.x, vp.y, vp.width, vp.height);
    }

    // Get the positions of the 'camera' for each view matrix.
    for (let i = 0; i < views.length; ++i) {
      mat4.invert(inverse_matrix, views[i].view_matrix);

      if (this._camera_positions.length <= i) {
        this._camera_positions.push(vec3.create());
      }
      let camera_position = this._camera_positions[i];
      vec3.set(camera_position, 0, 0, 0);
      vec3.transformMat4(camera_position, camera_position, inverse_matrix);
    }

    // Draw each set of render primitives in order
    for (let render_primitives of this._render_primitives) {
      if (render_primitives && render_primitives.length) {
        this._drawRenderPrimitiveSet(views, render_primitives);
      }
    }

    if (this._vao_ext) {
      this._vao_ext.bindVertexArrayOES(null);
    }

    if (this._depth_mask_needs_reset) {
      gl.depthMask(true);
    }
    if (this._color_mask_needs_reset) {
      gl.colorMask(true, true, true, true);
    }
    
  }

  _drawRenderPrimitiveSet(views, render_primitives) {
    let gl = this._gl;
    let program = null;
    let material = null;
    let attrib_mask = 0;

    // Loop through every primitive known to the renderer.
    for (let primitive of render_primitives) {
      // Skip over those that haven't been marked as active for this frame.
      if (primitive._active_frame_id != this._frame_id) {
        continue;
      }

      // Bind the primitive material's program if it's different than the one we
      // were using for the previous primitive.
      // TODO: The ording of this could be more efficient.
      if (program != primitive._material._program) {
        program = primitive._material._program;
        program.use();

        if (program.uniform.LIGHT_DIRECTION)
          gl.uniform3fv(program.uniform.LIGHT_DIRECTION, DEF_LIGHT_DIR);

        if (program.uniform.LIGHT_COLOR)
          gl.uniform3fv(program.uniform.LIGHT_COLOR, DEF_LIGHT_COLOR);

        if (views.length == 1) {
          gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, views[0].projection_matrix);
          gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, views[0].view_matrix);
          gl.uniform3fv(program.uniform.CAMERA_POSITION, this._camera_positions[0]);
          gl.uniform1i(program.uniform.EYE_INDEX, views[0].eye_index);
        }
      }

      if (material != primitive._material) {
        this._bindMaterialState(primitive._material, material);
        primitive._material.bind(gl, program, material);
        material = primitive._material;
      }

      if (this._vao_ext) {
        if (primitive._vao) {
          this._vao_ext.bindVertexArrayOES(primitive._vao);
        } else {
          primitive._vao = this._vao_ext.createVertexArrayOES();
          this._vao_ext.bindVertexArrayOES(primitive._vao);
          this._bindPrimitive(primitive);
        }
      } else {
        this._bindPrimitive(primitive, attrib_mask);
        attrib_mask = primitive._attribute_mask;
      }

      for (let i = 0; i < views.length; ++i) {
        let view = views[i];
        if (views.length > 1) {
          if (view.viewport) {
            let vp = view.viewport;
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
          }
          gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, view.projection_matrix);
          gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, view.view_matrix);
          gl.uniform3fv(program.uniform.CAMERA_POSITION, this._camera_positions[i]);
          gl.uniform1i(program.uniform.EYE_INDEX, view.eye_index);
        }

        for (let instance of primitive._instances) {
          if (instance._active_frame_id != this._frame_id) {
            continue;
          }

          gl.uniformMatrix4fv(program.uniform.MODEL_MATRIX, false, instance.world_matrix);

          if (primitive._index_buffer) {
            gl.drawElements(primitive._mode, primitive._element_count,
                primitive._index_type, primitive._index_byte_offset);
          } else {
            gl.drawArrays(primitive._mode, 0, primitive._element_count);
          }
        }
      }
    }
  }

  _getRenderTexture(texture) {
    if (!texture) {
      return null;
    }

    let key = texture.texture_key;
    if (!key) {
      throw new Error("Texure does not have a valid key");
    }

    if (key in this._texture_cache) {
      return this._texture_cache[key];
    } else {
      let gl = this._gl;
      let texture_handle = gl.createTexture();
      this._texture_cache[key] = texture_handle;

      if (texture instanceof DataTexture) {
        gl.bindTexture(gl.TEXTURE_2D, texture_handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture._type, texture._data);
        this._setSamplerParameters(texture);
      } else {
        // Initialize the texture to black
        gl.bindTexture(gl.TEXTURE_2D, texture_handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, gl.UNSIGNED_BYTE, null);
        this._setSamplerParameters(texture);

        texture.waitForComplete().then(() => {
          gl.bindTexture(gl.TEXTURE_2D, texture_handle);
          gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
          this._setSamplerParameters(texture);

          if (texture instanceof VideoTexture) {
            // "Listen for updates" to the video frames and copy to the texture.
            function updateFrame() {
              if (!texture._video.paused && !texture._video.waiting) {
                gl.bindTexture(gl.TEXTURE_2D, texture_handle);
                gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
                window.setTimeout(updateFrame, 16); // TODO: UUUUUUUGGGGGGGHHHH!
              }
            }

            texture._video.addEventListener('playing', updateFrame);
          }
        });
      }

      return texture_handle;
    }
  }

  _setSamplerParameters(texture) {
    let gl = this._gl;

    let sampler = texture.sampler;
    let power_of_two = isPowerOfTwo(texture.width) && isPowerOfTwo(texture.height);
    let mipmap = power_of_two && texture.mipmap;
    if (mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    let min_filter = sampler.min_filter || (mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    let wrap_s = sampler.wrap_s || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    let wrap_t = sampler.wrap_t || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.mag_filter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t);
  }

  _getProgramKey(name, defines) {
    let key = `${name}:`;

    for (let define in defines) {
      key += `${define}=${defines[define]},`;
    }

    return key;
  }

  _getMaterialProgram(material, render_primitive) {
    let material_name = material.material_name;
    let vertex_source = material.vertex_source;
    let fragment_source = material.fragment_source;

    // These should always be defined for every material
    if (material_name == null) {
      throw new Error("Material does not have a name");
    }
    if (vertex_source == null) {
      throw new Error(`Material "${material_name}" does not have a vertex source`);
    }
    if (fragment_source == null) {
      throw new Error(`Material "${material_name}" does not have a fragment source`);
    }

    let defines = material.getProgramDefines(render_primitive);
    let key = this._getProgramKey(material_name, defines);

    if (key in this._program_cache) {
      return this._program_cache[key];
    } else {
      let multiview = false; // Handle this dynamically later
      let full_vertex_source = vertex_source;
      full_vertex_source += multiview ? VERTEX_SHADER_MULTI_ENTRY :
                                        VERTEX_SHADER_SINGLE_ENTRY;

      let precision_match = fragment_source.match(PRECISION_REGEX);
      let frag_precision_header = precision_match ? '' : `precision ${this._default_frag_precision} float;\n`;

      let full_fragment_source = frag_precision_header + fragment_source;
      full_fragment_source += FRAGMENT_SHADER_ENTRY;

      let program = new Program(this._gl, full_vertex_source, full_fragment_source, ATTRIB, defines);
      this._program_cache[key] = program;

      program.onNextUse((program) => {
        // Bind the samplers to the right texture index. This is constant for
        // the lifetime of the program.
        for (let i = 0; i < material._samplers.length; ++i) {
          let sampler = material._samplers[i];
          let uniform = program.uniform[sampler._uniform_name];
          if (uniform)
            this._gl.uniform1i(uniform, i);
        }
      });

      return program;
    }
  }

  _bindPrimitive(primitive, attrib_mask) {
    let gl = this._gl;

    // If the active attributes have changed then update the active set.
    if (attrib_mask != primitive._attribute_mask) {
      for (let attrib in ATTRIB) {
        if (primitive._attribute_mask & ATTRIB_MASK[attrib]) {
          gl.enableVertexAttribArray(ATTRIB[attrib]);
        } else {
          gl.disableVertexAttribArray(ATTRIB[attrib]);
        }
      }
    }

    // Bind the primitive attributes and indices.
    for (let attribute_buffer of primitive._attribute_buffers) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attribute_buffer._buffer._buffer);
      for (let attrib of attribute_buffer._attributes) {
        gl.vertexAttribPointer(
            attrib._attrib_index, attrib._component_count, attrib._component_type,
            attrib._normalized, attrib._stride, attrib._byte_offset);
      }
    }

    if (primitive._index_buffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive._index_buffer._buffer);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  }

  _bindMaterialState(material, prev_material = null) {
    let gl = this._gl;

    let state = material._state;
    let prev_state = prev_material ? prev_material._state : ~state;

    // Return early if both materials use identical state
    if (state == prev_state)
        return;

    // Any caps bits changed?
    if (material._capsDiff(prev_state)) {
      setCap(gl, gl.CULL_FACE, CAP.CULL_FACE, prev_state, state);
      setCap(gl, gl.BLEND, CAP.BLEND, prev_state, state);
      setCap(gl, gl.DEPTH_TEST, CAP.DEPTH_TEST, prev_state, state);
      setCap(gl, gl.STENCIL_TEST, CAP.STENCIL_TEST, prev_state, state);

      let color_mask_change = (state & CAP.COLOR_MASK) - (prev_state & CAP.COLOR_MASK);
      if (color_mask_change) {
        let mask = color_mask_change > 1;
        this._color_mask_needs_reset = !mask;
        gl.colorMask(mask, mask, mask, mask);
      }

      let depth_mask_change = (state & CAP.DEPTH_MASK) - (prev_state & CAP.DEPTH_MASK);
      if (depth_mask_change) {
        this._depth_mask_needs_reset = !(depth_mask_change > 1);
        gl.depthMask(depth_mask_change > 1);
      }

      let stencil_mask_change = (state & CAP.STENCIL_MASK) - (prev_state & CAP.STENCIL_MASK);
      if (stencil_mask_change) {
        gl.stencilMask(stencil_mask_change > 1);
      }
    }

    // Blending enabled and blend func changed?
    if (material._blendDiff(prev_state)) {
      gl.blendFunc(material.blend_func_src, material.blend_func_dst);
    }

    // Depth testing enabled and depth func changed?
    if (material._depthFuncDiff(prev_state)) {
      gl.depthFunc(material.depth_func);
    }
  }
}