// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
Heavily inspired by Mr. Doobs stats.js, this FPS counter is rendered completely
with WebGL, allowing it to be shown in cases where overlaid HTML elements aren't
usable (like WebXR), or if you want the FPS counter to be rendered as part of
your scene.
*/

import { Material, RenderMaterial } from '../core/material.js'
import { MeshNode } from '../core/node.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'

const SEGMENTS = 30;
const MAX_FPS = 90;

const SEVEN_SEGMENT_VERTEX_SOURCE = `
  attribute vec2 POSITION;

  vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
    return proj * view * model * vec4(POSITION, 0.0, 1.0);
  }
`;

const SEVEN_SEGMENT_FRAGMENT_SOURCE = `
  precision mediump float;
  uniform vec4 color;

  vec4 fragment_main() {
    return color;
  }
`;

const STATS_VERTEX_SOURCE = `
  attribute vec3 POSITION;
  attribute vec3 COLOR_0;
  varying vec4 vColor;

  vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
    vColor = vec4(COLOR_0, 1.0);
    return proj * view * model * vec4(POSITION, 1.0);
  }
`;

const STATS_FRAGMENT_SOURCE = `
  precision mediump float;
  varying vec4 vColor;

  vec4 fragment_main() {
    return vColor;
  }
`;

class SevenSegmentMaterial extends Material {
  constructor() {
    super();
  }

  get render_material_type() {
    return SevenSegmentRenderMaterial;
  }
}

class SevenSegmentRenderMaterial extends RenderMaterial {
  constructor(material) {
    super(material);
  }

  get material_name() {
    return '__SEVEN_SEGMENT';
  }

  get vertex_source() {
    return SEVEN_SEGMENT_VERTEX_SOURCE;
  }

  get fragment_source() {
    return SEVEN_SEGMENT_FRAGMENT_SOURCE;
  }

  bind(gl, program, prev_material) {
    super.bind(gl, program, prev_material);

    // Bind all appropriate textures
    /*if (this._laser_texture) {
      this._laser_texture.bind(0);
    }*/
  }

  onFirstProgramUse(gl, program) {
    //gl.uniform1i(program.uniform.diffuse, 0);
  }
}

class StatsMaterial extends Material {
  constructor() {
    super();
  }

  get render_material_type() {
    return StatsRenderMaterial;
  }
}

class StatsRenderMaterial extends RenderMaterial {
  constructor(material) {
    super(material);
  }

  get material_name() {
    return '__STATS_VIEWER';
  }

  get vertex_source() {
    return STATS_VERTEX_SOURCE;
  }

  get fragment_source() {
    return STATS_FRAGMENT_SOURCE;
  }

  bind(gl, program, prev_material) {
    super.bind(gl, program, prev_material);

    // Bind all appropriate textures
    /*if (this._laser_texture) {
      this._laser_texture.bind(0);
    }*/
  }

  onFirstProgramUse(gl, program) {
    //gl.uniform1i(program.uniform.diffuse, 0);
  }
}

function segmentToX(i) {
  return ((0.9/SEGMENTS) * i) - 0.45;
}

function fpsToY(value) {
  return (Math.min(value, MAX_FPS) * (0.7 / MAX_FPS)) - 0.45;
}

function fpsToRGB(value) {
  return {
    r: Math.max(0.0, Math.min(1.0, 1.0 - (value/60))),
    g: Math.max(0.0, Math.min(1.0, ((value-15)/(MAX_FPS-15)))),
    b: Math.max(0.0, Math.min(1.0, ((value-15)/(MAX_FPS-15))))
  };
}

let now = (window.performance && performance.now) ? performance.now.bind(performance) : Date.now;

