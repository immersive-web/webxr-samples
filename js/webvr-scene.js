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

    this._debug_geometries = [];
    this._debug_renderer = null;
  }

  setWebGLContext(gl) {
    this._gl = gl;

    if (gl) {
      if (this._stats_enabled) {
        this._stats = new WGLUStats(gl);
      }
      this.texture_loader = new WGLUTextureLoader(gl);

      if (this._debug_geometries.length) {
        this._debug_renderer = new WGLUDebugGeometry(gl);
      }

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

  createDebugGeometry(type) {
    let geometry = {
      type: type,
      transform: mat4.create(),
      color: [1.0, 1.0, 1.0, 1.0],
      visible: true
    };
    this._debug_geometries.push(geometry);

    // Create the debug geometry renderer if needed.
    if (!this._debug_renderer && this._gl) {
      this._debug_renderer = new WGLUDebugGeometry(this._gl);
    }

    return geometry;
  }

  draw(projection_mat, view_mat, eye) {
    // If an eye wasn't given just assume the left eye.
    if (!eye) {
      eye = "left";
    }

    this.drawViewportArray([projection_mat], [view_mat], null, [eye]);
  }

  drawViewportArray(projection_mats, view_mats, viewports, eyes) {
    if (!this._gl) {
      // Don't draw when we don't have a valid context
      return;
    }

    // If an eye wasn't given just assume the left eye.
    if (!eyes) {
      eyes = new Array(view_mats.length);
      eyes.fill("left");
    }

    if (this._stats_enabled) {
      this._onDrawStats(projection_mats, view_mats, viewports);
    }

    if (this._debug_geometries.length) {
      this._onDrawDebugGeometry(projection_mats, view_mats, viewports);
    }

    this.onDrawViews(this._gl, this._timestamp, projection_mats, view_mats, viewports, eyes);
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
  onDrawViews(gl, timestamp, projection_mat, view_mat, viewports, eye) {}

  _onDrawStats(projection_mats, view_mats, viewports) {
    for (let i = 0; i < view_mats.length; ++i) {
      if (viewports) {
        let vp = viewports[i];
        this._gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }
      let projection_mat = projection_mats[i];
      let view_mat = view_mats[i];

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

  _onDrawDebugGeometry(projection_mats, view_mats, viewports) {
    if (this._debug_renderer) {
      for (let i = 0; i < view_mats.length; ++i) {
        if (viewports) {
          let vp = viewports[i];
          this._gl.viewport(vp.x, vp.y, vp.width, vp.height);
        }
        let projection_mat = projection_mats[i];
        let view_mat = view_mats[i];

        this._debug_renderer.bind(projection_mat, view_mat);

        for (let geom of this._debug_geometries) {
          if (!geom.visible)
            continue;

          switch(geom.type) {
            case "cube":
              this._debug_renderer.drawBoxWithMatrix(geom.transform, geom.color);
              break;
            case "cone":
              this._debug_renderer.drawConeWithMatrix(geom.transform, geom.color);
              break;
            case "axes":
              this._debug_renderer.drawCoordinateAxes(geom.transform);
              break;
            default:
              break;
          }
        }
      }
    }
  }
}
