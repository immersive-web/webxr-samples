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

export const MAT_STATE = {
  CAPS_RANGE:      0x000000FF,
  BLEND_SRC_SHIFT:  8,
  BLEND_SRC_RANGE:  0x00000F00,
  BLEND_DST_SHIFT:  12,
  BLEND_DST_RANGE:  0x0000F000,
  BLEND_FUNC_RANGE: 0x0000FF00,
};

export function stateToBlendFunc(state, mask, shift) {
  let value = (state & mask) >> shift;
  switch (value) {
    case 0:
    case 1:
      return value;
    default:
      return (value - 2) + GL.SRC_COLOR;
  }
}

export class MaterialState {
  constructor() {
    this._state = CAP.CULL_FACE |
                  CAP.DEPTH_TEST |
                  CAP.COLOR_MASK |
                  CAP.DEPTH_MASK;

    // Use a fairly commonly desired blend func as the default.
    this.blend_func_src = GL.SRC_ALPHA;
    this.blend_func_dst = GL.ONE_MINUS_SRC_ALPHA;
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

class MaterialSampler {
  constructor(uniform_name) {
    this._uniform_name = uniform_name;
    this._texture = null;
  }

  get texture() {
    return this._texture;
  }

  set texture(value) {
    this._texture = value;
  }
}

class MaterialUniform {
  constructor(uniform_name, default_value, length) {
    this._uniform_name = uniform_name;
    this._value = default_value;
    this._length = length;
    if (!this._length) {
      if (default_value instanceof Array) {
        this._length = default_value.length;
      } else {
        this._length = 1;
      }
    }
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }
}

export class Material {
  constructor() {
    this.state = new MaterialState;
    this._samplers = [];
    this._uniforms = [];
  }

  defineSampler(uniform_name) {
    let sampler = new MaterialSampler(uniform_name);
    this._samplers.push(sampler);
    return sampler;
  }

  defineUniform(uniform_name, default_value=null, length=0) {
    let uniform = new MaterialUniform(uniform_name, default_value, length);
    this._uniforms.push(uniform);
    return uniform;
  }

  get material_name() {
    return null;
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
}
