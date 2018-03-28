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

import { Material, RENDER_ORDER } from '../core/material.js'
import { Node } from '../core/node.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { DataTexture } from '../core/texture.js'

const GL = WebGLRenderingContext; // For enums

// Laser texture data, 48x1 RGBA (not premultiplied alpha). This represents a
// "cross section" of the laser beam with a bright core and a feathered edge.
// Borrowed from Chromium source code.
const LASER_TEXTURE_DATA = new Uint8Array([
0xff,0xff,0xff,0x01,0xff,0xff,0xff,0x02,0xbf,0xbf,0xbf,0x04,0xcc,0xcc,0xcc,0x05,
0xdb,0xdb,0xdb,0x07,0xcc,0xcc,0xcc,0x0a,0xd8,0xd8,0xd8,0x0d,0xd2,0xd2,0xd2,0x11,
0xce,0xce,0xce,0x15,0xce,0xce,0xce,0x1a,0xce,0xce,0xce,0x1f,0xcd,0xcd,0xcd,0x24,
0xc8,0xc8,0xc8,0x2a,0xc9,0xc9,0xc9,0x2f,0xc9,0xc9,0xc9,0x34,0xc9,0xc9,0xc9,0x39,
0xc9,0xc9,0xc9,0x3d,0xc8,0xc8,0xc8,0x41,0xcb,0xcb,0xcb,0x44,0xee,0xee,0xee,0x87,
0xfa,0xfa,0xfa,0xc8,0xf9,0xf9,0xf9,0xc9,0xf9,0xf9,0xf9,0xc9,0xfa,0xfa,0xfa,0xc9,
0xfa,0xfa,0xfa,0xc9,0xf9,0xf9,0xf9,0xc9,0xf9,0xf9,0xf9,0xc9,0xfa,0xfa,0xfa,0xc8,
0xee,0xee,0xee,0x87,0xcb,0xcb,0xcb,0x44,0xc8,0xc8,0xc8,0x41,0xc9,0xc9,0xc9,0x3d,
0xc9,0xc9,0xc9,0x39,0xc9,0xc9,0xc9,0x34,0xc9,0xc9,0xc9,0x2f,0xc8,0xc8,0xc8,0x2a,
0xcd,0xcd,0xcd,0x24,0xce,0xce,0xce,0x1f,0xce,0xce,0xce,0x1a,0xce,0xce,0xce,0x15,
0xd2,0xd2,0xd2,0x11,0xd8,0xd8,0xd8,0x0d,0xcc,0xcc,0xcc,0x0a,0xdb,0xdb,0xdb,0x07,
0xcc,0xcc,0xcc,0x05,0xbf,0xbf,0xbf,0x04,0xff,0xff,0xff,0x02,0xff,0xff,0xff,0x01,
]);

const LASER_LENGTH = 1.0;
const LASER_DIAMETER = 0.01;
const LASER_FADE_END = 0.535;
const LASER_FADE_POINT = 0.5335;
const LASER_DEFAULT_COLOR = [1.0, 1.0, 1.0, 0.25];

const CURSOR_RADIUS = 0.004;
const CURSOR_SHADOW_RADIUS = 0.007;
const CURSOR_SHADOW_INNER_LUMINANCE = 0.5;
const CURSOR_SHADOW_OUTER_LUMINANCE = 0.0;
const CURSOR_SHADOW_INNER_OPACITY = 0.75;
const CURSOR_SHADOW_OUTER_OPACITY = 0.0;
const CURSOR_OPACITY = 0.9;
const CURSOR_SEGMENTS = 16;
const CURSOR_DEFAULT_COLOR = [1.0, 1.0, 1.0, 1.0];
const CURSOR_DEFAULT_HIDDEN_COLOR = [0.5, 0.5, 0.5, 0.25];

const DEFAULT_RESET_OPTIONS = {
  controllers: true,
  lasers: true,
  cursors: true
};

