// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Primitive, PrimitiveAttribute } from '../core/primitive.js'

export class GeometryBuilder {
  constructor(renderer) {
    this._renderer = renderer;
  }

  createBox(w, h, d) {
    let gl = this._renderer._gl;

    let wh = w * 0.5;
    let hh = h * 0.5;
    let dh = d * 0.5;

    let verts = [];
    let indices = [];

    // Bottom
    let idx = verts.length / 8.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    //          X    Y    Z    U    V     NX    NY   NZ 
    verts.push(-wh, -hh, -dh,  0.0, 1.0,  0.0, -1.0, 0.0);
    verts.push(+wh, -hh, -dh,  1.0, 1.0,  0.0, -1.0, 0.0);
    verts.push(+wh, -hh, +dh,  1.0, 0.0,  0.0, -1.0, 0.0);
    verts.push(-wh, -hh, +dh,  0.0, 0.0,  0.0, -1.0, 0.0);

    // Top
    idx = verts.length / 8.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-wh, +hh, -dh,  0.0, 0.0,  0.0, 1.0, 0.0);
    verts.push(+wh, +hh, -dh,  1.0, 0.0,  0.0, 1.0, 0.0);
    verts.push(+wh, +hh, +dh,  1.0, 1.0,  0.0, 1.0, 0.0);
    verts.push(-wh, +hh, +dh,  0.0, 1.0,  0.0, 1.0, 0.0);

    // Left
    idx = verts.length / 8.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-wh, -hh, -dh,  0.0, 1.0,  -1.0, 0.0, 0.0);
    verts.push(-wh, +hh, -dh,  0.0, 0.0,  -1.0, 0.0, 0.0);
    verts.push(-wh, +hh, +dh,  1.0, 0.0,  -1.0, 0.0, 0.0);
    verts.push(-wh, -hh, +dh,  1.0, 1.0,  -1.0, 0.0, 0.0);

    // Right
    idx = verts.length / 8.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    verts.push(+wh, -hh, -dh,  1.0, 1.0,  1.0, 0.0, 0.0);
    verts.push(+wh, +hh, -dh,  1.0, 0.0,  1.0, 0.0, 0.0);
    verts.push(+wh, +hh, +dh,  0.0, 0.0,  1.0, 0.0, 0.0);
    verts.push(+wh, -hh, +dh,  0.0, 1.0,  1.0, 0.0, 0.0);

    // Back
    idx = verts.length / 8.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-wh, -hh, -dh,  1.0, 1.0,  0.0, 0.0, -1.0);
    verts.push(+wh, -hh, -dh,  0.0, 1.0,  0.0, 0.0, -1.0);
    verts.push(+wh, +hh, -dh,  0.0, 0.0,  0.0, 0.0, -1.0);
    verts.push(-wh, +hh, -dh,  1.0, 0.0,  0.0, 0.0, -1.0);

    // Front
    idx = verts.length / 8.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    verts.push(-wh, -hh, +dh,  0.0, 1.0,  0.0, 0.0, 1.0);
    verts.push(+wh, -hh, +dh,  1.0, 1.0,  0.0, 0.0, 1.0);
    verts.push(+wh, +hh, +dh,  1.0, 0.0,  0.0, 0.0, 1.0);
    verts.push(-wh, +hh, +dh,  0.0, 0.0,  0.0, 0.0, 1.0);

    let vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, gl.FLOAT, 32, 0),
      new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, gl.FLOAT, 32, 12),
      new PrimitiveAttribute("NORMAL", vertex_buffer, 3, gl.FLOAT, 32, 20),
    ];
  
    let primitive = new Primitive(attribs, indices.length);
    primitive.setIndexBuffer(index_buffer);

    return primitive;
  }

  createCube(size) {
    let cube_size = size || 1.0;
    return this.createBox(cube_size, cube_size, cube_size);
  }

  createCone() {
    let size = 0.5;
    /*let cone_point_vertex = verts.length / 6.0;
    let cone_base_vertex = cone_point_vertex+1;*/
    let cone_segments = 64;

    let verts = [];
    let indices = [];

    // Cone side vertices
    for (var i = 0; i < cone_segments; ++i) {
        idx = verts.length / 6.0;
        indices.push(idx, idx + 1, idx + 2);
        var rad = ((Math.PI * 2) / cone_segments) * i;
        var rad2 = ((Math.PI * 2) / cone_segments) * (i + 1);
        verts.push(Math.sin(rad) * (size / 2), -size, Math.cos(rad) * (size / 2),
                   Math.sin(rad), 0.25, Math.cos(rad));

        verts.push(Math.sin(rad2) * (size / 2), -size, Math.cos(rad2) * (size / 2),
                   Math.sin(rad2), 0.25, Math.cos(rad2));

        verts.push(0, size, 0,
                   Math.sin((rad + rad2) / 2), 0.25, Math.cos((rad + rad2) / 2));
    }

    // Base triangles
    let base_center_index = verts.length / 6.0;
    verts.push(0, -size, 0, 0, -1, 0);
    for (var i = 0; i < cone_segments; ++i) {
      idx = verts.length / 6.0;
      indices.push(base_center_index, idx, idx + 1);
      var rad = ((Math.PI * 2) / cone_segments) * i;
      var rad2 = ((Math.PI * 2) / cone_segments) * (i + 1);
      verts.push(Math.sin(rad2) * (size / 2.0), -size, Math.cos(rad2) * (size  / 2.0), 0, -1, 0);
      verts.push(Math.sin(rad) * (size / 2.0), -size, Math.cos(rad) * (size  / 2.0), 0, -1, 0);
    }

    let vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, gl.FLOAT, 24, 0),
      //new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, gl.FLOAT, 32, 12),
      new PrimitiveAttribute("NORMAL", vertex_buffer, 3, gl.FLOAT, 24, 12),
    ];
  
    let primitive = new Primitive(attribs, indices.length);
    primitive.setIndexBuffer(index_buffer);

    return primitive;
  }
}