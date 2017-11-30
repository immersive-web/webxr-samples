// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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

export class View {
  constructor(view, pose, layer) {
    this.projection_matrix = view ? view.projectionMatrix : null;
    this.view_matrix = (pose && view) ? pose.getViewMatrix(view) : null;
    this.viewport = (layer && view) ? view.getViewport(layer) : null;
    // If an eye isn't given just assume the left eye.
    this.eye = view ? view.eye : 'left';
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
  constructor(buffer_promise) {
    this._buffer = null;
    buffer_promise.then((buffer) => {
      this._buffer = buffer;
    });

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
        if (attribute_buffer.buffer == attribute.buffer ||
            attribute_buffer._promise == attribute.buffer) {
          attribute_buffer.attributes.push(attribute);
          found_buffer = true;
          break;
        }
      }
      if (!found_buffer) {
        let attribute_buffer = new RenderPrimitiveAttributeBuffer(attribute.buffer);
        attribute_buffer._attributes.push(render_attribute);
        this._attribute_buffers.push(attribute_buffer);
        completion_promises.push(attribute.buffer);
      }
    }

    this._index_buffer = null;
    this._index_byte_offset = 0;
    this._index_type = 0;
    this._index_promise = null;

    if (primitive.index_buffer) {
      this._index_byte_offset = primitive.index_byte_offset;
      this._index_type = primitive.index_type;
      if (primitive.index_buffer instanceof Promise) {
        this._index_complete = false;
        this._index_promise = primitive.index_buffer;
        this._index_promise.then((buffer) => {
          this._index_buffer = buffer;
        });
        completion_promises.push(this._index_promise);
      } else {
        this._index_buffer = primitive.index_buffer;
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

export class Renderer {
  constructor(gl) {
    this._gl = gl;
    this._frame_id = -1;
    this._program_cache = {};
    this._render_primitives = [];
    this._camera_positions = [];

    this._vao_ext = gl.getExtension("OES_vertex_array_object");

    this.texture_cache = new TextureCache(gl);
  }

  createRenderBuffer(target, data) {
    let gl = this._gl;
    let render_buffer = gl.createBuffer();

    if (data instanceof Promise) {
      return data.then((data) => {
        gl.bindBuffer(target, render_buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        return render_buffer;
      });
    } else {
      gl.bindBuffer(target, render_buffer);
      gl.bufferData(target, data, gl.STATIC_DRAW);
      return Promise.resolve(render_buffer);
    }
  }

  createRenderPrimitive(primitive, material) {
    let render_material = new material.render_material_type(material);
    let render_primitive = new RenderPrimitive(primitive, render_material);

    let defines = render_material.getProgramDefines(render_primitive);
    let key = `${render_material.material_name}_${render_material.getProgramKey(defines)}`;

    if (key in this._program_cache) {
      render_primitive._program = this._program_cache[key];
    } else {
      render_primitive._program = new Program(this._gl,
        render_material.vertex_source,
        render_material.fragment_source,
        ATTRIB,
        defines);
      this._program_cache[key] = render_primitive._program;
      render_primitive._program.onFirstUse().then((program) => {
        this._gl.useProgram(program.program);
        render_material.onFirstProgramUse(this._gl, program);
      });
    }

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

      primitive._material.bind(gl, program);

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
      gl.bindBuffer(gl.ARRAY_BUFFER, attribute_buffer._buffer);
      for (let attrib of attribute_buffer._attributes) {
        gl.vertexAttribPointer(
            attrib._attrib_index, attrib._component_count, attrib._component_type,
            attrib._normalized, attrib._stride, attrib._byte_offset);
      }
    }

    if (primitive._index_buffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive._index_buffer);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  }
}