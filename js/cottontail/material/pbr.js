// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Material, RenderMaterial } from '../core/material.js'
import { ATTRIB_MASK } from '../core/renderer.js'

const VERTEX_SOURCE = `
attribute vec3 POSITION, NORMAL;
attribute vec2 TEXCOORD_0, TEXCOORD_1;

uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;
uniform vec3 CAMERA_POSITION;
uniform vec3 lightDir;

varying vec3 vLight; // Vector from vertex to light.
varying vec3 vView; // Vector from vertex to camera.
varying vec2 vTex;

#ifdef USE_NORMAL_MAP
attribute vec4 TANGENT;
varying mat3 vTBN;
#else
varying vec3 vNorm;
#endif

#ifdef USE_VERTEX_COLOR
attribute vec4 COLOR_0;
varying vec4 vCol;
#endif

void main() {
  vec3 n = normalize(vec3(MODEL_MATRIX * vec4(NORMAL, 0.0)));
#ifdef USE_NORMAL_MAP
  vec3 t = normalize(vec3(MODEL_MATRIX * vec4(TANGENT.xyz, 0.0)));
  vec3 b = cross(n, t) * TANGENT.w;
  vTBN = mat3(t, b, n);
#else
  vNorm = n;
#endif

#ifdef USE_VERTEX_COLOR
  vCol = COLOR_0;
#endif

  vTex = TEXCOORD_0;
  vec4 mPos = MODEL_MATRIX * vec4(POSITION, 1.0);
  vLight = -lightDir;
  vView = CAMERA_POSITION - mPos.xyz;
  gl_Position = PROJECTION_MATRIX * VIEW_MATRIX * mPos;
}`;

// These equations are borrowed with love from this docs from Epic because I
// just don't have anything novel to bring to the PBR scene.
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
const EPIC_PBR_FUNCTIONS = `
vec3 lambertDiffuse(vec3 cDiff) {
  return cDiff / M_PI;
}

float specD(float a, float nDotH) {
  float aSqr = a * a;
  float f = ((nDotH * nDotH) * (aSqr - 1.0) + 1.0);
  return aSqr / (M_PI * f * f);
}

float specG(float roughness, float nDotL, float nDotV) {
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float gl = nDotL / (nDotL * (1.0 - k) + k);
  float gv = nDotV / (nDotV * (1.0 - k) + k);
  return gl * gv;
}

vec3 specF(float vDotH, vec3 F0) {
  float exponent = (-5.55473 * vDotH - 6.98316) * vDotH;
  float base = 2.0;
  return F0 + (1.0 - F0) * pow(base, exponent);
}`;

