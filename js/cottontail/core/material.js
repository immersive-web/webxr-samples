// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { VERTEX_SHADER, FRAGMENT_SHADER } from './pbr-shader.js'
import { ATTRIB, ATTRIB_MASK } from './renderer.js'
import { Program } from './program.js'

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

export class Material {
  constructor() {
    this._active_frame_id = -1;

    let json = {};
    let pbr = json.pbrMetallicRoughness || {};
    this.base_color_factor = new Float32Array(pbr.baseColorFactor || [1, 1, 1, 1]);
    this.base_color_texture = null;
    this.metallic_roughness_factor = new Float32Array([
        pbr.metallicFactor || 1.0,
        pbr.roughnessFactor || 1.0]);
    this.metallic_roughness_texture = null;
    this.normal_texture = null;
    this.occlusion_texture = null;
    this.occlusion_strength = (json.occlusionTexture && json.occlusionTexture.strength) ? json.occlusionTexture.strength : 1.0;
    this.emissive_factor = new Float32Array(json.emissiveFactor || [0, 0, 0]);
    this.emissive_texture = null;
    this.alpha_mode = json.alpaMode;
    this.alpha_cutoff = json.alphaCutoff;
    this.double_sided = json.doubleSided;
  }

  markActive(frame_id) {
    this._active_frame_id = frame_id;
  }

  bind(gl, program) {
    if (this.double_sided) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
    }

    // Bind all appropriate textures
    if (this.base_color_texture) {
      this.base_color_texture.bind(0);
    }

    gl.uniform4fv(program.uniform.baseColorFactor, this.base_color_factor);

    if (program.defines.USE_NORMAL_MAP) {
      this.normal_texture.bind(1);
    }

    if (program.defines.USE_OCCLUSION) {
      this.occlusion_texture.bind(2);
      gl.uniform1f(program.uniform.occlusionStrength, this.occlusion_strength);
    }

    if (program.defines.USE_EMISSIVE) {
      this.emissive_texture.bind(3);
      gl.uniform3fv(program.uniform.emissiveFactor, this.emissive_factor);
    }

    if (program.defines.USE_METAL_ROUGH_MAP) {
      this.metallic_roughness_texture.bind(4);
    }

    if (!program.defines.FULLY_ROUGH) {
      gl.uniform2fv(program.uniform.metallicRoughnessFactor, this.metallic_roughness_factor);
    }
  }

  waitForComplete() {
    let promises = [];
    if (this.base_color_texture && !this.base_color_texture._complete) {
      promises.push(this.base_color_texture._promise);
    }
    if (this.metallic_roughness_texture && !this.metallic_roughness_texture._complete) {
      promises.push(this.metallic_roughness_texture._promise);
    }
    if (this.normal_texture && !this.normal_texture._complete) {
      promises.push(this.normal_texture._promise);
    }
    if (this.occlusion_texture && !this.occlusion_texture._complete) {
      promises.push(this.occlusion_texture._promise);
    }
    if (this.emissive_texture && !this.emissive_texture._complete) {
      promises.push(this.emissive_texture._promise);
    }
    return Promise.all(promises).then(() => this);
  }
}

export class MaterialProgramCache {
  constructor(gl) {
    this._gl = gl;
    this._programs = [];
  }

  getProgram(material, primitive) {
    let program_mask = 0;
    let program_defines = {};
    let gl = this._gl;

    if (primitive.attribute_mask & ATTRIB_MASK.COLOR_0) {
      program_defines['USE_VERTEX_COLOR'] = 1;
    }

    if (primitive.attribute_mask & ATTRIB_MASK.TEXCOORD_0) {
      if(material.base_color_texture) {
        program_defines['USE_BASE_COLOR_MAP'] = 1;
      }

      if(material.normal_texture && (primitive.attribute_mask & ATTRIB_MASK.TANGENT)) {
        program_defines['USE_NORMAL_MAP'] = 1;
      }

      if(material.metallic_roughness_texture) {
        program_defines['USE_METAL_ROUGH_MAP'] = 1;
      }

      if(material.occlusion_texture) {
        program_defines['USE_OCCLUSION'] = 1;
      }

      if(material.emissive_texture) {
        program_defines['USE_EMISSIVE'] = 1;
      }
    }

    if ((!material.metallic_roughness_texture ||
         !(primitive.attribute_mask & ATTRIB_MASK.TEXCOORD_0)) &&
        material.metallic_roughness_factor[1] == 1.0) {
      program_defines['FULLY_ROUGH'] = 1;
    }

    // Build up a mask that will act as a key to our program cache.
    for (let define in program_defines) {
      program_mask |= PROGRAM_MASK[define];
    }

    // Check and see if a compatible shader already exists.
    if (this._programs[program_mask]) {
      return this._programs[program_mask];
    }

    // If no existing compatible program was found, create a new one.
    let program = new Program(gl, VERTEX_SHADER, FRAGMENT_SHADER, ATTRIB, program_defines);

    // Set up some static uniforms that will never need to be changed for the
    // lifetime of the program.
    program.onFirstUse((program) => {
      gl.uniform1i(program.uniform.baseColorTex, 0);

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
    });

    this._programs[program_mask] = program;
    return program;
  }
}