export class StatsViewer {
  constructor(renderer, enable_performance_monitoring) {
    this._renderer = renderer;
    this._enable_performance_monitoring = enable_performance_monitoring;

    this._start_time = now();
    this._prev_frame_time = this._start_time;
    this._prev_graph_update_time = this._start_time;
    this._frames = 0;
    this._fps_average = 0;
    this._fps_min = 0;
    this._fps_step = enable_performance_monitoring ? 1000 : 250;
    this._last_segment = 0;

    this._fps_vertex_buffer = null;
    this._fps_render_primitive = null;
  }

  getNode() {
    if (this._fps_render_primitive) {
      let mesh_node = new MeshNode(this._fps_render_primitive);
      return mesh_node;
    }

    let gl = this._renderer._gl;

    let fps_verts = [];
    let fps_indices = [];

    // Graph geometry
    for (let i = 0; i < SEGMENTS; ++i) {
      // Bar top
      fps_verts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
      fps_verts.push(segmentToX(i+1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

      // Bar bottom
      fps_verts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
      fps_verts.push(segmentToX(i+1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

      let idx = i * 4;
      fps_indices.push(idx, idx+3, idx+1,
                       idx+3, idx, idx+2);
    }

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      let idx = fps_verts.length / 6;

      fps_verts.push(left, bottom, z, r, g, b);
      fps_verts.push(right, top, z, r, g, b);
      fps_verts.push(left, top, z, r, g, b);
      fps_verts.push(right, bottom, z, r, g, b);

      fps_indices.push(idx, idx+1, idx+2,
                       idx, idx+3, idx+1);
    };

    // Panel Background
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);

    // FPS Background
    addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);

    // 30 FPS line
    addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);

    this._fps_vertex_buffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(fps_verts), gl.DYNAMIC_DRAW);
    let fps_index_buffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fps_indices));

    let fps_attribs = [
      new PrimitiveAttribute("POSITION", this._fps_vertex_buffer, 3, gl.FLOAT, 24, 0),
      new PrimitiveAttribute("COLOR_0", this._fps_vertex_buffer, 3, gl.FLOAT, 24, 12),
    ];
  
    let fps_primitive = new Primitive(fps_attribs, fps_indices.length);
    fps_primitive.setIndexBuffer(fps_index_buffer);

    this._fps_render_primitive = this._renderer.createRenderPrimitive(fps_primitive, new StatsMaterial());
    let mesh_node = new MeshNode(this._fps_render_primitive);
    return mesh_node;
  }

  begin() {
    this._start_time = now();
  }

  end() {
    let time = now();

    let frame_fps = 1000 / (time - this._prev_frame_time);
    this._prev_frame_time = time;
    this._fps_min = this._frames ? Math.min(this._fps_min, frame_fps) : frame_fps;
    this._frames++;

    if (time > this._prev_graph_update_time + this._fps_step) {
      let interval_time = time - this._prev_graph_update_time;
      this._fps_average = Math.round(1000 / (interval_time / this._frames));

      // Draw both average and minimum FPS for this period
      // so that dropped frames are more clearly visible.
      this._updateGraph(this._fps_min, this._fps_average);
      if (this._enable_performance_monitoring) {
        console.log(`Average FPS: ${this._fps_average} Min FPS: ${this._fps_min}`);
      }

      this._prev_graph_update_time = time;
      this._frames = 0;
      this._fps_min = 0;
    }
  }

  _updateGraph(value_low, value_high) {
    let gl = this._renderer;

    let color = fpsToRGB(value_low);
    // Draw a range from the low to high value. Artificially widen the
    // range a bit to ensure that near-equal values still remain
    // visible - the logic here should match that used by the
    // "60 FPS line" setup below. Hitting 60fps consistently will
    // keep the top half of the 60fps background line visible.
    let y0 = fpsToY(value_low - 1);
    let y1 = fpsToY(value_high + 1);

    // Update the current segment with the new FPS value
    let updateVerts = [
      segmentToX(this._last_segment), y1, 0.02, color.r, color.g, color.b,
      segmentToX(this._last_segment+1), y1, 0.02, color.r, color.g, color.b,
      segmentToX(this._last_segment), y0, 0.02, color.r, color.g, color.b,
      segmentToX(this._last_segment+1), y0, 0.02, color.r, color.g, color.b,
    ];

    // Re-shape the next segment into the green "progress" line
    color.r = 0.2;
    color.g = 1.0;
    color.b = 0.2;

    if (this._last_segment == SEGMENTS - 1) {
      // If we're updating the last segment we need to do two bufferSubDatas
      // to update the segment and turn the first segment into the progress line.
      this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), this._last_segment * 24 * 4);
      updateVerts = [
        segmentToX(0), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b,
        segmentToX(.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b,
        segmentToX(0), fpsToY(0), 0.02, color.r, color.g, color.b,
        segmentToX(.25), fpsToY(0), 0.02, color.r, color.g, color.b
      ];
      this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), 0);
    } else {
      updateVerts.push(
        segmentToX(this._last_segment+1), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b,
        segmentToX(this._last_segment+1.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b,
        segmentToX(this._last_segment+1), fpsToY(0), 0.02, color.r, color.g, color.b,
        segmentToX(this._last_segment+1.25), fpsToY(0), 0.02, color.r, color.g, color.b
      );
      this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), this._last_segment * 24 * 4);
    }

    this._last_segment = (this._last_segment+1) % SEGMENTS;
  }
} 

