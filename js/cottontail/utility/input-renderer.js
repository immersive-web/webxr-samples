// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Material, RenderMaterial } from '../core/material.js'
import { MeshNode } from '../core/node.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'

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
const LASER_DEFAULT_COLOR = new Float32Array([1.0, 1.0, 1.0, 0.25]);

const LASER_VERTEX_SOURCE = `
  attribute vec3 POSITION;
  attribute vec2 TEXCOORD_0;

  uniform mat4 PROJECTION_MATRIX;
  uniform mat4 VIEW_MATRIX;
  uniform mat4 MODEL_MARTIX;
  
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = TEXCOORD_0;
    gl_Position = PROJECTION_MATRIX * VIEW_MATRIX * MODEL_MARTIX * vec4(POSITION, 1.0);
  }
`;

const LASER_FRAGMENT_SOURCE = `
  precision mediump float;
  uniform sampler2D diffuse;
  uniform vec4 laserColor;
  varying vec2 vTexCoord;

  const float fade_point = ${LASER_FADE_POINT};
  const float fade_end = ${LASER_FADE_END};

  void main() {
    vec2 uv = vTexCoord;
    float front_fade_factor = 1.0 - clamp(1.0 - (uv.y - fade_point) / (1.0 - fade_point), 0.0, 1.0);
    float back_fade_factor = clamp((uv.y - fade_point) / (fade_end - fade_point), 0.0, 1.0);
    vec4 color = laserColor * texture2D(diffuse, vTexCoord);
    float opacity = color.a * front_fade_factor * back_fade_factor;
    gl_FragColor = vec4(color.rgb * opacity, opacity);
  }
`;

const CURSOR_RADIUS = 0.005;
const CURSOR_SHADOW_RADIUS = 0.008;
const CURSOR_SHADOW_INNER_LUMINANCE = 0.5;
const CURSOR_SHADOW_OUTER_LUMINANCE = 0.0;
const CURSOR_SHADOW_INNER_OPACITY = 0.75;
const CURSOR_SHADOW_OUTER_OPACITY = 0.0;
const CURSOR_OPACITY = 0.9;
const CURSOR_SEGMENTS = 16;
const CURSOR_DEFAULT_COLOR = new Float32Array([1.0, 1.0, 1.0, 1.0]);

// Cursors are drawn as billboards that always face the camera and are rendered
// as a fixed size no matter how far away they are.
const CURSOR_VERTEX_SOURCE = `
  attribute vec4 POSITION;

  uniform mat4 PROJECTION_MATRIX;
  uniform mat4 VIEW_MATRIX;
  uniform mat4 MODEL_MATRIX;
  
  varying float vLuminance;
  varying float vOpacity;

  void main() {
    vLuminance = POSITION.z;
    vOpacity = POSITION.w;

    // Billboarded, constant size vertex transform.
    vec4 screenPos = PROJECTION_MATRIX * VIEW_MATRIX * MODEL_MATRIX * vec4(0.0, 0.0, 0.0, 1.0);
    screenPos /= screenPos.w;
    screenPos.xy += POSITION.xy;
    gl_Position = screenPos;
  }
`;

const CURSOR_FRAGMENT_SOURCE = `
  precision mediump float;
  uniform vec4 cursorColor;
  varying float vLuminance;
  varying float vOpacity;

  void main() {
    vec3 color = cursorColor.rgb * vLuminance;
    float opacity = cursorColor.a * vOpacity;
    gl_FragColor = vec4(color * opacity, opacity);
  }
`;

class LaserMaterial extends Material {
  constructor() {
    super();
    this.double_sided = true;

    this.laser_texture = null;
  }

  get render_material_type() {
    return LaserRenderMaterial;
  }
}

class LaserRenderMaterial extends RenderMaterial {
  constructor(material) {
    super(material);

    this._laser_texture = material.laser_texture;
  }

  get material_name() {
    return '__LASER';
  }

  get vertex_source() {
    return LASER_VERTEX_SOURCE;
  }

  get fragment_source() {
    return LASER_FRAGMENT_SOURCE;
  }

  bind(gl, program) {
    super.bind(gl, program);

    // Bind all appropriate textures
    if (this._laser_texture) {
      this._laser_texture.bind(0);
    }
  }

