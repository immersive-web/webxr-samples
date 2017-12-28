// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Scene } from './scene.js'
import { PbrMaterial } from '../materials/pbr.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { Node, MeshNode } from '../core/node.js'

export class CubeSeaScene extends Scene {
  constructor(gridSize) {
    super();

    this.gridSize = gridSize ? gridSize : 10;
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
    for (let x = 0; x < this.gridSize; ++x) {
      for (let y = 0; y < this.gridSize; ++y) {
        for (let z = 0; z < this.gridSize; ++z) {
          appendCube(x - (this.gridSize / 2),
                     y - (this.gridSize / 2),
                     z - (this.gridSize / 2));
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

    let material = new PbrMaterial();
    material.base_color_texture = renderer.texture_cache.fromUrl('media/textures/cube-sea.png');

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