var WGLUStats = (function() {

  "use strict";

  //----------------------------
  // Seven-segment text display
  //----------------------------

  var SevenSegmentText = function (gl) {
    this.gl = gl;

    this.attribs = {
      position: 0,
      color: 1
    };

    this.program = linkProgram(gl, sevenSegmentVS, sevenSegmentFS, this.attribs);
    this.uniforms = getProgramUniforms(gl, this.program);

    var verts = [];
    var segmentIndices = {};
    var indices = [];

    var width = 0.5;
    var thickness = 0.25;
    this.kerning = 2.0;

    this.matrix = new Float32Array(16);

    function defineSegment(id, left, top, right, bottom) {
      var idx = verts.length / 2;
      verts.push(
          left, top,
          right, top,
          right, bottom,
          left, bottom);

      segmentIndices[id] = [
          idx, idx+2, idx+1,
          idx, idx+3, idx+2];
    }

    var characters = {};
    this.characters = characters;

    function defineCharacter(c, segments) {
      var character = {
        character: c,
        offset: indices.length * 2,
        count: 0
      };

      for (var i = 0; i < segments.length; ++i) {
        var idx = segments[i];
        var segment = segmentIndices[idx];
        character.count += segment.length;
        indices.push.apply(indices, segment);
      }

      characters[c] = character;
    }

    /* Segment layout is as follows:

    |-0-|
    3   4
    |-1-|
    5   6
    |-2-|

    */

    defineSegment(0, -1, 1, width, 1-thickness);
    defineSegment(1, -1, thickness*0.5, width, -thickness*0.5);
    defineSegment(2, -1, -1+thickness, width, -1);
    defineSegment(3, -1, 1, -1+thickness, -thickness*0.5);
    defineSegment(4, width-thickness, 1, width, -thickness*0.5);
    defineSegment(5, -1, thickness*0.5, -1+thickness, -1);
    defineSegment(6, width-thickness, thickness*0.5, width, -1);


    defineCharacter("0", [0, 2, 3, 4, 5, 6]);
    defineCharacter("1", [4, 6]);
    defineCharacter("2", [0, 1, 2, 4, 5]);
    defineCharacter("3", [0, 1, 2, 4, 6]);
    defineCharacter("4", [1, 3, 4, 6]);
    defineCharacter("5", [0, 1, 2, 3, 6]);
    defineCharacter("6", [0, 1, 2, 3, 5, 6]);
    defineCharacter("7", [0, 4, 6]);
    defineCharacter("8", [0, 1, 2, 3, 4, 5, 6]);
    defineCharacter("9", [0, 1, 2, 3, 4, 6]);
    defineCharacter("A", [0, 1, 3, 4, 5, 6]);
    defineCharacter("B", [1, 2, 3, 5, 6]);
    defineCharacter("C", [0, 2, 3, 5]);
    defineCharacter("D", [1, 2, 4, 5, 6]);
    defineCharacter("E", [0, 1, 2, 4, 6]);
    defineCharacter("F", [0, 1, 3, 5]);
    defineCharacter("P", [0, 1, 3, 4, 5]);
    defineCharacter("-", [1]);
    defineCharacter(" ", []);
    defineCharacter("_", [2]); // Used for undefined characters

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  };

  SevenSegmentText.prototype.render = function(projectionMat, modelViewMat, text, r, g, b, a) {
    var gl = this.gl;

    if (r == undefined || g == undefined || b == undefined) {
      r = 0.0;
      g = 1.0;
      b = 0.0;
    }

    if (a == undefined)
      a = 1.0;

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.uniforms.projectionMat, false, projectionMat);
    gl.uniform4f(this.uniforms.color, r, g, b, a);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.enableVertexAttribArray(this.attribs.position);
    gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 8, 0);

    text = text.toUpperCase();

    var offset = 0;

    for (var i = 0; i < text.length; ++i) {
      var c;
      if (text[i] in this.characters) {
        c = this.characters[text[i]];
      } else {
        c = this.characters["_"];
      }

      if (c.count != 0) {
        mat4_fromTranslation(this.matrix, [offset, 0, 0]);
        mat4_multiply(this.matrix, modelViewMat, this.matrix);

        gl.uniformMatrix4fv(this.uniforms.modelViewMat, false, this.matrix);
        gl.drawElements(gl.TRIANGLES, c.count, gl.UNSIGNED_SHORT, c.offset);

      }

      offset += this.kerning;
    }
  }

  //-----------
  // FPS Graph
  //-----------

  /*Stats.prototype.render = function(projectionMat, modelViewMat) {
    var gl = this.gl;

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.uniforms.projectionMat, false, projectionMat);
    gl.uniformMatrix4fv(this.uniforms.modelViewMat, false, modelViewMat);

    gl.enableVertexAttribArray(this.attribs.position);
    gl.enableVertexAttribArray(this.attribs.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);

    gl.vertexAttribPointer(this.attribs.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(this.attribs.color, 3, gl.FLOAT, false, 24, 12);

    // Draw the graph and background in a single call
    gl.drawElements(gl.TRIANGLES, this.fpsIndexCount, gl.UNSIGNED_SHORT, 0);

    mat4_multiply(this.modelViewMatrix, modelViewMat, this.textMatrix);
    this.sevenSegmentText.render(projectionMat, this.modelViewMatrix, this.fpsAverage + " FP5");
  }

  Stats.prototype.renderOrtho = function(x, y, width, height) {
    var canvas = this.gl.canvas;

    if (x == undefined || y == undefined) {
      x = 10 * window.devicePixelRatio;
      y = 10 * window.devicePixelRatio;
    }
    if (width == undefined || height == undefined) {
      width = 75 * window.devicePixelRatio;
      height = 75 * window.devicePixelRatio;
    }

    mat4_ortho(this.orthoProjMatrix, 0, canvas.width, 0, canvas.height, 0.1, 1024);

    mat4_identity(this.orthoViewMatrix);
    mat4_translate(this.orthoViewMatrix, this.orthoViewMatrix, [x, canvas.height - height - y, -1]);
    mat4_scale(this.orthoViewMatrix, this.orthoViewMatrix, [width, height, 1]);
    mat4_translate(this.orthoViewMatrix, this.orthoViewMatrix, [0.5, 0.5, 0]);

    this.render(this.orthoProjMatrix, this.orthoViewMatrix);
  }*/
})();
