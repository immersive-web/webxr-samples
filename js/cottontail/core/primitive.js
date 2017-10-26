// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export class PrimitiveAttribute {
  constructor(name, buffer, component_count, component_type, stride, byte_offset) {
    this.name = name;
    this.buffer = buffer;
    this.component_count = component_count || 3;
    this.component_type = component_type || 5126; // gl.FLOAT;
    this.stride = stride || 0;
    this.byte_offset = byte_offset || 0;
    this.normalized = false;
  }
}

export class Primitive {
  constructor(attributes, element_count, mode) {
    this.attributes = attributes || [];
    this.element_count = element_count || 0;
    this.mode = mode || 4; // gl.TRIANGLES;
    this.index_buffer = null;
    this.index_byte_offset = 0;
    this.index_type = 0;
  }

  setIndexBuffer(index_buffer, byte_offset, index_type) {
    this.index_buffer = index_buffer;
    this.index_byte_offset = byte_offset || 0;
    this.index_type = index_type || 5123; // gl.UNSIGNED_SHORT;
  }
}