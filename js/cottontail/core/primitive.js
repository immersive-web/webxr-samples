// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export const ATTRIB = {
  POSITION: 1,
  NORMAL: 2,
  TANGENT: 3,
  TEXCOORD_0: 4,
  TEXCOORD_1: 5,
  COLOR_0: 6,
};

export const ATTRIB_MASK = {
  POSITION:   0x0001,
  NORMAL:     0x0002,
  TANGENT:    0x0004,
  TEXCOORD_0: 0x0008,
  TEXCOORD_1: 0x0010,
  COLOR_0:    0x0020,
};

export class PrimitiveAttribute {
  constructor(name, buffer, component_count, component_type, stride, byte_offset) {
    this.name = name;
    this.attrib_index = ATTRIB[name];
    this.component_count = component_count || 3;
    this.component_type = component_type || WebGLRenderingContext.FLOAT;
    this.stride = stride || 0;
    this.byte_offset = byte_offset || 0;
    this.normalized = false;

    if (buffer instanceof Promise) {
      this.buffer = null;
      this._promise = buffer;
      this._promise.then((buffer) => {
        this.buffer = buffer;
      });
    } else {
      this.buffer = buffer;
      this._promise = Promise.resolve(buffer);
    }
  }

  then(callback) {
    return this._promise.then(() => callback(this));
  }
}

class PrimitiveAttributeBuffer {
  constructor(buffer) {
    this.buffer = buffer;
    this.attributes = [];
  }
}

export class Primitive {
  constructor(attributes, element_count, mode) {
    this._attribute_buffers = [];
    this.element_count = element_count;

    this.mode = mode || 4; // gl.TRIANGLES;
    this.index_buffer = null;
    this.index_byte_offset = 0;
    this.index_type = 0;
    this._index_promise = null;
    
    this.attribute_mask = 0;
    this._completion_promises = [];

    for (let attribute of attributes) {
      this.attribute_mask |= ATTRIB_MASK[attribute.name];

      this._completion_promises.push(attribute.then(() => {
        let found_buffer = false;
        for (let attribute_buffer of this._attribute_buffers) {
          if (attribute_buffer.buffer == attribute.buffer) {
            attribute_buffer.attributes.push(attribute);
            found_buffer = true;
            break;
          }
        }
        if (!found_buffer) {
          let attribute_buffer = new PrimitiveAttributeBuffer(attribute.buffer);
          attribute_buffer.attributes.push(attribute);
          this._attribute_buffers.push(attribute_buffer);
        }
      }));
    }
  }

  setIndexBuffer(index_buffer, byte_offset, index_type) {
    this.index_byte_offset = byte_offset || 0;
    this.index_type = index_type || 5123; // gl.UNSIGNED_SHORT;

    if (index_buffer instanceof Promise) {
      this.index_buffer = null;
      this._index_promise = index_buffer;
      this._index_promise.then((index_buffer) => {
        this.index_buffer = index_buffer;
      });
    } else {
      this.index_buffer = index_buffer;
      this._index_promise = Promise.resolve(index_buffer);
    }

    this._completion_promises.push(this._index_promise);
  }

  then(callback) {
    return Promise.all(this._completion_promises).then(() => callback(this));
  }
}