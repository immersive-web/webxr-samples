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
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { Node } from '../core/node.js'
import { UrlTexture } from '../core/texture.js'
import { BoxBuilder } from '../geometry/box-builder.js'

class CubeSeaMaterial extends Material {
  constructor(heavy = false) {
    super();

    this.heavy = heavy;

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
    if (!this.heavy) {
      return `
      precision mediump float;
      uniform sampler2D baseColor;
      varying vec2 vTexCoord;
      varying vec3 vLight;

      vec4 fragment_main() {
        return vec4(vLight, 1.0) * texture2D(baseColor, vTexCoord);
      }`;
    } else {
      // Used when we want to stress the GPU a bit more.
      // Stolen with love from https://www.clicktorelease.com/code/codevember-2016/4/
      return `
      precision mediump float;

      uniform sampler2D diffuse;
      varying vec2 vTexCoord;
      varying vec3 vLight;

      vec2 dimensions = vec2(64, 64);
      float seed = 0.42;

      vec2 hash( vec2 p ) {
        p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
        return fract(sin(p)*18.5453);
      }

      vec3 hash3( vec2 p ) {
          vec3 q = vec3( dot(p,vec2(127.1,311.7)),
                 dot(p,vec2(269.5,183.3)),
                 dot(p,vec2(419.2,371.9)) );
        return fract(sin(q)*43758.5453);
      }

      float iqnoise( in vec2 x, float u, float v ) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        float k = 1.0+63.0*pow(1.0-v,4.0);
        float va = 0.0;
        float wt = 0.0;
        for( int j=-2; j<=2; j++ )
          for( int i=-2; i<=2; i++ ) {
            vec2 g = vec2( float(i),float(j) );
            vec3 o = hash3( p + g )*vec3(u,u,1.0);
            vec2 r = g - f + o.xy;
            float d = dot(r,r);
            float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
            va += o.z*ww;
            wt += ww;
          }
        return va/wt;
      }

      // return distance, and cell id
      vec2 voronoi( in vec2 x ) {
        vec2 n = floor( x );
        vec2 f = fract( x );
        vec3 m = vec3( 8.0 );
        for( int j=-1; j<=1; j++ )
          for( int i=-1; i<=1; i++ ) {
            vec2  g = vec2( float(i), float(j) );
            vec2  o = hash( n + g );
            vec2  r = g - f + (0.5+0.5*sin(seed+6.2831*o));
            float d = dot( r, r );
            if( d<m.x )
              m = vec3( d, o );
          }
        return vec2( sqrt(m.x), m.y+m.z );
      }

      void main() {
        vec2 uv = ( vTexCoord );
        uv *= vec2( 10., 10. );
        uv += seed;
        vec2 p = 0.5 - 0.5*sin( 0.*vec2(1.01,1.71) );

        vec2 c = voronoi( uv );
        vec3 col = vec3( c.y / 2. );

        float f = iqnoise( 1. * uv + c.y, p.x, p.y );
        col *= 1.0 + .25 * vec3( f );

        gl_FragColor = vec4(vLight, 1.0) * texture2D(diffuse, vTexCoord) * vec4( col, 1. );
      }`;
    }
  }
}

export class CubeSea extends Node {
  constructor(options = {}) {
    super();

    // Test variables
    // If true, use a very heavyweight shader to stress the GPU.
    this.heavy_gpu = !!options.heavy_gpu;

    // Number and size of the static cubes. Warning, large values
    // don't render right due to overflow of the int16 indices.
    this.cube_count = options.cube_count || (this.heavy_gpu ? 12 : 10);
    this.cube_scale = options.cube_scale || 1.0;

    // Draw only half the world cubes. Helps test variable render cost
    // when combined with heavyGpu.
    this.half_only = !!options.half_only;

    // Automatically spin the world cubes. Intended for automated testing,
    // not recommended for viewing in a headset.
    this.auto_rotate = !!options.auto_rotate;

    this._texture = new UrlTexture(options.image_url || 'media/textures/cube-sea.png');

    this._material = new CubeSeaMaterial();
    this._material.base_color.texture = this._texture;

    this._render_primitive = null;
  }

  onRendererChanged(renderer) {
    this._render_primitive = null;

    let box_builder = new BoxBuilder();

    // Build the spinning "hero" cubes
    box_builder.pushCube([0, 0.25, -0.8], 0.1);
    box_builder.pushCube([0.8, 0.25, 0], 0.1);
    box_builder.pushCube([0, 0.25, 0.8], 0.1);
    box_builder.pushCube([-0.8, 0.25, 0], 0.1);

    let hero_primitive = box_builder.finishPrimitive(renderer);

    this.hero_node = renderer.createMesh(hero_primitive, this._material);

    this.rebuildCubes(box_builder);

    this.cube_sea_node = new Node();
    this.cube_sea_node.addRenderPrimitive(this._render_primitive);

    this.addNode(this.cube_sea_node);
    this.addNode(this.hero_node);

    return this.waitForComplete();
  }

  rebuildCubes(box_builder) {
    if (!this._renderer)
      return;

    if (!box_builder)
      box_builder = new BoxBuilder();
    else
      box_builder.clear();

    let size = 0.4 * this.cube_scale;

    // Build the cube sea
    let half_grid = this.cube_count * 0.5;
    for (let x = 0; x < this.cube_count; ++x) {
      for (let y = 0; y < this.cube_count; ++y) {
        for (let z = 0; z < this.cube_count; ++z) {
          let pos = [x - half_grid, y - half_grid, z - half_grid];
          // Only draw cubes on one side. Useful for testing variable render
          // cost that depends on view direction.
          if (this.half_only && pos[0] < 0)
            continue;

          // Don't place a cube in the center of the grid.
          if (pos[0] == 0 && pos[1] == 0 && pos[2] == 0)
            continue;

          box_builder.pushCube(pos, size);
        }
      }
    }

    let cube_sea_primitive = box_builder.finishPrimitive(this._renderer);

    if (!this._render_primitive) {
      this._render_primitive = this._renderer.createRenderPrimitive(cube_sea_primitive, this._material);
    } else {
      this._render_primitive.setPrimitive(cube_sea_primitive);
    }
  }

  onUpdate(timestamp, frame_delta) {
    if (this.auto_rotate) {
      mat4.fromRotation(this.cube_sea_node.matrix, timestamp / 500, [0, -1, 0]);
    }
    mat4.fromRotation(this.hero_node.matrix, timestamp / 2000, [0, 1, 0]);
  }
}