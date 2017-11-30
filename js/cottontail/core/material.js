// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ATTRIB, ATTRIB_MASK } from './renderer.js'
import { Program } from './program.js'

export class Material {
  constructor() {
    this.alpha_mode = null;
    this.alpha_cutoff = null;
    this.double_sided = false;
  }

  get render_material_type() {
    return RenderMaterial;
  }
}

export class RenderMaterial {
  constructor(material) {
    this._alpha_mode = material.alpha_mode;
    this._alpha_cutoff = material.alpha_cutoff;
    this._double_sided = material.double_sided;
  }

  bind(gl, program) {
    if (this._double_sided) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
    }
  }

  waitForComplete() {
    return Promise.resolve(this);
  }

  get material_name() {
    return '__BASE_MATERIAL__';
  }

  get vertex_source() {
    return null;
  }

  get fragment_source() {
    return null
  }

  getProgramDefines(render_primitive) {
    return {};
  }

  getProgramKey(defines) {
    let key = '';

    for (let define in defines) {
      key += `${define}=${defines[define]},`;
    }

    return key;
  }

  onFirstProgramUse(gl, program) {
  }
}
