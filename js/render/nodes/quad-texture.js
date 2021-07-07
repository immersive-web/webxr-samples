// Copyright 2021 The Immersive Web Community Group
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

import { Material } from "../core/material.js";
import { Node } from "../core/node.js";
import { PrimitiveStream } from "../geometry/primitive-stream.js";
import { UrlTexture } from "../core/texture.js";

class ButtonIconMaterial extends Material {
  constructor() {
    super();

    this.state.blend = true;
    this.icon = this.defineSampler("icon");
  }

  get materialName() {
    return "BUTTON_ICON_MATERIAL";
  }

  get vertexSource() {
    return `
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;

    varying vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vTexCoord = TEXCOORD_0;
      vec4 pos = vec4(POSITION.x, POSITION.y, POSITION.z, 1.0);
      return proj * view * model * pos;
    }`;
  }

  get fragmentSource() {
    return `
    uniform sampler2D icon;
    varying vec2 vTexCoord;

    vec4 fragment_main() {
      return texture2D(icon, vTexCoord);
    }`;
  }
}

export class QuadNode extends Node {
  constructor(texturePath, textureSize, selectable=false) {
    super();

    this.selectable = selectable;
    this._textureSize = textureSize;
    this._iconTexture = new UrlTexture(texturePath);
  }

  onRendererChanged(renderer) {
    let stream = new PrimitiveStream();
    let hs = this._textureSize * 0.5;
    stream.clear();
    stream.startGeometry();

    stream.pushVertex(-hs, hs, 0, 0, 0, 0, 0, 1);
    stream.pushVertex(-hs, -hs, 0, 0, 1, 0, 0, 1);
    stream.pushVertex(hs, -hs, 0, 1, 1, 0, 0, 1);
    stream.pushVertex(hs, hs, 0, 1, 0, 0, 0, 1);

    stream.pushTriangle(0, 1, 2);
    stream.pushTriangle(0, 2, 3);

    stream.endGeometry();

    let iconPrimitive = stream.finishPrimitive(renderer);
    let iconMaterial = new ButtonIconMaterial();
    iconMaterial.icon.texture = this._iconTexture;
    this._iconRenderPrimitive = renderer.createRenderPrimitive(
      iconPrimitive,
      iconMaterial
    );
    this.addRenderPrimitive(this._iconRenderPrimitive);
  }
}
