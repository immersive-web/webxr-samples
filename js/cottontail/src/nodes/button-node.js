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

import { Material } from '../core/material.js'
import { Node } from '../core/node.js'
import { PrimitiveStream } from '../geometry/primitive-stream.js'

const GL = WebGLRenderingContext; // For enums
const BUTTON_SIZE = 0.1;
const BUTTON_CORNER_RADIUS = 0.025;
const BUTTON_CORNER_SEGMENTS = 8;
const BUTTON_ICON_SIZE = 0.07;
const BUTTON_LAYER_DISTANCE = 0.005;

class ButtonMaterial extends Material {
  constructor() {
    super();

    this.state.blend = true;
    this.state.blend_func_src = GL.SRC_ALPHA;
    this.state.blend_func_dst = GL.ONE;

    this.defineUniform("hoverAmount", 0);
  }

  get material_name() {
    return 'BUTTON_MATERIAL';
  }

  get vertex_source() {
    return `
    attribute vec3 POSITION;

    uniform float hoverAmount;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vec4 pos = vec4(POSITION.x, POSITION.y, POSITION.z * (1.0 + hoverAmount), 1.0);
      return proj * view * model * pos;
    }`;
  }

  get fragment_source() {
    return `
    precision mediump float;

    vec4 fragment_main() {
      return vec4(1.0, 1.0, 1.0, 0.25);
    }`;
  }
}

class ButtonIconMaterial extends Material {
  constructor() {
    super();

    this.state.blend = true;
    this.state.blend_func_src = GL.SRC_ALPHA;
    this.state.blend_func_dst = GL.ONE;

    this.defineUniform("hoverAmount", 0);
    this.image = this.defineSampler("diffuse");
  }

  get material_name() {
    return 'BUTTON_ICON_MATERIAL';
  }

  get vertex_source() {
    return `
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;

    uniform float hoverAmount;

    varying vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vTexCoord = TEXCOORD_0;
      vec4 pos = vec4(POSITION.x, POSITION.y, POSITION.z * (1.0 + hoverAmount), 1.0);
      return proj * view * model * pos;
    }`;
  }

  get fragment_source() {
    return `
    uniform sampler2D diffuse;
    varying vec2 vTexCoord;

    vec4 fragment_main() {
      return texture2D(diffuse, vTexCoord);
    }`;
  }
}

export class ButtonNode extends Node {
  constructor(renderer, icon_texture, callback) {
    super();

    // All buttons are selectable by default.
    this.selectable = true;

    this._callback = callback;

    this.createRenderPrimitive(renderer, icon_texture);
  }

  createRenderPrimitive(renderer, icon_texture) {
    let stream = new PrimitiveStream();

    let hd = BUTTON_LAYER_DISTANCE * 0.5;

    // Build a rounded rect for the background.
    let hs = BUTTON_SIZE * 0.5;
    let ihs = hs - BUTTON_CORNER_RADIUS;
    stream.startGeometry();

    // Rounded corners and sides
    let segments = BUTTON_CORNER_SEGMENTS * 4;
    for (let i = 0; i < segments; ++i) {
      let rad = i * ((Math.PI * 2.0) / segments);
      let x = Math.cos(rad) * BUTTON_CORNER_RADIUS;
      let y = Math.sin(rad) * BUTTON_CORNER_RADIUS;
      let section = Math.floor(i / BUTTON_CORNER_SEGMENTS);
      switch (section) {
        case 0:
          x += ihs;
          y += ihs;
          break;
        case 1:
          x -= ihs;
          y += ihs;
          break;
        case 2:
          x -= ihs;
          y -= ihs;
          break;
        case 3:
          x += ihs;
          y -= ihs;
          break;
      }

      stream.pushVertex(x, y, -hd,  0, 0,  0, 0, 1);

      if (i > 1) {
        stream.pushTriangle(0, i-1, i);
      }
    }

    stream.endGeometry();

    let button_primitive = stream.finishPrimitive(renderer);
    this._button_render_primitive = renderer.createRenderPrimitive(button_primitive, new ButtonMaterial());
    this.addRenderPrimitive(this._button_render_primitive);

    // Build a simple textured quad for the foreground.
    hs = BUTTON_ICON_SIZE * 0.5;
    stream.clear();
    stream.startGeometry();

    stream.pushVertex(-hs, hs, hd,  0, 0,  0, 0, 1);
    stream.pushVertex(-hs, -hs, hd,  0, 1,  0, 0, 1);
    stream.pushVertex(hs, -hs, hd,  1, 1,  0, 0, 1);
    stream.pushVertex(hs, hs, hd,  1, 0,  0, 0, 1);

    stream.pushTriangle(0, 1, 2);
    stream.pushTriangle(0, 2, 3);

    stream.endGeometry();

    let icon_primitive = stream.finishPrimitive(renderer);
    let icon_material = new ButtonIconMaterial();
    icon_material.image.texture = icon_texture;
    this._icon_render_primitive = renderer.createRenderPrimitive(icon_primitive, icon_material);
    this.addRenderPrimitive(this._icon_render_primitive);
  }

  onSelect() {
    if (this._callback) {
      this._callback();
    }
  }
}