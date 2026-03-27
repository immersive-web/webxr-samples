// Copyright 2026 The Immersive Web Community Group
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
GPU port of stats-viewer.js.
FPS counter rendered with WebGPU for use in WebXR scenes.
*/

import {Material} from '../core/material.js';
import {Node} from '../core/node.js';
import {Primitive, PrimitiveAttribute} from '../core/primitive.js';
import {SevenSegmentGPUText} from './seven-segment-text-gpu.js';

const SEGMENTS = 30;
const MAX_FPS = 90;

const STATS_WGSL = `
struct FrameUniforms {
  projectionMatrix: mat4x4f,
  viewMatrix: mat4x4f,
  lightDirection: vec3f,
  _pad0: f32,
  lightColor: vec3f,
  _pad1: f32,
  cameraPosition: vec3f,
  _pad2: f32,
};
@group(0) @binding(0) var<uniform> frame: FrameUniforms;

struct ModelUniforms {
  modelMatrix: mat4x4f,
};
@group(1) @binding(0) var<uniform> model: ModelUniforms;

struct MaterialUniforms {
  dummy: vec4f,
};
@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var materialSampler: sampler;
@group(2) @binding(2) var materialTexture: texture_2d<f32>;

struct VertexInput {
  @location(0) position: vec3f,
  @location(5) color: vec3f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) vColor: vec3f,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = frame.projectionMatrix * frame.viewMatrix * model.modelMatrix * vec4f(input.position, 1.0);
  output.vColor = input.color;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  return vec4f(input.vColor, 1.0);
}
`;

class StatsGPUMaterial extends Material {
  constructor() {
    super();
    this.state.cullFace = false;
    this.defineUniform('dummy', [0, 0, 0, 0]);
  }

  get materialName() {
    return 'STATS_VIEWER_GPU';
  }

  get vertexSource() { return null; }
  get fragmentSource() { return null; }

  get wgslSource() {
    return STATS_WGSL;
  }

  getProgramDefines(renderPrimitive) {
    return {};
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
    b: Math.max(0.0, Math.min(1.0, ((value-15)/(MAX_FPS-15)))),
  };
}

let now = (window.performance && performance.now) ? performance.now.bind(performance) : Date.now;

