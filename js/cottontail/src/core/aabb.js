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

export class AABB {
  constructor() {
    this.min = vec3.create();
    this.max = vec3.create();
  }

  // Create a clone of this node and all of it's children. Does not duplicate
  // RenderPrimitives, the cloned nodes will be treated as new instances of the
  // geometry.
  clone() {
    let clone_node = new Node();
    clone_node.name = this.name;
    clone_node.visible = this.visible;

    clone_node._dirty_trs = this._dirty_trs;

    if (this._translation) {
      clone_node._translation = vec3.create();
      vec3.copy(clone_node._translation, this._translation);
    }

    if (this._rotation) {
      clone_node._rotation = quat.create();
      quat.copy(clone_node._rotation, this._rotation);
    }

    if (this._scale) {
      clone_node._scale = vec3.create();
      vec3.copy(clone_node._scale, this._scale);
    }

    // Only copy the matrices if they're not already dirty.
    if (!clone_node._dirty_trs && this._matrix) {
      clone_node._matrix = mat4.create();
      mat4.copy(clone_node._matrix, this._matrix);
    }

    clone_node._dirty_world_matrix = this._dirty_world_matrix;
    if (!clone_node._dirty_world_matrix && this._world_matrix) {
      clone_node._world_matrix = mat4.create();
      mat4.copy(clone_node._world_matrix, this._world_matrix);
    }

    if (this._render_primitives) {
      for (let primitive of this._render_primitives) {
        clone_node.addRenderPrimitive(primitive);
      }
    }

    for (let child of this.children) {
      clone_node.addNode(child.clone());
    }

    return clone_node;
  }

  markActive(frame_id) {
    if (this.visible && this._render_primitives) {
      this._active_frame_id = frame_id;
      for (let primitive of this._render_primitives) {
        primitive.markActive(frame_id);
      }
    }

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

  setMatrixDirty() {
    if (!this._dirty_world_matrix) {
      this._dirty_world_matrix = true;
      for (let child of this.children) {
        child.setMatrixDirty();
      }
    }
  }

  _updateLocalMatrix() {
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

  set matrix(value) {
    this._matrix = value;
    this.setMatrixDirty();
    this._dirty_trs = false;
    this._translation = null;
    this._rotation = null;
    this._scale = null;
  }

  get matrix() {
    this.setMatrixDirty();

    return this._updateLocalMatrix();
  }

  get world_matrix() {
    if (!this._world_matrix) {
      this._dirty_world_matrix = true;
      this._world_matrix = mat4.create();
    }

    if (this._dirty_world_matrix || this._dirty_trs) {
      if (this.parent) {
        // TODO: Some optimizations that could be done here if the node matrix
        // is an identity matrix.
        mat4.mul(this._world_matrix, this.parent.world_matrix, this._updateLocalMatrix());
      } else {
        mat4.copy(this._world_matrix, this._updateLocalMatrix());
      }
      this._dirty_world_matrix = false;
    }

    return this._world_matrix;
  }

  // TODO: Decompose matrix when fetching these?
  set translation(value) {
    if (value != null) {
      this._dirty_trs = true;
      this.setMatrixDirty();
    }
    this._translation = value;
  }

  get translation() {
    this._dirty_trs = true;
    this.setMatrixDirty();
    if (!this._translation) {
      this._translation = vec3.clone(DEFAULT_TRANSLATION);
    }
    return this._translation;
  }

  set rotation(value) {
    if (value != null) {
      this._dirty_trs = true;
      this.setMatrixDirty();
    }
    this._rotation = value;
  }

  get rotation() {
    this._dirty_trs = true;
    this.setMatrixDirty();
    if (!this._rotation) {
      this._rotation = quat.clone(DEFAULT_ROTATION);
    }
    return this._rotation;
  }

  set scale(value) {
    if (value != null) {
      this._dirty_trs = true;
      this.setMatrixDirty();
    }
    this._scale = value;
  }

  get scale() {
    this._dirty_trs = true;
    this.setMatrixDirty();
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
    if (this._render_primitives) {
      for (let primitive of this._render_primitives) {
        child_promises.push(primitive.waitForComplete());
      }
    }
    return Promise.all(child_promises).then(() => this);
  }

  get renderPrimitives() {
    return this._render_primitives;
  }

  addRenderPrimitive(primitive) {
    if (!this._render_primitives)
      this._render_primitives = [primitive];
    else
      this._render_primitives.push(primitive);
    primitive._instances.push(this);
  }

  removeRenderPrimitive(primitive) {
    if (!this._render_primitives)
      return;

    let index = this._render_primitives._instances.indexOf(primitive);
    if (index > -1) {
      this._render_primitives._instances.splice(index, 1);

      index = primitive._instances.indexOf(this);
      if (index > -1) {
        primitive._instances.splice(index, 1);
      }

      if (!this._render_primitives.length)
        this._render_primitives = null;
    }
  }

  clearRenderPrimitives() {
    if (this._render_primitives) {
      for (let primitive of this._render_primitives) {
        let index = primitive._instances.indexOf(this);
        if (index > -1) {
          primitive._instances.splice(index, 1);
        }
      }
      this._render_primitives = null;
    }
  }
}