const FRAGMENT_SOURCE = `
precision highp float;

#define M_PI 3.14159265

uniform vec4 baseColorFactor;
#ifdef USE_BASE_COLOR_MAP
uniform sampler2D baseColorTex;
#endif

varying vec3 vLight;
varying vec3 vView;
varying vec2 vTex;

#ifdef USE_VERTEX_COLOR
varying vec4 vCol;
#endif

#ifdef USE_NORMAL_MAP
uniform sampler2D normalTex;
varying mat3 vTBN;
#else
varying vec3 vNorm;
#endif

#ifdef USE_METAL_ROUGH_MAP
uniform sampler2D metallicRoughnessTex;
#endif
uniform vec2 metallicRoughnessFactor;

#ifdef USE_OCCLUSION
uniform sampler2D occlusionTex;
uniform float occlusionStrength;
#endif

#ifdef USE_EMISSIVE
uniform sampler2D emissiveTex;
uniform vec3 emissiveFactor;
#endif

uniform vec3 lightColor;

const vec3 dielectricSpec = vec3(0.04);
const vec3 black = vec3(0.0);

${EPIC_PBR_FUNCTIONS}

void main() {
#ifdef USE_BASE_COLOR_MAP
  vec4 baseColor = texture2D(baseColorTex, vTex) * baseColorFactor;
#else
  vec4 baseColor = baseColorFactor;
#endif

#ifdef USE_VERTEX_COLOR
  baseColor *= vCol;
#endif

#ifdef USE_NORMAL_MAP
  vec3 n = texture2D(normalTex, vTex).rgb;
  n = normalize(vTBN * (2.0 * n - 1.0));
#else
  vec3 n = normalize(vNorm);
#endif

  float metallic = metallicRoughnessFactor.x;
  float roughness = metallicRoughnessFactor.y;
#ifdef USE_METAL_ROUGH_MAP
  vec4 metallicRoughness = texture2D(metallicRoughnessTex, vTex);
  metallic *= metallicRoughness.b;
  roughness *= metallicRoughness.g;
#endif
  
  vec3 l = normalize(vLight);
  vec3 v = normalize(vView);
  vec3 h = normalize(l+v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = abs(dot(n, v)) + 0.001;
  float nDotH = max(dot(n, h), 0.0);
  float vDotH = max(dot(v, h), 0.0);

  // From GLTF Spec
  vec3 cDiff = mix(baseColor.rgb * (1.0 - dielectricSpec.r), black, metallic); // Diffuse color
  vec3 F0 = mix(dielectricSpec, baseColor.rgb, metallic); // Specular color
  float a = roughness * roughness;

#ifdef FULLY_ROUGH
  vec3 specular = F0 * 0.45;
#else
  vec3 F = specF(vDotH, F0);
  float D = specD(a, nDotH);
  float G = specG(roughness, nDotL, nDotV);
  vec3 specular = (D * F * G) / (4.0 * nDotL * nDotV);
#endif
  float halfLambert = dot(n, l) * 0.5 + 0.5;
  halfLambert *= halfLambert;

  vec3 color = (halfLambert * lightColor * lambertDiffuse(cDiff)) + specular;

#ifdef USE_OCCLUSION
  float occlusion = texture2D(occlusionTex, vTex).r;
  color = mix(color, color * occlusion, occlusionStrength);
#endif

#ifdef USE_EMISSIVE
  color += texture2D(emissiveTex, vTex).rgb * emissiveFactor;
#endif

  // gamma correction
  color = pow(color, vec3(1.0/2.2));

  gl_FragColor = vec4(color, baseColor.a);
}`;

const PROGRAM_MASK = {
  USE_VERTEX_COLOR:    0x0001,
  USE_BASE_COLOR_MAP:  0x0002,
  USE_MATERIAL_COLOR:  0x0004,
  USE_NORMAL_MAP:      0x0008,
  USE_METAL_ROUGH_MAP: 0x0010,
  USE_OCCLUSION:       0x0020,
  USE_EMISSIVE:        0x0040,
  FULLY_ROUGH:         0x0080,
};

export class PbrMaterial extends Material {
  constructor() {
    super();

    this.base_color_factor = [1, 1, 1, 1];
    this.base_color_texture = null;
    this.metallic_factor = 1.0;
    this.roughness_factor = 1.0;
    this.metallic_roughness_texture = null;
    this.normal_texture = null;
    this.occlusion_texture = null;
    this.occlusion_strength = 1.0;
    this.emissive_factor = [0, 0, 0];
    this.emissive_texture = null;
  }

  get render_material_type() {
    return PbrRenderMaterial;
  }
}

export class PbrRenderMaterial extends RenderMaterial {
  constructor(material) {
    super(material);

    this._base_color_factor = new Float32Array(material.base_color_factor);
    this._base_color_texture = material.base_color_texture;
    this._metallic_roughness_factor = new Float32Array([
        material.metallic_factor,
        material.roughness_factor]);
    this._metallic_roughness_texture = material.metallic_roughness_texture;
    this._normal_texture = material.normal_texture;
    this._occlusion_texture = material.occlusion_texture;
    this._occlusion_strength = material.occlusion_strength;
    this._emissive_factor = new Float32Array(material.emissive_factor);
    this._emissive_texture = material.emissive_texture;
  }

  get material_name() {
    return 'PBR';
  }

  get vertex_source() {
    return VERTEX_SOURCE;
  }

  get fragment_source() {
    return FRAGMENT_SOURCE;
  }

