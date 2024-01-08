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
import {ExternalTexture} from '../core/texture.js';
import {UrlTexture} from '../core/texture.js';
import {BoxBuilder} from '../geometry/box-builder.js';
import {mat4} from '../math/gl-matrix.js';

class CubeSeaMaterial extends Material {
  constructor() {
    super();

    this.baseColor = this.defineSampler('baseColor');
    this.depthColor = this.defineSampler('depthColor');
  }

  get materialName() {
    return 'CUBE_SEA';
  }

  get vertexSource() {
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

  get vertexSourceMultiview() {
    return `#version 300 es
    #extension GL_OVR_multiview2 : require
    #define NUM_VIEWS 2
    layout(num_views=NUM_VIEWS) in;
    #define VIEW_ID gl_ViewID_OVR
    in vec3 POSITION;
    in vec2 TEXCOORD_0;
    in vec3 NORMAL;

    out vec2 vTexCoord;
    out vec3 vLight;

    const vec3 lightDir = vec3(0.75, 0.5, 1.0);
    const vec3 ambientColor = vec3(0.5, 0.5, 0.5);
    const vec3 lightColor = vec3(0.75, 0.75, 0.75);

    vec4 vertex_main(mat4 left_proj, mat4 left_view, mat4 right_proj, mat4 right_view, mat4 model) {
      vec3 normalRotated = vec3(model * vec4(NORMAL, 0.0));
      float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);
      vLight = ambientColor + (lightColor * lightFactor);
      vTexCoord = TEXCOORD_0;
      return (VIEW_ID == 0u) ? left_proj * left_view * model * vec4(POSITION, 1.0) :
                               right_proj * right_view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragmentSourceMultiview() {
    return `#version 300 es
    #extension GL_OVR_multiview2 : require
    #define VIEW_ID gl_ViewID_OVR
    precision highp float;
    precision highp sampler2DArray;
    uniform sampler2D baseColor;
    uniform sampler2DArray depthColor;
    in vec2 vTexCoord;
    in vec3 vLight;

    float Depth_GetCameraDepthInMillimeters(const sampler2DArray depthTexture,
      const vec2 depthUv) {
      return texture(depthColor, vec3(depthUv.x, depthUv.y, VIEW_ID)).r * 1000.0;
    }

    float Depth_GetVirtualSceneDepthMillimeters(const sampler2D depthTexture,
      const vec2 depthUv, float zNear,
      float zFar) {
      // Determine the depth of the virtual scene fragment in millimeters.
      const float kMetersToMillimeters = 1000.0;
      // This value was empirically chosen to correct errors with objects appearing
      // to phase through the floor. In millimeters.
      const float kBias = -80.0;
      float ndc = 2.0 * texture(depthTexture, depthUv).x - 1.0;
      return 2.0 * zNear * zFar / (zFar + zNear - ndc * (zFar - zNear)) *
      kMetersToMillimeters +
      kBias;
    }

    float Depth_GetOcclusion(const sampler2DArray depthTexture, const vec2 depthUv,
      float assetDepthMm) {
      float depthMm = Depth_GetCameraDepthInMillimeters(depthTexture, depthUv);

      // Instead of a hard z-buffer test, allow the asset to fade into the
      // background along a 2 * kDepthTolerancePerMm * assetDepthMm
      // range centered on the background depth.
      const float kDepthTolerancePerMm = 0.01;
      return clamp(1.0 -
        0.5 * (depthMm - assetDepthMm) /
            (kDepthTolerancePerMm * assetDepthMm) +
        0.5, 0.0, 1.0);
    }

    float Depth_GetBlurredOcclusionAroundUV(const sampler2DArray depthTexture,
      const vec2 uv, float assetDepthMm) {
      // Kernel used:
      // 0   4   7   4   0
      // 4   16  26  16  4
      // 7   26  41  26  7
      // 4   16  26  16  4
      // 0   4   7   4   0
      const float kKernelTotalWeights = 269.0;
      float sum = 0.0;

      const float kOcclusionBlurAmount = 0.01;
      vec2 blurriness =
      vec2(kOcclusionBlurAmount, kOcclusionBlurAmount /** u_DepthAspectRatio*/);

      float current = 0.0;

      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-1.0, -2.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+1.0, -2.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-1.0, +2.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+1.0, +2.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-2.0, +1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+2.0, +1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-2.0, -1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+2.0, -1.0) * blurriness, assetDepthMm);
      sum += current * 4.0;

      current = 0.0;
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-2.0, -0.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+2.0, +0.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+0.0, +2.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-0.0, -2.0) * blurriness, assetDepthMm);
      sum += current * 7.0;

      current = 0.0;
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-1.0, -1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+1.0, -1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-1.0, +1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+1.0, +1.0) * blurriness, assetDepthMm);
      sum += current * 16.0;

      current = 0.0;
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+0.0, +1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-0.0, -1.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(-1.0, -0.0) * blurriness, assetDepthMm);
      current += Depth_GetOcclusion(
      depthTexture, uv + vec2(+1.0, +0.0) * blurriness, assetDepthMm);
      sum += current * 26.0;

      sum += Depth_GetOcclusion(depthTexture, uv, assetDepthMm) * 41.0;

      return sum / kKernelTotalWeights;
      }

    vec4 fragment_main() {
      vec2 depthUv = vec2(gl_FragCoord.x/1680.0, gl_FragCoord.y/1760.0);

      vec4 o_FragColor = vec4(vLight, 1) * texture(baseColor, vTexCoord);
      if (o_FragColor.a == 0.0) {
        // There's no sense in calculating occlusion for a fully transparent pixel.
        return o_FragColor;
      }

      float assetDepthMm = gl_FragCoord.z * 1000.0;
  
      float occlusion = Depth_GetBlurredOcclusionAroundUV(
        depthColor, depthUv, assetDepthMm);

      //float occlusion = Depth_GetOcclusion(depthColor,
      //  depthUv, assetDepthMm);

      float objectMaskEroded = pow(occlusion, 10.0);

      float occlusionTransition =
      clamp(occlusion * (2.0 - objectMaskEroded), 0.0, 1.0);

      float kMaxOcclusion = 1.0;
      occlusionTransition = min(occlusionTransition, kMaxOcclusion);
      
      return o_FragColor * (1.0 - occlusion);
    }` 
  }

  get fragmentSource() {
      return `
      precision highp float;
      precision highp sampler2DArray;
      uniform sampler2D baseColor;
      uniform sampler2DArray depthColor;
      varying vec2 vTexCoord;
      varying vec3 vLight;

      vec4 fragment_main() {
        return vec4(vLight, 1.0) * texture2D(baseColor, vTexCoord);
      }`;
  }
}

export class CubeSeaNode extends Node {
  constructor(options = {}) {
    super();

    // Test variables

    // Number and size of the static cubes. Warning, large values
    // don't render right due to overflow of the int16 indices.
    this.cubeCount = options.cubeCount || 10;
    this.cubeScale = options.cubeScale || 1.0;

    // Draw only half the world cubes.
    this.halfOnly = !!options.halfOnly;

    // Automatically spin the world cubes. Intended for automated testing,
    // not recommended for viewing in a headset.
    this.autoRotate = !!options.autoRotate;

    this._texture = new UrlTexture(options.imageUrl || 'media/textures/cube-sea.png');
    this._material = new CubeSeaMaterial();
    this._material.baseColor.texture = this._texture;
    this._material.depthColor.texture = new ExternalTexture("scene_depth");

    this._renderPrimitive = null;
  }

  onRendererChanged(renderer) {
    this._renderPrimitive = null;

    let boxBuilder = new BoxBuilder();

    // Build the spinning "hero" cubes
    boxBuilder.pushCube([0, 0.25, -0.8], 0.1);
    boxBuilder.pushCube([0.8, 0.25, 0], 0.1);
    boxBuilder.pushCube([0, 0.25, 0.8], 0.1);
    boxBuilder.pushCube([-0.8, 0.25, 0], 0.1);

    let heroPrimitive = boxBuilder.finishPrimitive(renderer);

    this.heroNode = renderer.createMesh(heroPrimitive, this._material);

    this.rebuildCubes(boxBuilder);

    this.cubeSeaNode = new Node();
    this.cubeSeaNode.addRenderPrimitive(this._renderPrimitive);

    this.addNode(this.cubeSeaNode);
    this.addNode(this.heroNode);

    return this.waitForComplete();
  }

  rebuildCubes(boxBuilder) {
    if (!this._renderer) {
      return;
    }

    if (!boxBuilder) {
      boxBuilder = new BoxBuilder();
    } else {
      boxBuilder.clear();
    }

    let size = 0.4 * this.cubeScale;

    // Build the cube sea
    let halfGrid = this.cubeCount * 0.5;
    for (let x = 0; x < this.cubeCount; ++x) {
      for (let y = 0; y < this.cubeCount; ++y) {
        for (let z = 0; z < this.cubeCount; ++z) {
          let pos = [x - halfGrid, y - halfGrid, z - halfGrid];
          // Only draw cubes on one side. Useful for testing variable render
          // cost that depends on view direction.
          if (this.halfOnly && pos[0] < 0) {
            continue;
          }

          // Don't place a cube in the center of the grid.
          if (pos[0] == 0 && pos[1] == 0 && pos[2] == 0) {
            continue;
          }

          boxBuilder.pushCube(pos, size);
        }
      }
    }

    if (this.cubeCount > 12) {
      // Each cube has 6 sides with 2 triangles and 3 indices per triangle, so
      // the total number of indices needed is cubeCount^3 * 36. This exceeds
      // the short index range past 12 cubes.
      boxBuilder.indexType = 5125; // gl.UNSIGNED_INT
    }
    let cubeSeaPrimitive = boxBuilder.finishPrimitive(this._renderer);

    if (!this._renderPrimitive) {
      this._renderPrimitive = this._renderer.createRenderPrimitive(cubeSeaPrimitive, this._material);
    } else {
      this._renderPrimitive.setPrimitive(cubeSeaPrimitive);
    }
  }

  onUpdate(timestamp, frameDelta) {
    if (this.autoRotate) {
      mat4.fromRotation(this.cubeSeaNode.matrix, timestamp / 500, [0, -1, 0]);
    }
    mat4.fromRotation(this.heroNode.matrix, timestamp / 2000, [0, 1, 0]);
  }
}
