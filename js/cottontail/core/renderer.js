// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { CAP } from './material.js'
import { Node, MeshNode } from './node.js'
import { Program } from './program.js'
import { TextureCache } from './texture.js'

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
    this.eye = eye;
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
  constructor(primitive, material) {
    this._mode = primitive.mode;
    this._element_count = primitive.element_count;
    this._instances = [];
    this._program = null;
    this._vao = null;

    this._complete = false;
    let completion_promises = [];

    this._material = material;
    completion_promises.push(material.waitForComplete());

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
        if (!attribute.buffer._buffer) {
          completion_promises.push(attribute.buffer._promise);
        }
      }
    }

    this._index_buffer = null;
    this._index_byte_offset = 0;
    this._index_type = 0;

    if (primitive.index_buffer) {
      this._index_byte_offset = primitive.index_byte_offset;
      this._index_type = primitive.index_type;
      this._index_buffer = primitive.index_buffer;
      if (primitive.index_buffer._promise) {
        completion_promises.push(primitive.index_buffer._promise);
      }
    }

    this._promise = Promise.all(completion_promises).then(() => {
      this._complete = true;
      return this;
    });
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

  waitForComplete() {
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

export class Renderer {
  constructor(gl) {
    this._gl = gl || createWebGLContext();
    this._frame_id = -1;
    this._program_cache = {};
    this._render_primitives = [];
    this._camera_positions = [];

    this._vao_ext = gl.getExtension("OES_vertex_array_object");

    this.texture_cache = new TextureCache(gl);

    let frag_high_precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    this._default_frag_precision = frag_high_precision.precision > 0 ? 'highp' : 'mediump';
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
    let render_material = new material.render_material_type(material);
    let render_primitive = new RenderPrimitive(primitive, render_material);

    render_primitive._program = this._getRenderMaterialProgram(render_material, render_primitive);

    if (this._vao_ext) {
      render_primitive.waitForComplete().then(() => {
        render_primitive._vao = this._vao_ext.createVertexArrayOES();
        this._vao_ext.bindVertexArrayOES(render_primitive._vao);
        this._bindPrimitive(render_primitive);
        this._vao_ext.bindVertexArrayOES(null);
        // TODO: Get rid of the buffer/attribute data on the RenderPrimitive when
        // it has a VAO?
        // render_primitive._attribute_buffers = null;
      });
    }

    this._render_primitives.push(render_primitive);

    return render_primitive;
  }

  createMesh(primitive, material) {
    return new MeshNode(this.createRenderPrimitive(primitive, material));
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
      gl.viewport(vp.x, vp.y, vp.width, vp.height);
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

    let program = null;
    let material = null;
    let attrib_mask = 0;

    // Loop through every primitive known to the renderer.
    for (let primitive of this._render_primitives) {
      // Skip over those that haven't been marked as active for this frame.
      if (primitive._active_frame_id != this._frame_id) {
        continue;
      }

      // Bind the primitive's program if it's different than the one we were
      // using for the previous primitive.
      // TODO: The ording of this could be more efficient.
      if (program != primitive._program) {
        program = primitive._program;
        program.use();

        gl.uniform3fv(program.uniform.lightDir, DEF_LIGHT_DIR);
        gl.uniform3fv(program.uniform.lightColor, DEF_LIGHT_COLOR);

        if (views.length == 1) {
          gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, views[0].projection_matrix);
          gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, views[0].view_matrix);
          gl.uniform3fv(program.uniform.CAMERA_POSITION, this._camera_positions[0]);
        }
      }

      if (material != primitive._material) {
        this._bindMaterialState(primitive._material, material);
        primitive._material.bind(gl, program, material);
        material = primitive._material;
      }

      if (primitive._vao) {
        this._vao_ext.bindVertexArrayOES(primitive._vao);
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

    if (this._vao_ext) {
      this._vao_ext.bindVertexArrayOES(null);
    }
  }

  _getRenderMaterialProgram(render_material, render_primitive) {
    let defines = render_material.getProgramDefines(render_primitive);
    let key = `${render_material.material_name}_${render_material.getProgramKey(defines)}`;

    if (key in this._program_cache) {
      return this._program_cache[key];
    } else {
      let multiview = false; // Handle this dynamically later
      let full_vertex_source = render_material.vertex_source;
      full_vertex_source += multiview ? VERTEX_SHADER_MULTI_ENTRY :
                                        VERTEX_SHADER_SINGLE_ENTRY;

      let precision_match = render_material.fragment_source.match(PRECISION_REGEX);
      let frag_precision_header = precision_match ? '' : `precision ${this._default_frag_precision} float;\n`;

      let full_fragment_source = frag_precision_header + render_material.fragment_source;
      full_fragment_source += FRAGMENT_SHADER_ENTRY;

      let program = new Program(this._gl,
          full_vertex_source, full_fragment_source, ATTRIB, defines);
      this._program_cache[key] = program;
      program.onFirstUse().then((program) => {
        this._gl.useProgram(program.program);
        render_material.onFirstProgramUse(this._gl, program);
      });
      return program;
    }
  }

  _bindPrimitive(primitive, attrib_mask) {
    let gl = this._gl;

    // If the active attributes have changed then update the active set.
    if (attrib_mask != primitive._attribute_mask) {
      for (let attrib in ATTRIB) {
        let attrib_index = ATTRIB[attrib];
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
        gl.colorMask(mask, mask, mask, mask);
      }

      let depth_mask_change = (state & CAP.DEPTH_MASK) - (prev_state & CAP.DEPTH_MASK);
      if (depth_mask_change) {
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
  }
}