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

import { Primitive, PrimitiveAttribute } from '../core/primitive.js'

const GL = WebGLRenderingContext; // For enums

const temp_vec3 = vec3.create();

export class PrimitiveStream {
  constructor(options) {
    this._vertices = [];
    this._indices = [];

    this._geometry_started = false;

    this._vertex_offset = 0;
    this._vertex_index = 0;
    this._high_index = 0;

    this._flip_winding = false;
    this._invert_normals = false;
    this._transform = null;
    this._normal_transform = null;
    this._min = null;
    this._max = null;
  }

  set flip_winding(value) {
    if (this._geometry_started) {
      throw new Error(`Cannot change flip_winding before ending the current geometry.`);
    }
    this._flip_winding = value;
  }

  get flip_winding() {
    this._flip_winding;
  }

  set invert_normals(value) {
    if (this._geometry_started) {
      throw new Error(`Cannot change invert_normals before ending the current geometry.`);
    }
    this._invert_normals = value;
  }

  get invert_normals() {
    this._invert_normals;
  }

  set transform(value) {
    if (this._geometry_started) {
      throw new Error(`Cannot change transform before ending the current geometry.`);
    }
    this._transform = value;
    if (this._transform) {
      if (!this._normal_transform) {
        this._normal_transform = mat3.create();
      }
      mat3.fromMat4(this._normal_transform, this._transform);
    }
  }

  get transform() {
    this._transform;
  }

  startGeometry() {
    if (this._geometry_started) {
      throw new Error(`Attempted to start a new geometry before the previous one was ended.`);
    }

    this._geometry_started = true;
    this._vertex_index = 0;
    this._high_index = 0;
  }

  endGeometry() {
    if (!this._geometry_started) {
      throw new Error(`Attempted to end a geometry before one was started.`);
    }

    if (this._high_index >= this._vertex_index) {
      throw new Error(`Geometry contains indices that are out of bounds. (Contains an index of ${this._high_index} when the vertex count is ${this._vertex_index})`);
    }

    this._geometry_started = false;
    this._vertex_offset += this._vertex_index;

    // TODO: Anything else need to be done to finish processing here?
  }

  pushVertex(x, y, z, u, v, nx, ny, nz) {
    if (!this._geometry_started) {
      throw new Error(`Cannot push vertices before calling startGeometry().`);
    }

    // Transform the incoming vertex if we have a transformation matrix
    if (this._transform) {
      temp_vec3[0] = x;
      temp_vec3[1] = y;
      temp_vec3[2] = z;
      vec3.transformMat4(temp_vec3, temp_vec3, this._transform);
      x = temp_vec3[0];
      y = temp_vec3[1];
      z = temp_vec3[2];

      temp_vec3[0] = nx;
      temp_vec3[1] = ny;
      temp_vec3[2] = nz;
      vec3.transformMat3(temp_vec3, temp_vec3, this._normal_transform);
      nx = temp_vec3[0];
      ny = temp_vec3[1];
      nz = temp_vec3[2];
    }

    if (this._invert_normals) {
      nx *= -1.0;
      ny *= -1.0;
      nz *= -1.0;
    }

    this._vertices.push(x, y, z, u, v, nx, ny, nz);

    if (this._min) {
      this._min[0] = Math.min(this._min[0], x);
      this._min[1] = Math.min(this._min[1], y);
      this._min[2] = Math.min(this._min[2], z);
      this._max[0] = Math.max(this._max[0], x);
      this._max[1] = Math.max(this._max[1], y);
      this._max[2] = Math.max(this._max[2], z);
    } else {
      this._min = vec3.fromValues(x, y, z);
      this._max = vec3.fromValues(x, y, z);
    }

    return this._vertex_index++;
  }

  get next_vertex_index() {
    return this._vertex_index;
  }

  pushTriangle(idx_a, idx_b, idx_c) {
    if (!this._geometry_started) {
      throw new Error(`Cannot push triangles before calling startGeometry().`);
    }

    this._high_index = Math.max(this._high_index, idx_a, idx_b, idx_c);

    idx_a += this._vertex_offset;
    idx_b += this._vertex_offset;
    idx_c += this._vertex_offset;

    if (this._flip_winding) {
      this._indices.push(idx_c, idx_b, idx_a);
    } else {
      this._indices.push(idx_a, idx_b, idx_c);
    }
  }

  clear() {
    if (this._geometry_started) {
      throw new Error(`Cannot clear before ending the current geometry.`);
    }

    this._vertices = [];
    this._indices = [];
    this._vertex_offset = 0;
    this._min = null;
    this._max = null;
  }

  finishPrimitive(renderer) {
    if (!this._vertex_offset) {
      throw new Error(`Attempted to call finishPrimitive() before creating any geometry.`);
    }

    let vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(this._vertices));
    let index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices));

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 32, 0),
      new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 32, 12),
      new PrimitiveAttribute("NORMAL", vertex_buffer, 3, GL.FLOAT, 32, 20),
    ];
  
    let primitive = new Primitive(attribs, this._indices.length);
    primitive.setIndexBuffer(index_buffer);
    primitive.setBounds(this._min, this._max);

    return primitive;
  }
}

export class GeometryBuilderBase {
  constructor(primitive_stream) {
    if (primitive_stream) {
      this._stream = primitive_stream;
    } else {
      this._stream = new PrimitiveStream();
    }
  }

  set primitive_stream(value) {
    this._stream = value;
  }

  get primitive_stream() {
    return this._stream;
  }

  finishPrimitive(renderer) {
    this._stream.finishPrimitive(renderer);
  }
}
