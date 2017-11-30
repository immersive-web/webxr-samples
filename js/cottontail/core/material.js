// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ATTRIB, ATTRIB_MASK } from './renderer.js'
import { Program } from './program.js'

const CAP = {
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

function setCap(gl, gl_enum, cap, prev_state, state) {
  let change = (state & cap) - (prev_state & cap);
  if (!change)
    return;

  if (change > 0) {
    gl.enable(gl_enum);
  } else {
    gl.disable(gl_enum);
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
    let state = this._state;
    let prev_state = prev_material ? prev_material._state : ~state;
    if (prev_state == state)
        return;

    // Any caps bits changed?
    if ((prev_state & MAT_STATE.CAPS_RANGE) ^ (state & MAT_STATE.CAPS_RANGE)) {
      setCap(gl, gl.CULL_FACE, CAP.CULL_FACE, prev_state, state);
      setCap(gl, gl.BLEND, CAP.BLEND, prev_state, state);
      setCap(gl, gl.DEPTH_TEST, CAP.DEPTH_TEST, prev_state, state);
      setCap(gl, gl.STENCIL_TEST, CAP.STENCIL_TEST, prev_state, state);

      let color_mask_change = (state & CAP.COLOR_MASK) - (prev_state & CAP.COLOR_MASK);
      if (color_mask_change) {
        let mask = color_mask_change > 1;
        gl.colorMask(mask, mask, mask, mask);
      }

      let depth_mask_change = (state & CAP.DEPTH_MASK) - (prev_state & CAP.DEPTH_MASK);
      if (depth_mask_change) {
        gl.depthMask(depth_mask_change > 1);
      }

      let stencil_mask_change = (state & CAP.STENCIL_MASK) - (prev_state & CAP.STENCIL_MASK);
      if (stencil_mask_change) {
        gl.stencilMask(stencil_mask_change > 1);
      }
    }

    let blend_enabled = (state & CAP.BLEND);
    if (blend_enabled) {
      // Blend func changed?
      if ((prev_state & MAT_STATE.BLEND_FUNC_RANGE) ^ (state & MAT_STATE.BLEND_FUNC_RANGE)) {
        let src_func = stateToBlendFunc(state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT);
        let dst_func = stateToBlendFunc(state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT);
        gl.blendFunc(src_func, dst_func);
      }
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
