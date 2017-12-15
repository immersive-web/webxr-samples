// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Scene } from '../core/scene.js'

const XRPanoramaVS = `
  uniform mat4 projectionMat;
  uniform mat4 modelViewMat;
  uniform vec4 texCoordScaleOffset;
  attribute vec3 position;
  attribute vec2 texCoord;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = (texCoord * texCoordScaleOffset.xy) + texCoordScaleOffset.zw;
    gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);
  }
`;

const XRPanoramaFS = `
  precision mediump float;
  uniform sampler2D diffuse;
  varying vec2 vTexCoord;

  void main() {
    gl_FragColor = texture2D(diffuse, vTexCoord);
  }
`;

class PanoramaScene extends Scene {
  constructor(options) {
    super();

    this.mediaUrl = options.url;
    this.topBottomStereo = options.topBottomStereo || false;
  }

  onLoadScene(renderer) {
    let gl = renderer._gl;
    this.texture = this.texture_loader.loadTexture(this.mediaUrl);

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(XRPanoramaVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(XRPanoramaFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      texCoord: 1
    });
    this.program.link();

    let panoVerts = [];
    let panoIndices = [];

    let radius = 2; // 2 meter radius sphere
    let latSegments = 40;
    let lonSegments = 40;

    // Create the vertices
    for (let i=0; i <= latSegments; ++i) {
      let theta = i * Math.PI / latSegments;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for (let j=0; j <= lonSegments; ++j) {
        let phi = j * 2 * Math.PI / lonSegments;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = sinPhi * sinTheta;
        let y = cosTheta;
        let z = -cosPhi * sinTheta;
        let u = (j / lonSegments);
        let v = (i / latSegments);

        panoVerts.push(x * radius, y * radius, z * radius, u, v);
      }
    }

    // Create the indices
    for (let i = 0; i < latSegments; ++i) {
      let offset0 = i * (lonSegments+1);
      let offset1 = (i+1) * (lonSegments+1);
      for (var j = 0; j < lonSegments; ++j) {
        let index0 = offset0+j;
        let index1 = offset1+j;
        panoIndices.push(
          index0, index1, index0+1,
          index1, index1+1, index0+1
        );
      }
    }

    this.indexCount = panoIndices.length;

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(panoVerts), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(panoIndices), gl.STATIC_DRAW);
  }

  onDrawViews(renderer, timestamp, views) {
    let gl = renderer._gl;
    let program = this.program;

    program.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.texCoord);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(program.attrib.texCoord, 2, gl.FLOAT, false, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.program.uniform.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    for (let view of views) {
      if (view.viewport) {
        let vp = view.viewport;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }

      if (this.topBottomStereo) {
        if (view.eye == "left") {
          gl.uniform4f(program.uniform.texCoordScaleOffset, 1.0, 0.5, 0.0, 0.0);
        } else {
          gl.uniform4f(program.uniform.texCoordScaleOffset, 1.0, 0.5, 0.0, 0.5);
        }
      } else {
        gl.uniform4f(program.uniform.texCoordScaleOffset, 1.0, 1.0, 0.0, 0.0);
      }

      gl.uniformMatrix4fv(program.uniform.projectionMat, false, view.projection_mat);
      gl.uniformMatrix4fv(program.uniform.modelViewMat, false, view.view_mat);

      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }
}