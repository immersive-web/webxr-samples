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

import {Material} from '../core/material.js';
import {Node} from '../core/node.js';
import {PrimitiveStream} from '../geometry/primitive-stream.js';

const GL = WebGLRenderingContext; // For enums

const SHADOW_SEGMENTS = 32;
const SHADOW_GROUND_OFFSET = 0.01;
const SHADOW_CENTER_ALPHA = 0.7;
const SHADOW_INNER_ALPHA = 0.3;
const SHADOW_OUTER_ALPHA = 0.0;
const SHADOW_INNER_RADIUS = 0.6;
const SHADOW_OUTER_RADIUS = 1.0;

class DropShadowMaterial extends Material {
  constructor() {
    super();

    this.state.blend = true;
    this.state.blendFuncSrc = GL.ONE;
    this.state.blendFuncDst = GL.ONE_MINUS_SRC_ALPHA;
    this.state.depthFunc = GL.LEQUAL;
    this.state.depthMask = false;
  }

  get materialName() {
    return 'DROP_SHADOW_MATERIAL';
  }

  get vertexSource() {
    return `
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;

    varying float vShadow;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vShadow = TEXCOORD_0.x;
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragmentSource() {
    return `
    varying float vShadow;

    vec4 fragment_main() {
      return vec4(0.0, 0.0, 0.0, vShadow);
    }`;
  }
}

export class DropShadowNode extends Node {
  constructor(iconTexture, callback) {
    super();
  }

  onRendererChanged(renderer) {
    let stream = new PrimitiveStream();

    stream.startGeometry();

    // Shadow center
    stream.pushVertex(0, SHADOW_GROUND_OFFSET, 0, SHADOW_CENTER_ALPHA);

    let segRad = ((Math.PI * 2.0) / SHADOW_SEGMENTS);

    let idx;
    for (let i = 0; i < SHADOW_SEGMENTS; ++i) {
      idx = stream.nextVertexIndex;

      let rad = i * segRad;
      let x = Math.cos(rad);
      let y = Math.sin(rad);
      stream.pushVertex(x * SHADOW_INNER_RADIUS, SHADOW_GROUND_OFFSET, y * SHADOW_INNER_RADIUS, SHADOW_INNER_ALPHA);
      stream.pushVertex(x * SHADOW_OUTER_RADIUS, SHADOW_GROUND_OFFSET, y * SHADOW_OUTER_RADIUS, SHADOW_OUTER_ALPHA);

      if (i > 0) {
        // Inner circle
        stream.pushTriangle(0, idx, idx-2);

        // Outer circle
        stream.pushTriangle(idx, idx+1, idx-1);
        stream.pushTriangle(idx, idx-1, idx-2);
      }
    }

    stream.pushTriangle(0, 1, idx);

    stream.pushTriangle(1, 2, idx+1);
    stream.pushTriangle(1, idx+1, idx);

    stream.endGeometry();

    let shadowPrimitive = stream.finishPrimitive(renderer);
    this._shadowRenderPrimitive = renderer.createRenderPrimitive(shadowPrimitive, new DropShadowMaterial());
    this.addRenderPrimitive(this._shadowRenderPrimitive);
  }
}
