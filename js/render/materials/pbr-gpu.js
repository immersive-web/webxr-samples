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

import {Material} from '../core/material.js';
import {ATTRIB_MASK} from '../core/renderer-gpu.js';

const WGSL_COMMON = `
// Bind group 0: Frame uniforms
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

// Bind group 1: Model uniforms
struct ModelUniforms {
  modelMatrix: mat4x4f,
};
@group(1) @binding(0) var<uniform> model: ModelUniforms;

// Bind group 2: Material uniforms + texture
// Each field is vec4f to match the renderer's vec4-aligned packing.
struct MaterialUniforms {
  baseColorFactor: vec4f,
  metallicRoughness: vec4f,
  occlusion: vec4f,
  emissive: vec4f,
};
@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var materialSampler: sampler;
@group(2) @binding(2) var baseColorTexture: texture_2d<f32>;

const M_PI: f32 = 3.14159265;
const dielectricSpec: vec3f = vec3f(0.04);

fn lambertDiffuse(cDiff: vec3f) -> vec3f {
  return cDiff / M_PI;
}

fn specD(a: f32, nDotH: f32) -> f32 {
  let aSqr = a * a;
  let f = ((nDotH * nDotH) * (aSqr - 1.0) + 1.0);
  return aSqr / (M_PI * f * f);
}

fn specG(roughness: f32, nDotL: f32, nDotV: f32) -> f32 {
  let k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  let gl = nDotL / (nDotL * (1.0 - k) + k);
  let gv = nDotV / (nDotV * (1.0 - k) + k);
  return gl * gv;
}

fn specF(vDotH: f32, F0: vec3f) -> vec3f {
  let exponent = (-5.55473 * vDotH - 6.98316) * vDotH;
  return F0 + (1.0 - F0) * pow(2.0, exponent);
}
`;

function buildWgslSource(useTexCoord) {
  let vertexInputExtra = useTexCoord ? '\n  @location(3) texcoord: vec2f,' : '';
  let vertexOutputExtra = useTexCoord ? '\n  @location(3) vTex: vec2f,' : '';
  let vsTexAssign = useTexCoord ? '\n  output.vTex = input.texcoord;' : '';

  let fsBaseColor = useTexCoord
    ? `  var baseColor = material.baseColorFactor;
  let texColor = textureSample(baseColorTexture, materialSampler, input.vTex);
  baseColor = baseColor * texColor;`
    : `  var baseColor = material.baseColorFactor;`;

  return WGSL_COMMON + `
struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,${vertexInputExtra}
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) vNormal: vec3f,
  @location(1) vLight: vec3f,
  @location(2) vView: vec3f,${vertexOutputExtra}
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  let modelPos = model.modelMatrix * vec4f(input.position, 1.0);
  output.position = frame.projectionMatrix * frame.viewMatrix * modelPos;

  let n = normalize((model.modelMatrix * vec4f(input.normal, 0.0)).xyz);
  output.vNormal = n;
  output.vLight = -frame.lightDirection;
  output.vView = frame.cameraPosition - modelPos.xyz;${vsTexAssign}

  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
${fsBaseColor}

  let n = normalize(input.vNormal);
  let metallic = material.metallicRoughness.x;
  let roughness = material.metallicRoughness.y;

  let l = normalize(input.vLight);
  let v = normalize(input.vView);
  let h = normalize(l + v);

  let nDotL = clamp(dot(n, l), 0.001, 1.0);
  let nDotV = abs(dot(n, v)) + 0.001;
  let nDotH = max(dot(n, h), 0.0);
  let vDotH = max(dot(v, h), 0.0);

  let cDiff = mix(baseColor.rgb * (1.0 - dielectricSpec.r), vec3f(0.0), metallic);
  let F0 = mix(dielectricSpec, baseColor.rgb, metallic);
  let a = roughness * roughness;

  let F = specF(vDotH, F0);
  let D = specD(a, nDotH);
  let G = specG(roughness, nDotL, nDotV);
  let specular = (D * F * G) / (4.0 * nDotL * nDotV);

  let halfLambert = dot(n, l) * 0.5 + 0.5;
  let halfLambertSq = halfLambert * halfLambert;

  var color = (halfLambertSq * frame.lightColor * lambertDiffuse(cDiff)) + specular;

  color = color + material.emissive.xyz;

  return vec4f(color, baseColor.a);
}
`;
}

const WGSL_WITH_TEX = buildWgslSource(true);
const WGSL_NO_TEX = buildWgslSource(false);

export class PbrGPUMaterial extends Material {
  constructor() {
    super();

    this.baseColor = this.defineSampler('baseColorTex');
    this.metallicRoughness = this.defineSampler('metallicRoughnessTex');
    this.normal = this.defineSampler('normalTex');
    this.occlusion = this.defineSampler('occlusionTex');
    this.emissive = this.defineSampler('emissiveTex');

    this.baseColorFactor = this.defineUniform('baseColorFactor', [1.0, 1.0, 1.0, 1.0]);
    this.metallicRoughnessFactor = this.defineUniform('metallicRoughnessFactor', [1.0, 1.0]);
    this.occlusionStrength = this.defineUniform('occlusionStrength', 1.0);
    this.emissiveFactor = this.defineUniform('emissiveFactor', [0, 0, 0]);
  }

  get materialName() {
    return 'PBR_GPU';
  }

  get vertexSource() { return null; }
  get fragmentSource() { return null; }

  get wgslSource() {
    return WGSL_WITH_TEX;
  }

  getWgslSource(defines) {
    if (defines['USE_BASE_COLOR_MAP']) {
      return WGSL_WITH_TEX;
    }
    return WGSL_NO_TEX;
  }

  getProgramDefines(renderPrimitive) {
    let defines = {};

    if (renderPrimitive._attributeMask & ATTRIB_MASK.COLOR_0) {
      defines['USE_VERTEX_COLOR'] = 1;
    }

    if (renderPrimitive._attributeMask & ATTRIB_MASK.TEXCOORD_0) {
      if (this.baseColor.texture) {
        defines['USE_BASE_COLOR_MAP'] = 1;
      }
    }

    return defines;
  }
}