  getProgramDefines(render_primitive) {
    let program_defines = {};

    if (render_primitive._attribute_mask & ATTRIB_MASK.COLOR_0) {
      program_defines['USE_VERTEX_COLOR'] = 1;
    }

    if (render_primitive._attribute_mask & ATTRIB_MASK.TEXCOORD_0) {
      if(this._base_color_texture) {
        program_defines['USE_BASE_COLOR_MAP'] = 1;
      }

      if(this._normal_texture && (render_primitive._attribute_mask & ATTRIB_MASK.TANGENT)) {
        program_defines['USE_NORMAL_MAP'] = 1;
      }

      if(this._metallic_roughness_texture) {
        program_defines['USE_METAL_ROUGH_MAP'] = 1;
      }

      if(this._occlusion_texture) {
        program_defines['USE_OCCLUSION'] = 1;
      }

      if(this._emissive_texture) {
        program_defines['USE_EMISSIVE'] = 1;
      }
    }

    if ((!this._metallic_roughness_texture ||
         !(render_primitive._attribute_mask & ATTRIB_MASK.TEXCOORD_0)) &&
        this._metallic_roughness_factor[1] == 1.0) {
      program_defines['FULLY_ROUGH'] = 1;
    }

    return program_defines;
  }

  getProgramKey(defines) {
    let key = 0;

    // Build up a mask that will act as a key to our program cache.
    for (let define in defines) {
      key |= PROGRAM_MASK[define];
    }

    return key;
  }

  bind(gl, program, prev_material) {
    super.bind(gl, program, prev_material);

    // Bind all appropriate textures
    if (this._base_color_texture) {
      this._base_color_texture.bind(0);
    }

    gl.uniform4fv(program.uniform.baseColorFactor, this._base_color_factor);

    if (program.defines.USE_NORMAL_MAP) {
      this._normal_texture.bind(1);
    }

    if (program.defines.USE_OCCLUSION) {
      this._occlusion_texture.bind(2);
      gl.uniform1f(program.uniform.occlusionStrength, this._occlusion_strength);
    }

    if (program.defines.USE_EMISSIVE) {
      this._emissive_texture.bind(3);
      gl.uniform3fv(program.uniform.emissiveFactor, this._emissive_factor);
    }

    if (program.defines.USE_METAL_ROUGH_MAP) {
      this._metallic_roughness_texture.bind(4);
    }

    if (!program.defines.FULLY_ROUGH) {
      gl.uniform2fv(program.uniform.metallicRoughnessFactor, this._metallic_roughness_factor);
    }
  }

  waitForComplete() {
    let promises = [];
    if (this._base_color_texture && !this._base_color_texture._complete) {
      promises.push(this._base_color_texture._promise);
    }
    if (this._metallic_roughness_texture && !this._metallic_roughness_texture._complete) {
      promises.push(this._metallic_roughness_texture._promise);
    }
    if (this._normal_texture && !this._normal_texture._complete) {
      promises.push(this._normal_texture._promise);
    }
    if (this._occlusion_texture && !this._occlusion_texture._complete) {
      promises.push(this._occlusion_texture._promise);
    }
    if (this._emissive_texture && !this._emissive_texture._complete) {
      promises.push(this._emissive_texture._promise);
    }
    return Promise.all(promises).then(() => this);
  }

  onFirstProgramUse(gl, program) {
    if (program.defines.USE_BASE_COLOR_MAP) {
      gl.uniform1i(program.uniform.baseColorTex, 0);
    }

    if (program.defines.USE_NORMAL_MAP) {
      gl.uniform1i(program.uniform.normalTex, 1);
    }

    if (program.defines.USE_OCCLUSION) {
      gl.uniform1i(program.uniform.occlusionTex, 2);
    }

    if (program.defines.USE_EMISSIVE) {
      gl.uniform1i(program.uniform.emissiveTex, 3);
    }

    if (program.defines.USE_METAL_ROUGH_MAP) {
      gl.uniform1i(program.uniform.metallicRoughnessTex, 4);
    }
  }
}
