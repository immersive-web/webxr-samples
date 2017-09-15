// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export const VERTEX_SHADER = `
attribute vec3 POSITION, NORMAL;
attribute vec2 TEXCOORD_0, TEXCOORD_1;

uniform mat4 proj, view, model;
uniform vec3 lightDir;
uniform vec3 cameraPos;

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
  vec3 n = normalize(vec3(model * vec4(NORMAL, 0.0)));
#ifdef USE_NORMAL_MAP
  vec3 t = normalize(vec3(model * vec4(TANGENT.xyz, 0.0)));
  vec3 b = cross(n, t) * TANGENT.w;
  vTBN = mat3(t, b, n);
#else
  vNorm = n;
#endif

#ifdef USE_VERTEX_COLOR
  vCol = COLOR_0;
#endif

  vTex = TEXCOORD_0;
  vec4 mPos = model * vec4(POSITION, 1.0);
  vLight = -lightDir;
  vView = cameraPos - mPos.xyz;
  gl_Position = proj * view * mPos;
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

export const FRAGMENT_SHADER = `
precision highp float;

#define M_PI 3.14159265

uniform vec4 baseColorFactor;
uniform sampler2D baseColorTex;

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
  vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0) * baseColorFactor;
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
  vec3 specular = F0 * 0.45;;
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