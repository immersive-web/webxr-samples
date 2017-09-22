// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export class Program {
  constructor(gl, vert_src, frag_src, attrib_map, defines) {
    this._gl = gl;
    this.program = gl.createProgram();
    this.attrib = null;
    this.uniform = null;
    this.defines = {};

    this._first_use = true;
    this._first_use_callback = null;

    let defines_string = '';
    if (defines) {
      for (let define in defines) {
        this.defines[define] = defines[define];
        defines_string += `#define ${define} ${defines[define]}\n`;
      }
    }

    this._vert_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.attachShader(this.program, this._vert_shader);
    gl.shaderSource(this._vert_shader, defines_string + vert_src);
    gl.compileShader(this._vert_shader);

    this._frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.attachShader(this.program, this._frag_shader);
    gl.shaderSource(this._frag_shader, defines_string + frag_src);
    gl.compileShader(this._frag_shader);

    if (attrib_map) {
      this.attrib = {};
      for (let attrib_name in attrib_map) {
        gl.bindAttribLocation(this.program, attrib_map[attrib_name], attrib_name);
        this.attrib[attrib_name] = attrib_map[attrib_name];
      }
    }

    gl.linkProgram(this.program);
  }

  onFirstUse(callback) {
    if (this._first_use) {
      this._first_use_callback = callback;
    } else {
      console.error('Attempted to set a program first use callback after first use.');
    }
  }

  use() {
    let gl = this._gl;

    // If this is the first time the program has been used do all the error checking and
    // attrib/uniform querying needed.
    let first_use = this._first_use;
    if (this._first_use) {
      this._first_use = false;
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        if (!gl.getShaderParameter(this._vert_shader, gl.COMPILE_STATUS)) {
          console.error('Vertex shader compile error: ' + gl.getShaderInfoLog(this._vert_shader));
        } else if (!gl.getShaderParameter(this._frag_shader, gl.COMPILE_STATUS)) {
          console.error('Fragment shader compile error: ' + gl.getShaderInfoLog(this._frag_shader));
        } else {
          console.error('Program link error: ' + gl.getProgramInfoLog(this.program));
        }
        gl.deleteProgram(this.program);
        this.program = null;
      } else {
        if (!this.attrib) {
          this.attrib = {};
          let attrib_count = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
          for (let i = 0; i < attrib_count; i++) {
            let attrib_info = gl.getActiveAttrib(this.program, i);
            this.attrib[attrib_info.name] = gl.getAttribLocation(this.program, attrib_info.name);
          }
        }

        this.uniform = {};
        let uniform_count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        let uniform_name = '';
        for (let i = 0; i < uniform_count; i++) {
          let uniform_info = gl.getActiveUniform(this.program, i);
          uniform_name = uniform_info.name.replace('[0]', '');
          this.uniform[uniform_name] = gl.getUniformLocation(this.program, uniform_name);
        }
      }
      gl.deleteShader(this._vert_shader);
      gl.deleteShader(this._frag_shader);
    }

    gl.useProgram(this.program);

    if (first_use && this._first_use_callback) {
      this._first_use_callback(this);
      this._first_use_callback = null;
    }
  }
}