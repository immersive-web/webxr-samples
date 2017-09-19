// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const DEFAULT_TRANSLATION = new Float32Array([0, 0, 0]);
const DEFAULT_ROTATION = new Float32Array([0, 0, 0, 1]);
const DEFAULT_SCALE = new Float32Array([1, 1, 1]);

export class Node {
  constructor() {
    this.children = [];
    this.parent = null;
    this.visible = true;

    this._matrix = null;

    this._dirty_trs = false;
    this._translation = null;
    this._rotation = null;
    this._scale = null;

    this._dirty_world_matrix = false;
    this._world_matrix = null;
  }

  markActive(frame_id) {
    for (let child of this.children) {
      if (child.visible) {
        child.markActive(frame_id);
      }
    }
  }

  addNode(value) {
    if (!value || value.parent == this) {
      return;
    }

    if (value.parent) {
      value.parent.removeNode(value);
    }
    value.parent = this;

    this.children.push(value);
  }

  removeNode(value) {
    let i = this.children.indexOf(value);
    if (i > -1) {
      this.children.splice(i, 1);
      value.parent = null;
    }
  }

  set matrix(value) {
    this._matrix = value;
    this._dirty_world_matrix = true;
    this._dirty_trs = false;
    this._translation = null;
    this._rotation = null;
    this._scale = null;
  }

  get matrix() {
    this._dirty_world_matrix = true;

    if (!this._matrix) {
      this._matrix = mat4.create();
    }

    if (this._dirty_trs) {
      this._dirty_trs = false;
      mat4.fromRotationTranslationScale(
        this._matrix,
        this._rotation || DEFAULT_ROTATION,
        this._translation || DEFAULT_TRANSLATION,
        this._scale || DEFAULT_SCALE);
    }

    return this._matrix;
  }

  get world_matrix() {
    if (!this._world_matrix) {
      this._dirty_world_matrix = true;
      this._world_matrix = mat4.create();
    }

    if (this._dirty_world_matrix) {
      if (this.parent) {
        // TODO: Some optimizations that could be done here if the node matrix
        // is an identity matrix.
        mat4.mul(this._world_matrix, this.parent.world_matrix, this.matrix);
      } else {
        mat4.copy(this._world_matrix, this.matrix);
      }
      this._dirty_world_matrix = false;
    }

    return this._world_matrix;
  }

  // TODO: Decompose matrix when fetching these?
  set translation(value) {
    if (value != null) {
      this._dirty_trs = true;
    }
    this._translation = value;
  }

  get translation() {
    this._dirty_trs = true;
    if (!this._translation) {
      this._translation = vec3.clone(DEFAULT_TRANSLATION);
    }
    return this._translation;
  }

  set rotation(value) {
    if (value != null) {
      this._dirty_trs = true;
    }
    this._rotation = value;
  }

  get rotation() {
    this._dirty_trs = true;
    if (!this._rotation) {
      this._rotation = quat.clone(DEFAULT_ROTATION);
    }
    return this._rotation;
  }

  set scale(value) {
    if (value != null) {
      this._dirty_trs = true;
    }
    this._scale = value;
  }

  get scale() {
    this._dirty_trs = true;
    if (!this._scale) {
      this._scale = vec3.clone(DEFAULT_SCALE);
    }
    return this._scale;
  }

  waitForComplete() {
    let child_promises = [];
    for (let child of this.children) {
      child_promises.push(child.waitForComplete());
    }
    return Promise.all(child_promises).then(() => this);
  }
}

export class MeshNode extends Node {
  constructor(render_primitives) {
    super();

    if (render_primitives instanceof Array) {
      this._render_primitives = render_primitives;
    } else {
      this._render_primitives = [render_primitives];
    }

    for (let primitive of this._render_primitives) {
      primitive._instances.push(this);
    }
    this._active_frame_id = -1;
  }

  markActive(frame_id) {
    super.markActive(frame_id);
    if (this.visible) {
      this._active_frame_id = frame_id;
      for (let primitive of this._render_primitives) {
        primitive.markActive(frame_id);
      }
    }
  }

  waitForComplete() {
    let child_promises = [];
    for (let child of this.children) {
      child_promises.push(child.waitForComplete());
    }
    for (let primitive of this._render_primitives) {
      child_promises.push(primitive.waitForComplete());
    }
    return Promise.all(child_promises).then(() => this);
  }
}