  onFirstProgramUse(gl, program) {
    gl.uniform1i(program.uniform.diffuse, 0);
  }
}

class CursorMaterial extends Material {
  constructor() {
    super();
    this.double_sided = true;
  }

  get render_material_type() {
    return CursorRenderMaterial;
  }
}

class CursorRenderMaterial extends RenderMaterial {
  constructor(material) {
    super(material);
  }

  get material_name() {
    return '__CURSOR';
  }

  get vertex_source() {
    return CURSOR_VERTEX_SOURCE;
  }

  get fragment_source() {
    return CURSOR_FRAGMENT_SOURCE;
  }

  bind(gl, program) {
    super.bind(gl, program);

    gl.uniform4f(program.uniform.cursorColor, 1.0, 1.0, 1.0, 1.0);
  }
}

export class InputRenderPrimitives {
  constructor(renderer) {
    this._renderer = renderer;

    this._laser_render_primitive = null;
    this._cursor_render_primitive = null;
  }

  getLaserNode() {
    if (this._laser_render_primitive) {
      let mesh_node = new MeshNode(this._laser_render_primitive);
      return mesh_node;
    }

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
    //laser_material.laser_texture = DataTextureOfSomeSort

    /*this._laserTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._laserTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 48, 1, 0, gl.RGBA,
                  gl.UNSIGNED_BYTE, LASER_TEXTURE_DATA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/

    this._laser_render_primitive = this._renderer.createRenderPrimitive(laser_primitive, laser_material);
    let mesh_node = new MeshNode(this._laser_render_primitive);
    return mesh_node;
  }

  getCursorNode() {
    if (this._cursor_render_primitive) {
      let mesh_node = new MeshNode(this._cursor_render_primitive);
      return mesh_node;
    }

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

    this._cursor_render_primitive = this._renderer.createRenderPrimitive(cursor_primitive, cursor_material);
    let mesh_node = new MeshNode(this._cursor_render_primitive);
    return mesh_node;
  }

  /*drawRays(views, pointer_mats) {
    let gl = this._gl;
    let program = this._laserProgram;

    if (!pointer_mats.length) {
      return;
    }

    program.use();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthMask(false);

    gl.uniform4fv(program.uniform.laserColor, LASER_DEFAULT_COLOR);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._laserVertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._laserIndexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.texCoord);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(program.attrib.texCoord, 2, gl.FLOAT, false, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(program.uniform.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, this._laserTexture);

    for (let view of views) {
      if (view.viewport) {
        let vp = view.viewport;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }
      gl.uniformMatrix4fv(program.uniform.projectionMat, false, view.projection_mat);
      gl.uniformMatrix4fv(program.uniform.viewMat, false, view.view_mat);

      for (let mat of pointer_mats) {
        gl.uniformMatrix4fv(program.uniform.modelMat, false, mat);
        gl.drawElements(gl.TRIANGLES, this._laserIndexCount, gl.UNSIGNED_SHORT, 0);
      }
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  drawCursors(views, cursorPositions) {
    let gl = this._gl;
    let program = this._cursorProgram;

    if (!cursorPositions.length) {
      return;
    }

    program.use();

    // Generally you don't want the cursor ever occluded, so we're turning off
    // depth testing when rendering cursors.
    gl.disable(gl.DEPTH_TEST); 
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform4fv(program.uniform.cursorColor, CURSOR_DEFAULT_COLOR);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._cursorVertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._cursorIndexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);

    gl.vertexAttribPointer(program.attrib.position, 4, gl.FLOAT, false, 16, 0);

    for (let view of views) {
      if (view.viewport) {
        let vp = view.viewport;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }

      gl.uniformMatrix4fv(program.uniform.projectionMat, false, view.projection_mat);
      gl.uniformMatrix4fv(program.uniform.viewMat, false, view.view_mat);
      
      for (let pos of cursorPositions) {
        gl.uniform3fv(program.uniform.cursorPos, pos);
        gl.drawElements(gl.TRIANGLES, this._cursorIndexCount, gl.UNSIGNED_SHORT, 0);
      }
    }

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }*/
}