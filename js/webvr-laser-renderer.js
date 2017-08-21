// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Laser texture data, 48x1 RGBA (not premultiplied alpha).
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

const LASER_DIAMETER = 0.005;
const LASER_FADE_END = 0.535;
const LASER_FADE_POINT = 0.5335;
const LASER_DEFAULT_COLOR = new Float32Array([1.0, 1.0, 1.0, 0.5]);

const LASER_SHADER_VERTEX = `
  uniform mat4 projectionMat;
  uniform mat4 viewMat;
  uniform mat4 modelMat;
  attribute vec3 position;
  attribute vec2 texCoord;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = texCoord;
    gl_Position = projectionMat * viewMat * modelMat * vec4(position, 1.0);
  }
`;

const LASER_SHADER_FRAGMENT = `
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
    float opacity = front_fade_factor * back_fade_factor;
    vec4 color = laserColor * texture2D(diffuse, vTexCoord);
    gl_FragColor = vec4(color.rgb * opacity, opacity);
  }
`;

class WebVRLaserRenderer {
  constructor(gl) {
    this._gl = gl;

    this._program = new WGLUProgram(gl);
    this._program.attachShaderSource(LASER_SHADER_VERTEX, gl.VERTEX_SHADER);
    this._program.attachShaderSource(LASER_SHADER_FRAGMENT, gl.FRAGMENT_SHADER);
    this._program.bindAttribLocation({
      position: 0,
      texCoord: 1
    });
    this._program.link();

    this._laserTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._laserTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 48, 0, gl.RGBA,
                  gl.UNSIGNED_BYTE, LASER_TEXTURE_DATA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let lr = LASER_DIAMETER * 0.2;

    // Laser is rendered as a diamond shaped tube
    let laserVerts = new Float32Array([
    //X    Y     Z     U    V
      0.0,  lr,  0.0,  0.0, 1.0,
      0.0,  lr, -1.0,  0.0, 0.0,
      -lr, 0.0,  0.0,  1.0, 1.0,
      -lr, 0.0, -1.0,  1.0, 0.0,

      lr,  0.0,  0.0,  0.0, 1.0,
      lr,  0.0, -1.0,  0.0, 0.0,
      0.0,  lr,  0.0,  1.0, 1.0,
      0.0,  lr, -1.0,  1.0, 0.0,

      0.0, -lr,  0.0,  0.0, 1.0,
      0.0, -lr, -1.0,  0.0, 0.0,
       lr, 0.0,  0.0,  1.0, 1.0,
       lr, 0.0, -1.0,  1.0, 0.0,

      -lr, 0.0,  0.0,  0.0, 1.0,
      -lr, 0.0, -1.0,  0.0, 0.0,
      0.0, -lr,  0.0,  1.0, 1.0,
      0.0, -lr, -1.0,  1.0, 0.0,
    ]);
    let laserIndices = new Uint16Array([
      0, 1, 2, 1, 3, 2,
      4, 5, 6, 5, 7, 6,
      8, 9, 10, 9, 11, 10,
      12, 13, 14, 13, 15, 14,
    ]);
  
    this._vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, laserVerts, gl.STATIC_DRAW);

    this._indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, laserIndices, gl.STATIC_DRAW);

    this._indexCount = laserIndices.length;
  }

  draw(projection_mat, view_mat, model_mat, color) {
    let gl = this._gl;
    let program = this._program;

    if (!color) {
      color = LASER_DEFAULT_COLOR;
    }

    program.use();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projection_mat);
    gl.uniformMatrix4fv(program.uniform.viewMat, false, view_mat);
    gl.uniformMatrix4fv(program.uniform.modelMat, false, model_mat);
    gl.uniform4fv(program.uniform.laserColor, color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.texCoord);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(program.attrib.texCoord, 2, gl.FLOAT, false, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(program.uniform.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, this._laserTexture);

    gl.drawElements(gl.TRIANGLES, this._indexCount, gl.UNSIGNED_SHORT, 0);

    gl.disable(gl.BLEND);
  }
}