// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { MaterialProgramCache } from './material.js'
import { Node, MeshNode } from './node.js'
import { Program } from './program.js'
import { TextureCache } from './texture.js'

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

class RenderPrimitive {
  constructor(primitive, material, program) {
    this.primitive = primitive;
    this.material = material;
    this.program = program;
    this._instances = [];
  }

  markActive(frame_id) {
    this._active_frame_id = frame_id;

    if (this.material) {
      this.material.markActive(frame_id);
    }

    if (this.program) {
      this.program.markActive(frame_id);
    }
  }
}

const inverse_matrix = mat4.create();

export class Renderer {
  constructor(gl) {
    this._gl = gl;
    this._frame_id = -1;
    this._program_cache = new MaterialProgramCache(gl);
    this._render_primitives = [];
    this._camera_positions = [];

    this.texture_cache = new TextureCache(gl);
  }

  createRenderPrimitive(primitive, material) {
    let program = this._program_cache.getProgram(material, primitive);
    let render_primitive = new RenderPrimitive(primitive, material, program);
    this._render_primitives.push(render_primitive);
    return render_primitive;
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

    // Loop through every primitive known to the renderer.
    for (let render_primitive of this._render_primitives) {
      let primitive = render_primitive.primitive;
      // Skip over those that haven't been marked as active for this frame.
      if (render_primitive._active_frame_id != this._frame_id) {
        continue;
      }

      // Bind the primitive's program if it's different than the one we were
      // using for the previous primitive.
      // TODO: The ording of this could be more efficient.
      if (program != render_primitive.program) {
        program = render_primitive.program;
        program.use();

        gl.uniform3fv(program.uniform.lightDir, DEF_LIGHT_DIR);
        gl.uniform3fv(program.uniform.lightColor, DEF_LIGHT_COLOR);

        if (views.length == 1) {
          gl.uniformMatrix4fv(program.uniform.proj, false, views[0].projection_matrix);
          gl.uniformMatrix4fv(program.uniform.view, false, views[0].view_matrix);
          gl.uniform3fv(program.uniform.cameraPos, this._camera_positions[0]);
        }
      }

      render_primitive.material.bind(gl, program);

      // TODO: Blerg. Do this better.
      gl.disableVertexAttribArray(1);
      gl.disableVertexAttribArray(2);
      gl.disableVertexAttribArray(3);
      gl.disableVertexAttribArray(4);
      gl.disableVertexAttribArray(5);
      gl.disableVertexAttribArray(6);

      // Bind the primitive attributes and indices.
      for (let buffer of primitive._attribute_buffers) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
        for (let attrib of buffer.attributes) {
          gl.enableVertexAttribArray(attrib.attrib_index);
          gl.vertexAttribPointer(
              attrib.attrib_index, attrib.component_count, attrib.component_type,
              attrib.normalized, attrib.stride, attrib.byte_offset);
        }
      }

      if (primitive.index_buffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.index_buffer);
      }

      for (let i = 0; i < views.length; ++i) {
        let view = views[i];
        if (views.length > 1) {
          if (view.viewport) {
            let vp = view.viewport;
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
          }
          gl.uniformMatrix4fv(program.uniform.proj, false, view.projection_matrix);
          gl.uniformMatrix4fv(program.uniform.view, false, view.view_matrix);
          gl.uniform3fv(program.uniform.cameraPos, this._camera_positions[i]);
        }

        for (let instance of render_primitive._instances) {
          if (instance._active_frame_id != this._frame_id) {
            continue;
          }

          gl.uniformMatrix4fv(program.uniform.model, false, instance.world_matrix);

          if (primitive.index_buffer) {
            gl.drawElements(primitive.mode, primitive.element_count,
                primitive.index_type, primitive.index_byte_offset);
          } else {
            gl.drawArrays(primitive.mode, 0, primitive.element_count);
          }
        }
      }
    }
  }
}