// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebXRSplashScreen{
  constructor(gl, texture, stereo) {
    const splashVS = `
      uniform mat4 projectionMat;
      uniform mat4 modelViewMat;
      uniform vec4 texCoordScaleOffset;
      attribute vec3 position;
      attribute vec2 texCoord;
      varying vec2 vTexCoord;

      void main() {
        vTexCoord = (texCoord * texCoordScaleOffset.xy) + texCoordScaleOffset.zw;
        gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );
      }
    `;

    const splashFS = `
      precision mediump float;
      uniform sampler2D diffuse;
      varying vec2 vTexCoord;

      void main() {
        gl_FragColor = texture2D(diffuse, vTexCoord);
      }
    `;

    this._gl = gl;

    this.modelViewMat = mat4.create();

    this.texture = texture;
    this.stereo = stereo || false;

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(splashVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(splashFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      texCoord: 1
    });
    this.program.link();

    let splashVerts = [];
    let size = 0.4;

    //                X      Y     Z     U    V
    splashVerts.push(-size, -size, 0.0,  0.0, 1.0);
    splashVerts.push( size, -size, 0.0,  1.0, 1.0);
    splashVerts.push( size,  size, 0.0,  1.0, 0.0);

    splashVerts.push(-size, -size, 0.0,  0.0, 1.0);
    splashVerts.push( size,  size, 0.0,  1.0, 0.0);
    splashVerts.push(-size,  size, 0.0,  0.0, 0.0);

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(splashVerts), gl.STATIC_DRAW);
  }

  draw(views) {
    var gl = this._gl;
    var program = this.program;

    let clear_color = gl.getParameter(gl.COLOR_CLEAR_VALUE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    program.use();

    // We're going to just completely ignore the view matrix in this case,
    // because we want to render directly in front of the users face no matter
    // where they are looking.
    mat4.identity(this.modelViewMat);
    mat4.translate(this.modelViewMat, this.modelViewMat, [0, 0, -2]);

    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, this.modelViewMat);

    if (!this.stereo) {
      gl.uniform4f(program.uniform.texCoordScaleOffset, 1.0, 1.0, 0.0, 0.0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);

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

      gl.uniformMatrix4fv(program.uniform.projectionMat, false, view.projection_mat);

      if (this.stereo) {
        if (view.eye == "left") {
          gl.uniform4f(program.uniform.texCoordScaleOffset, 0.5, 1.0, 0.0, 0.0);
        } else {
          gl.uniform4f(program.uniform.texCoordScaleOffset, 0.5, 1.0, 0.5, 0.0)
        }
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Restore the previous clear color.
    gl.clearColor(clear_color[0], clear_color[1], clear_color[2], clear_color[3]);
  }
}
