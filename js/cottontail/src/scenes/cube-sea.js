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

import { Scene } from './scene.js'
import { Material } from '../core/material.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { Node } from '../core/node.js'
import { UrlTexture } from '../core/texture.js'

class CubeSeaMaterial extends Material {
  constructor() {
    super();

    this.base_color = this.defineSampler("baseColor");
  }

  get material_name() {
    return 'CUBE_SEA';
  }

  get vertex_source() {
    return `
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    attribute vec3 NORMAL;

    varying vec2 vTexCoord;
    varying vec3 vLight;

    const vec3 lightDir = vec3(0.75, 0.5, 1.0);
    const vec3 ambientColor = vec3(0.5, 0.5, 0.5);
    const vec3 lightColor = vec3(0.75, 0.75, 0.75);

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vec3 normalRotated = vec3(model * vec4(NORMAL, 0.0));
      float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);
      vLight = ambientColor + (lightColor * lightFactor);
      vTexCoord = TEXCOORD_0;
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragment_source() {
    return `
    precision mediump float;
    uniform sampler2D baseColor;
    varying vec2 vTexCoord;
    varying vec3 vLight;

    vec4 fragment_main() {
      return vec4(vLight, 1.0) * texture2D(baseColor, vTexCoord);
    }`;
  }
}

export class CubeSeaScene extends Scene {
  constructor(options = {}) {
    super();

    this._grid_size = options.grid_size ? options.grid_size : 10;
    this._image_url = options.image_url ? options.image_url : 'media/textures/cube-sea.png';
  }

  onLoadScene(renderer) {
    let gl = renderer._gl;
    let cubeVerts = [];
    let cubeIndices = [];

    let cubeScale = 1.0;

    // Build a single cube.
    function appendCube (x, y, z, size) {
      if (!x && !y && !z) {
        // Don't create a cube in the center.
        return;
      }

      if (!size) size = 0.2;
      if (cubeScale) size *= cubeScale;
      // Bottom
      let idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 1, idx + 2);
      cubeIndices.push(idx, idx + 2, idx + 3);

      //             X         Y         Z         U    V    NX    NY   NZ
      cubeVerts.push(x - size, y - size, z - size, 0.0, 1.0, 0.0, -1.0, 0.0);
      cubeVerts.push(x + size, y - size, z - size, 1.0, 1.0, 0.0, -1.0, 0.0);
      cubeVerts.push(x + size, y - size, z + size, 1.0, 0.0, 0.0, -1.0, 0.0);
      cubeVerts.push(x - size, y - size, z + size, 0.0, 0.0, 0.0, -1.0, 0.0);

      // Top
      idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 2, idx + 1);
      cubeIndices.push(idx, idx + 3, idx + 2);

      cubeVerts.push(x - size, y + size, z - size, 0.0, 0.0, 0.0, 1.0, 0.0);
      cubeVerts.push(x + size, y + size, z - size, 1.0, 0.0, 0.0, 1.0, 0.0);
      cubeVerts.push(x + size, y + size, z + size, 1.0, 1.0, 0.0, 1.0, 0.0);
      cubeVerts.push(x - size, y + size, z + size, 0.0, 1.0, 0.0, 1.0, 0.0);

      // Left
      idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 2, idx + 1);
      cubeIndices.push(idx, idx + 3, idx + 2);

      cubeVerts.push(x - size, y - size, z - size, 0.0, 1.0, -1.0, 0.0, 0.0);
      cubeVerts.push(x - size, y + size, z - size, 0.0, 0.0, -1.0, 0.0, 0.0);
      cubeVerts.push(x - size, y + size, z + size, 1.0, 0.0, -1.0, 0.0, 0.0);
      cubeVerts.push(x - size, y - size, z + size, 1.0, 1.0, -1.0, 0.0, 0.0);

      // Right
      idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 1, idx + 2);
      cubeIndices.push(idx, idx + 2, idx + 3);

      cubeVerts.push(x + size, y - size, z - size, 1.0, 1.0, 1.0, 0.0, 0.0);
      cubeVerts.push(x + size, y + size, z - size, 1.0, 0.0, 1.0, 0.0, 0.0);
      cubeVerts.push(x + size, y + size, z + size, 0.0, 0.0, 1.0, 0.0, 0.0);
      cubeVerts.push(x + size, y - size, z + size, 0.0, 1.0, 1.0, 0.0, 0.0);

      // Back
      idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 2, idx + 1);
      cubeIndices.push(idx, idx + 3, idx + 2);

      cubeVerts.push(x - size, y - size, z - size, 1.0, 1.0, 0.0, 0.0, -1.0);
      cubeVerts.push(x + size, y - size, z - size, 0.0, 1.0, 0.0, 0.0, -1.0);
      cubeVerts.push(x + size, y + size, z - size, 0.0, 0.0, 0.0, 0.0, -1.0);
      cubeVerts.push(x - size, y + size, z - size, 1.0, 0.0, 0.0, 0.0, -1.0);

      // Front
      idx = cubeVerts.length / 8.0;
      cubeIndices.push(idx, idx + 1, idx + 2);
      cubeIndices.push(idx, idx + 2, idx + 3);

      cubeVerts.push(x - size, y - size, z + size, 0.0, 1.0, 0.0, 0.0, 1.0);
      cubeVerts.push(x + size, y - size, z + size, 1.0, 1.0, 0.0, 0.0, 1.0);
      cubeVerts.push(x + size, y + size, z + size, 1.0, 0.0, 0.0, 0.0, 1.0);
      cubeVerts.push(x - size, y + size, z + size, 0.0, 0.0, 0.0, 0.0, 1.0);
    }

    // Build the cube sea
    for (let x = 0; x < this._grid_size; ++x) {
      for (let y = 0; y < this._grid_size; ++y) {
        for (let z = 0; z < this._grid_size; ++z) {
          appendCube(x - (this._grid_size / 2),
                     y - (this._grid_size / 2),
                     z - (this._grid_size / 2));
        }
      }
    }

    let indexCount = cubeIndices.length;

    // Add some "hero cubes" for separate animation.
    let heroOffset = cubeIndices.length;
    appendCube(0, 0.25, -0.8, 0.05);
    appendCube(0.8, 0.25, 0, 0.05);
    appendCube(0, 0.25, 0.8, 0.05);
    appendCube(-0.8, 0.25, 0, 0.05);
    let heroCount = cubeIndices.length - heroOffset;

    let vertex_buffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(cubeVerts));
    let index_buffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices));

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, gl.FLOAT, 32, 0),
      new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, gl.FLOAT, 32, 12),
      new PrimitiveAttribute("NORMAL", vertex_buffer, 3, gl.FLOAT, 32, 20),
    ];
  
    let cube_sea_primitive = new Primitive(attribs, indexCount);
    cube_sea_primitive.setIndexBuffer(index_buffer);

    let hero_primitive = new Primitive(attribs, heroCount);
    hero_primitive.setIndexBuffer(index_buffer, heroOffset * 2);

    let material = new CubeSeaMaterial();
    material.base_color.texture = new UrlTexture(this._image_url);

    this.cube_sea_node = renderer.createMesh(cube_sea_primitive, material);
    this.hero_node = renderer.createMesh(hero_primitive, material);

    this.addNode(this.cube_sea_node);
    this.addNode(this.hero_node);

    return this.waitForComplete();
  }

  onDrawViews(renderer, timestamp, views) {
    mat4.fromRotation(this.hero_node.matrix, timestamp / 2000, [0, 1, 0]);
    renderer.drawViews(views, this);
  }
}