export class StatsGPUViewer extends Node {
  constructor() {
    super();

    this._performanceMonitoring = false;

    this._startTime = now();
    this._prevFrameTime = this._startTime;
    this._prevGraphUpdateTime = this._startTime;
    this._frames = 0;
    this._fpsAverage = 0;
    this._fpsMin = 0;
    this._fpsStep = this._performanceMonitoring ? 1000 : 250;
    this._lastSegment = 0;

    this._fpsPositionBuffer = null;
    this._fpsColorBuffer = null;
    this._fpsRenderPrimitive = null;
    this._fpsNode = null;

    this._sevenSegmentNode = new SevenSegmentGPUText();
    // Hard coded because it doesn't change:
    // Scale by 0.075 in X and Y
    // Translate into upper left corner w/ z = 0.02
    this._sevenSegmentNode.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, 0.3625, 0.02, 1,
    ]);
  }

  onRendererChanged(renderer) {
    this.clearNodes();

    let posVerts = [];
    let colorVerts = [];
    let fpsIndices = [];

    // Graph geometry
    for (let i = 0; i < SEGMENTS; ++i) {
      // Bar top
      posVerts.push(segmentToX(i), fpsToY(0), 0.02);
      posVerts.push(segmentToX(i+1), fpsToY(0), 0.02);
      colorVerts.push(0.0, 1.0, 1.0);
      colorVerts.push(0.0, 1.0, 1.0);

      // Bar bottom
      posVerts.push(segmentToX(i), fpsToY(0), 0.02);
      posVerts.push(segmentToX(i+1), fpsToY(0), 0.02);
      colorVerts.push(0.0, 1.0, 1.0);
      colorVerts.push(0.0, 1.0, 1.0);

      let idx = i * 4;
      fpsIndices.push(idx, idx+3, idx+1,
                       idx+3, idx, idx+2);
    }

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      let idx = posVerts.length / 3;

      posVerts.push(left, bottom, z);
      posVerts.push(right, top, z);
      posVerts.push(left, top, z);
      posVerts.push(right, bottom, z);

      colorVerts.push(r, g, b);
      colorVerts.push(r, g, b);
      colorVerts.push(r, g, b);
      colorVerts.push(r, g, b);

      fpsIndices.push(idx, idx+1, idx+2,
                       idx, idx+3, idx+1);
    }

    // Panel Background
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);

    // FPS Background
    addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);

    // 30 FPS line
    addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);

    this._fpsPositionBuffer = renderer.createRenderBuffer(new Float32Array(posVerts), 'vertex');
    this._fpsColorBuffer = renderer.createRenderBuffer(new Float32Array(colorVerts), 'vertex');
    let fpsIndexBuffer = renderer.createRenderBuffer(new Uint16Array(fpsIndices), 'index');

    let fpsAttribs = [
      new PrimitiveAttribute('POSITION', this._fpsPositionBuffer, 3, 5126, 12, 0),
      new PrimitiveAttribute('COLOR_0', this._fpsColorBuffer, 3, 5126, 12, 0),
    ];

    let fpsPrimitive = new Primitive(fpsAttribs, fpsIndices.length);
    fpsPrimitive.setIndexBuffer(fpsIndexBuffer);
    fpsPrimitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);

    this._fpsRenderPrimitive = renderer.createRenderPrimitive(fpsPrimitive, new StatsGPUMaterial());
    this._fpsNode = new Node();
    this._fpsNode.addRenderPrimitive(this._fpsRenderPrimitive);

    this.addNode(this._fpsNode);
    this.addNode(this._sevenSegmentNode);
  }

  get performanceMonitoring() {
    return this._performanceMonitoring;
  }

  set performanceMonitoring(value) {
    this._performanceMonitoring = value;
    this._fpsStep = value ? 1000 : 250;
  }

  begin() {
    this._startTime = now();
  }

  end() {
    let time = now();

    let frameFps = 1000 / (time - this._prevFrameTime);
    this._prevFrameTime = time;
    this._fpsMin = this._frames ? Math.min(this._fpsMin, frameFps) : frameFps;
    this._frames++;

    if (time > this._prevGraphUpdateTime + this._fpsStep) {
      let intervalTime = time - this._prevGraphUpdateTime;
      this._fpsAverage = Math.round(1000 / (intervalTime / this._frames));

      // Draw both average and minimum FPS for this period
      // so that dropped frames are more clearly visible.
      this._updateGraph(this._fpsMin, this._fpsAverage);
      if (this._performanceMonitoring) {
        console.log(`Average FPS: ${this._fpsAverage} Min FPS: ${this._fpsMin}`);
      }

      this._prevGraphUpdateTime = time;
      this._frames = 0;
      this._fpsMin = 0;
    }
  }

  _updateGraph(valueLow, valueHigh) {
    let color = fpsToRGB(valueLow);
    // Draw a range from the low to high value. Artificially widen the
    // range a bit to ensure that near-equal values still remain
    // visible - the logic here should match that used by the
    // "60 FPS line" setup below. Hitting 60fps consistently will
    // keep the top half of the 60fps background line visible.
    let y0 = fpsToY(valueLow - 1);
    let y1 = fpsToY(valueHigh + 1);

    // Update the current segment with the new FPS value.
    // Position buffer: 3 floats per vertex, 4 vertices per segment = 12 floats = 48 bytes per segment.
    // Color buffer: 3 floats per vertex, 4 vertices per segment = 12 floats = 48 bytes per segment.
    let updatePos = [
      segmentToX(this._lastSegment), y1, 0.02,
      segmentToX(this._lastSegment+1), y1, 0.02,
      segmentToX(this._lastSegment), y0, 0.02,
      segmentToX(this._lastSegment+1), y0, 0.02,
    ];
    let updateColor = [
      color.r, color.g, color.b,
      color.r, color.g, color.b,
      color.r, color.g, color.b,
      color.r, color.g, color.b,
    ];

    // Re-shape the next segment into the green "progress" line
    color.r = 0.2;
    color.g = 1.0;
    color.b = 0.2;

    // Each segment: 4 vertices * 12 bytes (3 floats * 4 bytes) = 48 bytes
    let segmentByteSize = 48;

    if (this._lastSegment == SEGMENTS - 1) {
      // If we're updating the last segment we need to do two updates
      // to update the segment and turn the first segment into the progress line.
      this._renderer.updateRenderBuffer(this._fpsPositionBuffer,
                                        new Float32Array(updatePos),
                                        this._lastSegment * segmentByteSize);
      this._renderer.updateRenderBuffer(this._fpsColorBuffer,
                                        new Float32Array(updateColor),
                                        this._lastSegment * segmentByteSize);

      updatePos = [
        segmentToX(0), fpsToY(MAX_FPS), 0.02,
        segmentToX(.25), fpsToY(MAX_FPS), 0.02,
        segmentToX(0), fpsToY(0), 0.02,
        segmentToX(.25), fpsToY(0), 0.02,
      ];
      updateColor = [
        color.r, color.g, color.b,
        color.r, color.g, color.b,
        color.r, color.g, color.b,
        color.r, color.g, color.b,
      ];
      this._renderer.updateRenderBuffer(this._fpsPositionBuffer,
                                        new Float32Array(updatePos), 0);
      this._renderer.updateRenderBuffer(this._fpsColorBuffer,
                                        new Float32Array(updateColor), 0);
    } else {
      updatePos.push(
        segmentToX(this._lastSegment+1), fpsToY(MAX_FPS), 0.02,
        segmentToX(this._lastSegment+1.25), fpsToY(MAX_FPS), 0.02,
        segmentToX(this._lastSegment+1), fpsToY(0), 0.02,
        segmentToX(this._lastSegment+1.25), fpsToY(0), 0.02
      );
      updateColor.push(
        color.r, color.g, color.b,
        color.r, color.g, color.b,
        color.r, color.g, color.b,
        color.r, color.g, color.b
      );
      this._renderer.updateRenderBuffer(this._fpsPositionBuffer,
                                        new Float32Array(updatePos),
                                        this._lastSegment * segmentByteSize);
      this._renderer.updateRenderBuffer(this._fpsColorBuffer,
                                        new Float32Array(updateColor),
                                        this._lastSegment * segmentByteSize);
    }

    this._lastSegment = (this._lastSegment+1) % SEGMENTS;

    this._sevenSegmentNode.text = `${this._fpsAverage.toString().padEnd(3)}FP5`;
  }
}
