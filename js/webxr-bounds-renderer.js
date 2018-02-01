// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file renders a passed in XRStageBounds object and attempts
// to render geometry on the floor to indicate where the bounds is.
// XRStageBounds' `geometry` is a series of XRStageBoundsPoints (in
// clockwise-order) with `x` and `z` properties for each.

const XRBoundsVS = `
  uniform mat4 projectionMat;
  uniform mat4 modelViewMat;
  attribute vec3 position;

  void main() {
    gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);
  }
`;

const XRBoundsFS = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 0.3);
  }
`;

class WebXRBoundsRenderer {
  constructor(gl) {
    this.gl = gl;

    this.normal_mat = mat3.create();

    // Build controller representation
    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(XRBoundsVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(XRBoundsFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
    });
    this.program.link();

    this.vert_buffer = gl.createBuffer();
    this.index_buffer = gl.createBuffer();
  }

  setBounds(xrStageBounds) {
    if (!xrStageBounds || xrStageBounds.length === 0) {
      this.geometry = null;
      return;
    }

    this.geometry = xrStageBounds.geometry;

    let gl = this.gl;
    this.verts = [];
    this.indices = [];

    // Tessellate the bounding points from XRStageBounds and connect
    // each point to a neighbor and 0,0,0.
    const pointCount = xrStageBounds.geometry.length;
    for (let i = 0; i < pointCount; i++) {
      const point = xrStageBounds.geometry[i];
      this.verts.push(point.x, 0, point.z);
      this.indices.push(i, i === 0 ? pointCount - 1 : i - 1, pointCount);
    }
    // Center point
    this.verts.push(0, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  draw(projection_mat, view_mat) {
    // Do not render if we don't have any geometry
    if (!this.geometry) {
      return;
    }

    let gl = this.gl;
    let program = this.program;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projection_mat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, view_mat);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.program.attrib.position);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }
}
