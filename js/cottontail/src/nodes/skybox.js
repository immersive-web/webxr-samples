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
Node for displaying 360 equirect images as a skybox.
*/

import { Material, RENDER_ORDER } from '../core/material.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { Node } from '../core/node.js'
import { UrlTexture } from '../core/texture.js'

const GL = WebGLRenderingContext; // For enums

class SkyboxMaterial extends Material {
  constructor() {
    super();
    this.render_order = RENDER_ORDER.SKY;
    this.state.depth_func = GL.LEQUAL;
    this.state.depth_mask = false;

    this.image = this.defineSampler("diffuse");

    this.tex_coord_scale_offset = this.defineUniform("texCoordScaleOffset",
                                                      [1.0, 1.0, 0.0, 0.0,
                                                       1.0, 1.0, 0.0, 0.0], 4);
  }

  get material_name() {
    return 'SKYBOX';
  }

  get vertex_source() {
    return `
    uniform int EYE_INDEX;
    uniform vec4 texCoordScaleOffset[2];
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    varying vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];
      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;
      // Drop the translation portion of the view matrix
      view[3].xyz = vec3(0.0, 0.0, 0.0);
      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);

      // Returning the W component for both Z and W forces the geometry depth to
      // the far plane. When combined with a depth func of LEQUAL this makes the
      // sky write to any depth fragment that has not been written to yet.
      return out_vec.xyww;
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

export class Skybox extends Node {
  constructor(options) {
    super();

    this._image_url = options.image_url;
    this._display_mode = options.display_mode || "mono";
    this._rotation_y = options.rotation_y || 0;
  }

  onRendererChanged(renderer) {
    let vertices = [];
    let indices = [];

    let lat_segments = 40;
    let lon_segments = 40;

    // Create the vertices/indices
    for (let i=0; i <= lat_segments; ++i) {
      let theta = i * Math.PI / lat_segments;
      let sin_theta = Math.sin(theta);
      let cos_theta = Math.cos(theta);

      let idx_offset_a = i * (lon_segments+1);
      let idx_offset_b = (i+1) * (lon_segments+1);

      for (let j=0; j <= lon_segments; ++j) {
        let phi = (j * 2 * Math.PI / lon_segments) + this._rotation_y;
        let x = Math.sin(phi) * sin_theta;
        let y = cos_theta;
        let z = -Math.cos(phi) * sin_theta;
        let u = (j / lon_segments);
        let v = (i / lat_segments);

        // Vertex shader will force the geometry to the far plane, so the
        // radius of the sphere is immaterial.
        vertices.push(x, y, z, u, v);

        if (i < lat_segments && j < lon_segments) {
          let idx_a = idx_offset_a+j;
          let idx_b = idx_offset_b+j;

          indices.push(idx_a, idx_b, idx_a+1,
                       idx_b, idx_b+1, idx_a+1);
        }
      }
    }

    let vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
    let index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 20, 0),
      new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 20, 12),
    ];
  
    let primitive = new Primitive(attribs, indices.length);
    primitive.setIndexBuffer(index_buffer);

    let material = new SkyboxMaterial();
    material.image.texture = new UrlTexture(this._image_url);

    switch(this._display_mode) {
      case "mono":
        material.tex_coord_scale_offset.value = [1.0, 1.0, 0.0, 0.0,
                                                 1.0, 1.0, 0.0, 0.0];
        break;
      case "stereoTopBottom":
        material.tex_coord_scale_offset.value = [1.0, 0.5, 0.0, 0.0,
                                                 1.0, 0.5, 0.0, 0.5];
        break;
      case "stereoLeftRight":
        material.tex_coord_scale_offset.value = [0.5, 1.0, 0.0, 0.0,
                                                 0.5, 1.0, 0.5, 0.0];
        break;
    }

    let render_primitive = renderer.createRenderPrimitive(primitive, material);
    this.addRenderPrimitive(render_primitive);
  }
}