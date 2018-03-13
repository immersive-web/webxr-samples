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

/*
Heavily inspired by Mr. Doobs stats.js, this FPS counter is rendered completely
with WebGL, allowing it to be shown in cases where overlaid HTML elements aren't
usable (like WebXR), or if you want the FPS counter to be rendered as part of
your scene.
*/

import { Material } from '../core/material.js'
import { Node } from '../core/node.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { SevenSegmentText } from './seven-segment-text.js'

const SEGMENTS = 30;
const MAX_FPS = 90;

class StatsMaterial extends Material {
  get material_name() {
    return 'STATS_VIEWER';
  }

  get vertex_source() {
    return `
    attribute vec3 POSITION;
    attribute vec3 COLOR_0;
    varying vec4 vColor;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vColor = vec4(COLOR_0, 1.0);
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragment_source() {
    return `
    precision mediump float;
    varying vec4 vColor;

    vec4 fragment_main() {
      return vColor;
    }`;
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

export class StatsViewer extends Node {
  constructor(renderer) {
    super();

    this._performance_monitoring = false;

    this._renderer = renderer;

    this._start_time = now();
    this._prev_frame_time = this._start_time;
    this._prev_graph_update_time = this._start_time;
    this._frames = 0;
    this._fps_average = 0;
    this._fps_min = 0;
    this._fps_step = this._performance_monitoring ? 1000 : 250;
    this._last_segment = 0;

    this._fps_vertex_buffer = null;
    this._fps_render_primitive = null;
    this._fps_node = null;
    this._seven_segment_node = null;

    let gl = this._renderer.gl;

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
    fps_primitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);

    this._fps_render_primitive = this._renderer.createRenderPrimitive(fps_primitive, new StatsMaterial());
    this._fps_node = new Node();
    this._fps_node.addRenderPrimitive(this._fps_render_primitive);
    this.addNode(this._fps_node);

    this._seven_segment_node = new SevenSegmentText(this._renderer);
    // Hard coded because it doesn't change:
    // Scale by 0.075 in X and Y
    // Translate into upper left corner w/ z = 0.02
    this._seven_segment_node.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, 0.3625, 0.02, 1
    ]);
    this.addNode(this._seven_segment_node);
  }

  get performance_monitoring() {
    return this._performance_monitoring;
  }

  set performance_monitoring(value) {
    this._performance_monitoring = value;
    this._fps_step = value ? 1000 : 250;
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
      if (this.enable_performance_monitoring) {
        console.log(`Average FPS: ${this._fps_average} Min FPS: ${this._fps_min}`);
      }

      this._prev_graph_update_time = time;
      this._frames = 0;
      this._fps_min = 0;
    }
  }

  _updateGraph(value_low, value_high) {
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

    this._seven_segment_node.text = `${this._fps_average} FP5`;
  }
}