class LaserMaterial extends Material {
  constructor() {
    super();
    this.render_order = RENDER_ORDER.ADDITIVE;
    this.state.cull_face = false;
    this.state.blend = true;
    this.state.blend_func_src = GL.ONE;
    this.state.blend_func_dst = GL.ONE;
    this.state.depth_mask = false;

    this.laser = this.defineSampler("diffuse");
    this.laser.texture = new DataTexture(LASER_TEXTURE_DATA, 48, 1);
    this.laser_color = this.defineUniform("laserColor", LASER_DEFAULT_COLOR);
  }

  get material_name() {
    return 'INPUT_LASER';
  }

  get vertex_source() {
    return `
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;

    varying vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vTexCoord = TEXCOORD_0;
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragment_source() {
    return `
    precision mediump float;

    uniform vec4 laserColor;
    uniform sampler2D diffuse;
    varying vec2 vTexCoord;

    const float fade_point = ${LASER_FADE_POINT};
    const float fade_end = ${LASER_FADE_END};

    vec4 fragment_main() {
      vec2 uv = vTexCoord;
      float front_fade_factor = 1.0 - clamp(1.0 - (uv.y - fade_point) / (1.0 - fade_point), 0.0, 1.0);
      float back_fade_factor = clamp((uv.y - fade_point) / (fade_end - fade_point), 0.0, 1.0);
      vec4 color = laserColor * texture2D(diffuse, vTexCoord);
      float opacity = color.a * front_fade_factor * back_fade_factor;
      return vec4(color.rgb * opacity, opacity);
    }`;
  }
}

const CURSOR_VERTEX_SHADER = `
attribute vec4 POSITION;

varying float vLuminance;
varying float vOpacity;

vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
  vLuminance = POSITION.z;
  vOpacity = POSITION.w;

  // Billboarded, constant size vertex transform.
  vec4 screenPos = proj * view * model * vec4(0.0, 0.0, 0.0, 1.0);
  screenPos /= screenPos.w;
  screenPos.xy += POSITION.xy;
  return screenPos;
}`;

const CURSOR_FRAGMENT_SHADER = `
precision mediump float;

uniform vec4 cursorColor;
varying float vLuminance;
varying float vOpacity;

vec4 fragment_main() {
  vec3 color = cursorColor.rgb * vLuminance;
  float opacity = cursorColor.a * vOpacity;
  return vec4(color * opacity, opacity);
}`;

// Cursors are drawn as billboards that always face the camera and are rendered
// as a fixed size no matter how far away they are.
class CursorMaterial extends Material {
  constructor() {
    super();
    this.render_order = RENDER_ORDER.ADDITIVE;
    this.state.cull_face = false;
    this.state.blend = true;
    this.state.blend_func_src = GL.ONE;
    this.state.depth_mask = false;

    this.cursor_color = this.defineUniform("cursorColor", CURSOR_DEFAULT_COLOR);
  }

  get material_name() {
    return 'INPUT_CURSOR';
  }

  get vertex_source() {
    return CURSOR_VERTEX_SHADER;
  }

  get fragment_source() {
    return CURSOR_FRAGMENT_SHADER;
  }
}

class CursorHiddenMaterial extends Material {
  constructor() {
    super();
    this.render_order = RENDER_ORDER.ADDITIVE;
    this.state.cull_face = false;
    this.state.blend = true;
    this.state.blend_func_src = GL.ONE;
    this.state.depth_func = GL.GEQUAL;
    this.state.depth_mask = false;

    this.cursor_color = this.defineUniform("cursorColor", CURSOR_DEFAULT_HIDDEN_COLOR);
  }

  // TODO: Rename to "program_name"
  get material_name() {
    return 'INPUT_CURSOR_2';
  }

  get vertex_source() {
    return CURSOR_VERTEX_SHADER;
  }

  get fragment_source() {
    return CURSOR_FRAGMENT_SHADER;
  }
}

export class InputRenderer extends Node {
  constructor() {
    super();

    this._max_input_elements = 32;

    this._controllers = [];
    this._controller_node = null;
    this._controller_node_handedness = null;
    this._lasers = null;
    this._cursors = null;

    this._active_controllers = 0;
    this._active_lasers = 0;
    this._active_cursors = 0;
  }

  onRendererChanged(renderer) {
    this._controllers = [];
    this._controller_node = null;
    this._controller_node_handedness = null;
    this._lasers = null;
    this._cursors = null;

    this._active_controllers = 0;
    this._active_lasers = 0;
    this._active_cursors = 0;
  }

  setControllerMesh(controller_node, handedness = 'right') {
    this._controller_node = controller_node;
    this._controller_node_handedness = handedness;
  }

  addController(grip_matrix) {
    if (!this._controller_node) {
        return;
    }

    let controller = null;
    if (this._active_controllers < this._controllers.length) {
      controller = this._controllers[this._active_controllers];
    } else {
      controller = this._controller_node.clone();
      this.addNode(controller);
      this._controllers.push(controller);
    }
    this._active_controllers = (this._active_controllers + 1) % this._max_input_elements;

    controller.matrix = grip_matrix;
    controller.visible = true;
  }

  addLaserPointer(pointer_matrix) {
    // Create the laser pointer mesh if needed.
    if (!this._lasers && this._renderer) {
      this._lasers = [this._createLaserMesh()];
      this.addNode(this._lasers[0]);
    }

    let laser = null;
    if (this._active_lasers < this._lasers.length) {
      laser = this._lasers[this._active_lasers];
    } else {
      laser = this._lasers[0].clone();
      this.addNode(laser);
      this._lasers.push(laser);
    }
    this._active_lasers = (this._active_lasers + 1) % this._max_input_elements;

    laser.matrix = pointer_matrix;
    laser.visible = true;
  }

  addCursor(cursor_pos) {
    // Create the cursor mesh if needed.
    if (!this._cursors && this._renderer) {
      this._cursors = [this._createCursorMesh()];
      this.addNode(this._cursors[0]);
    }

    let cursor = null;
    if (this._active_cursors < this._cursors.length) {
      cursor = this._cursors[this._active_cursors];
    } else {
      cursor = this._cursors[0].clone();
      this.addNode(cursor);
      this._cursors.push(cursor);
    }
    this._active_cursors = (this._active_cursors + 1) % this._max_input_elements;

    cursor.translation = cursor_pos;
    cursor.visible = true;
  }

  reset(options) {
    if (!options) {
      options = DEFAULT_RESET_OPTIONS;
    }
    if (this._controllers && options.controllers) {
      for (let controller of this._controllers) {
        controller.visible = false;
      }
      this._active_controllers = 0;
    }
    if (this._lasers && options.lasers) {
      for (let laser of this._lasers) {
        laser.visible = false;
      }
      this._active_lasers = 0;
    }
    if (this._cursors && options.cursors) {
      for (let cursor of this._cursors) {
        cursor.visible = false;
      }
      this._active_cursors = 0;
    }
  }

  _createLaserMesh() {
    let gl = this._renderer._gl;

    let lr = LASER_DIAMETER * 0.5;
    let ll = LASER_LENGTH;

    // Laser is rendered as cross-shaped beam
    let laser_verts = [
    //X    Y     Z     U    V
      0.0,  lr, 0.0,  0.0, 1.0,
      0.0,  lr, -ll,  0.0, 0.0,
      0.0, -lr, 0.0,  1.0, 1.0,
      0.0, -lr, -ll,  1.0, 0.0,

       lr, 0.0, 0.0,  0.0, 1.0,
       lr, 0.0, -ll,  0.0, 0.0,
      -lr, 0.0, 0.0,  1.0, 1.0,
      -lr, 0.0, -ll,  1.0, 0.0,

      0.0, -lr, 0.0,  0.0, 1.0,
      0.0, -lr, -ll,  0.0, 0.0,
      0.0,  lr, 0.0,  1.0, 1.0,
      0.0,  lr, -ll,  1.0, 0.0,

      -lr, 0.0, 0.0,  0.0, 1.0,
      -lr, 0.0, -ll,  0.0, 0.0,
       lr, 0.0, 0.0,  1.0, 1.0,
       lr, 0.0, -ll,  1.0, 0.0,
    ];
    let laser_indices = [
      0, 1, 2, 1, 3, 2,
      4, 5, 6, 5, 7, 6,
      8, 9, 10, 9, 11, 10,
      12, 13, 14, 13, 15, 14,
    ];
  
    let laser_vertex_buffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(laser_verts));
    let laser_index_buffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(laser_indices));

    let laser_index_count = laser_indices.length;

    let laser_attribs = [
      new PrimitiveAttribute("POSITION", laser_vertex_buffer, 3, gl.FLOAT, 20, 0),
      new PrimitiveAttribute("TEXCOORD_0", laser_vertex_buffer, 2, gl.FLOAT, 20, 12),
    ];
  
    let laser_primitive = new Primitive(laser_attribs, laser_index_count);
    laser_primitive.setIndexBuffer(laser_index_buffer);

    let laser_material = new LaserMaterial();

    let laser_render_primitive = this._renderer.createRenderPrimitive(laser_primitive, laser_material);
    let mesh_node = new Node();
    mesh_node.addRenderPrimitive(laser_render_primitive);
    return mesh_node;
  }

  _createCursorMesh() {
    let gl = this._renderer._gl;

    let cr = CURSOR_RADIUS;

    // Cursor is a circular white dot with a dark "shadow" skirt around the edge
    // that fades from black to transparent as it moves out from the center.
    // Cursor verts are packed as [X, Y, Luminance, Opacity]
    let cursor_verts = [];
    let cursor_indices = [];

    let seg_rad = (2.0 * Math.PI) / CURSOR_SEGMENTS;

    // Cursor center
    for (let i = 0; i < CURSOR_SEGMENTS; ++i) {
      let rad = i * seg_rad;
      let x = Math.cos(rad);
      let y = Math.sin(rad);
      cursor_verts.push(x * CURSOR_RADIUS, y * CURSOR_RADIUS, 1.0, CURSOR_OPACITY);

      if (i > 1) {
        cursor_indices.push(0, i-1, i);
      }
    }

    let index_offset = CURSOR_SEGMENTS;

    // Cursor Skirt
    for (let i = 0; i < CURSOR_SEGMENTS; ++i) {
      let rad = i * seg_rad;
      let x = Math.cos(rad);
      let y = Math.sin(rad);
      cursor_verts.push(x * CURSOR_RADIUS, y * CURSOR_RADIUS,
          CURSOR_SHADOW_INNER_LUMINANCE, CURSOR_SHADOW_INNER_OPACITY);
      cursor_verts.push(x * CURSOR_SHADOW_RADIUS, y * CURSOR_SHADOW_RADIUS,
          CURSOR_SHADOW_OUTER_LUMINANCE, CURSOR_SHADOW_OUTER_OPACITY);

      if (i > 0) {
        let idx = index_offset + (i * 2);
        cursor_indices.push(idx-2, idx-1, idx);
        cursor_indices.push(idx-1, idx+1, idx);
      }
    }

    let idx = index_offset + (CURSOR_SEGMENTS * 2);
    cursor_indices.push(idx-2, idx-1, index_offset);
    cursor_indices.push(idx-1, index_offset+1, index_offset);

    let cursor_vertex_buffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(cursor_verts));
    let cursor_index_buffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cursor_indices));

    let cursor_index_count = cursor_indices.length;

    let cursor_attribs = [
      new PrimitiveAttribute("POSITION", cursor_vertex_buffer, 4, gl.FLOAT, 16, 0),
    ];
  
    let cursor_primitive = new Primitive(cursor_attribs, cursor_index_count);
    cursor_primitive.setIndexBuffer(cursor_index_buffer);

    let cursor_material = new CursorMaterial();
    let cursor_hidden_material = new CursorHiddenMaterial();

    // Cursor renders two parts: The bright opaque cursor for areas where it's
    // not obscured and a more transparent, darker version for areas where it's
    // behind another object.
    let cursor_render_primitive = this._renderer.createRenderPrimitive(cursor_primitive, cursor_material);
    let cursor_hidden_render_primitive = this._renderer.createRenderPrimitive(cursor_primitive, cursor_hidden_material);
    let mesh_node = new Node();
    mesh_node.addRenderPrimitive(cursor_render_primitive);
    mesh_node.addRenderPrimitive(cursor_hidden_render_primitive);
    return mesh_node;
  }
}