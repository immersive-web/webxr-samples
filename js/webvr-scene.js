// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebVRScene {
  constructor() {
    this._gl = null;

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_enabled = true;
    this._stats_standing = false;
    this._stats = null;
    this._stats_mat = mat4.create();

    this.texture_loader = null;
  }

  setWebGLContext(gl) {
    this._gl = gl;

    if (gl) {
      if (this._stats_enabled) {
        this._stats = new WGLUStats(gl);
      }
      this.texture_loader = new WGLUTextureLoader(gl);

      this.onLoadScene(gl);
    }
  }

  loseWebGLContext() {
    if (this._gl) {
      this._gl = null;
      this._stats = null;
      this.texture_loader = null;
    }
  }

  enableStats(enable) {
    if (enable == this._stats_enabled)
      return;

    this._stats_enabled = enable;

    if (enable && this.gl) {
      this._stats = new WGLUStats(this.gl);
    } else if (!enable) {
      this._stats = null;
    }
  }

  standingStats(enable) {
    this._stats_standing = enable;
  }

  draw(projection_mat, view_mat, eye) {
    if (!this._gl) {
      // Don't draw when we don't have a valid context
      return;
    }

    // If an eye wasn't given just assume the left eye.
    if (!eye) {
      eye = "left";
    }

    this.onDrawView(this._gl, this._timestamp, projection_mat, view_mat, eye);

    if (this._stats_enabled) {
      this._onDrawStats(projection_mat, view_mat);
    }
  }

  startFrame() {
    let prev_timestamp = this._timestamp;
    this._timestamp = performance.now();
    if (this._stats) {
      this._stats.begin();
    }

    if (prev_timestamp >= 0) {
      this._frame_delta = this._timestamp - prev_timestamp;
    } else {
      this._frame_delta = 0;
    }

    return this._frame_delta;
  }

  endFrame() {
    if (this._stats) {
      this._stats.end();
    }
  }

  // Override to load scene resources on construction or context restore.
  onLoadScene(gl) {}

  // Override with custom scene rendering.
  onDrawView(gl, timestamp, projection_mat, view_mat, eye) {}

  _onDrawStats(projection_mat, view_mat) {
    // To ensure that the FPS counter is visible in VR mode we have to
    // render it as part of the scene.
    if (this._stats_standing) {
      mat4.fromTranslation(this._stats_mat, [0, 1.4, -0.75]);
    } else {
      mat4.fromTranslation(this._stats_mat, [0, -0.3, -0.5]);
    }
    mat4.scale(this._stats_mat, this._stats_mat, [0.3, 0.3, 0.3]);
    mat4.rotateX(this._stats_mat, this._stats_mat, -0.75);
    mat4.multiply(this._stats_mat, view_mat, this._stats_mat);
    this._stats.render(projection_mat, this._stats_mat);
  }
}
