// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ATTRIB, ATTRIB_MASK } from './renderer.js'
import { Program } from './program.js'

const GL = WebGLRenderingContext; // For enums

export const CAP = {
  // Enable caps
  CULL_FACE:    0x001,
  BLEND:        0x002,
  DEPTH_TEST:   0x004,
  STENCIL_TEST: 0x008,
  COLOR_MASK:   0x010,
  DEPTH_MASK:   0x020,
  STENCIL_MASK: 0x040
};

const MAT_STATE = {
  CAPS_RANGE:      0x000000FF,
  BLEND_SRC_SHIFT:  8,
  BLEND_SRC_RANGE:  0x00000F00,
  BLEND_DST_SHIFT:  12,
  BLEND_DST_RANGE:  0x0000F000,
  BLEND_FUNC_RANGE: 0x0000FF00,
};

function stateToBlendFunc(state, mask, shift) {
  let value = (state & mask) >> shift;
  switch (value) {
    case 0:
    case 1:
      return value;
    default:
      return (value - 2) + WebGLRenderingContext.SRC_COLOR;
  }
}

export class MaterialState {
  constructor() {
    this._state = CAP.CULL_FACE |
                  CAP.DEPTH_TEST |
                  CAP.COLOR_MASK |
                  CAP.DEPTH_MASK;

    // Use a fairly commonly desired blend func as the default.
    this.blend_func_src = WebGLRenderingContext.SRC_ALPHA;
    this.blend_func_dst = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;
  }

  get cull_face() { return !!(this._state & CAP.CULL_FACE); }
  set cull_face(value) {
    if (value) {
      this._state |= CAP.CULL_FACE;
    } else {
      this._state &= ~CAP.CULL_FACE;
    }
  }

  get blend() { return !!(this._state & CAP.BLEND); }
  set blend(value) {
    if (value) {
      this._state |= CAP.BLEND;
    } else {
      this._state &= ~CAP.BLEND;
    }
  }

  get depth_test() { return !!(this._state & CAP.DEPTH_TEST); }
  set depth_test(value) {
    if (value) {
      this._state |= CAP.DEPTH_TEST;
    } else {
      this._state &= ~CAP.DEPTH_TEST;
    }
  }

  get stencil_test() { return !!(this._state & CAP.STENCIL_TEST); }
  set stencil_test(value) {
    if (value) {
      this._state |= CAP.STENCIL_TEST;
    } else {
      this._state &= ~CAP.STENCIL_TEST;
    }
  }

  get color_mask() { return !!(this._state & CAP.COLOR_MASK); }
  set color_mask(value) {
    if (value) {
      this._state |= CAP.COLOR_MASK;
    } else {
      this._state &= ~CAP.COLOR_MASK;
    }
  }

  get depth_mask() { return !!(this._state & CAP.DEPTH_MASK); }
  set depth_mask(value) {
    if (value) {
      this._state |= CAP.DEPTH_MASK;
    } else {
      this._state &= ~CAP.DEPTH_MASK;
    }
  }

  get stencil_mask() { return !!(this._state & CAP.STENCIL_MASK); }
  set stencil_mask(value) {
    if (value) {
      this._state |= CAP.STENCIL_MASK;
    } else {
      this._state &= ~CAP.STENCIL_MASK;
    }
  }

  get blend_func_src() {
    return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT);
  }
  set blend_func_src(value) {
    switch(value) {
      case 0:
      case 1:
        break;
      default:
        value = (value - WebGLRenderingContext.SRC_COLOR) + 2;
    }
    this._state &= ~MAT_STATE.BLEND_SRC_RANGE;
    this._state |= (value << MAT_STATE.BLEND_SRC_SHIFT);
  }

  get blend_func_dst() {
    return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT);
  }
  set blend_func_dst(value) {
    switch(value) {
      case 0:
      case 1:
        break;
      default:
        value = (value - WebGLRenderingContext.SRC_COLOR) + 2;
    }
    this._state &= ~MAT_STATE.BLEND_DST_RANGE;
    this._state |= (value << MAT_STATE.BLEND_DST_SHIFT);
  }
}

export class Material {
  constructor() {
    this.state = new MaterialState;
  }

  get render_material_type() {
    return RenderMaterial;
  }
}

export class RenderMaterial {
  constructor(material) {
    this._state = material.state._state;
  }

  bind(gl, program, prev_material) {
  }

  waitForComplete() {
    return Promise.resolve(this);
  }

  get material_name() {
    return '__BASE_MATERIAL';
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

  // Material State fetchers
  get cull_face() { return !!(this._state & CAP.CULL_FACE); }
  get blend() { return !!(this._state & CAP.BLEND); }
  get depth_test() { return !!(this._state & CAP.DEPTH_TEST); }
  get stencil_test() { return !!(this._state & CAP.STENCIL_TEST); }
  get color_mask() { return !!(this._state & CAP.COLOR_MASK); }
  get depth_mask() { return !!(this._state & CAP.DEPTH_MASK); }
  get stencil_mask() { return !!(this._state & CAP.STENCIL_MASK); }
  get blend_func_src() { return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT); }
  get blend_func_dst() { return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT); }

  // Only really for use from the renderer
  _capsDiff(other_state) {
    return (other_state & MAT_STATE.CAPS_RANGE) ^ (this._state & MAT_STATE.CAPS_RANGE)
  }

  _blendDiff(other_state) {
    if (!(this._state & CAP.BLEND))
      return 0;
    return (other_state & MAT_STATE.BLEND_FUNC_RANGE) ^ (this._state & MAT_STATE.BLEND_FUNC_RANGE);
  }
}
