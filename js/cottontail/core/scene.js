// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Renderer, View } from './renderer.js'
/*import { InputRenderer } from '../input-renderer.js'*/
import { Program } from './program.js'
import { TextureCache } from './texture.js'

export class Scene {
  constructor() {
    this._gl = null;

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_enabled = true;
    this._stats_standing = false;
    this._stats = null;
    this._stats_mat = mat4.create();

    this._renderer = null;

    this.texture_loader = null;

    this._debug_renderer = null;
    this._debug_geometries = [];

    this._pointer_renderer = null;
    this._lasers = [];
    this._cursors = [];
  }

  setWebGLContext(gl) {
    this._gl = gl;

    if (gl) {
      this._renderer = new Renderer(gl);
      //this.texture_loader = new WGLUTextureLoader(gl);

      /*if (this._stats_enabled) {
        this._stats = new WGLUStats(gl);
      }
      
      if (this._debug_geometries.length) {
        this._debug_renderer = new WGLUDebugGeometry(gl);
      }

      if (this._lasers.length || this._cursors.length) {
        this._pointer_renderer = new WebVRLaserRenderer(gl);
      }*/

      this.onLoadScene(gl, this._renderer);
    }
  }

  loseWebGLContext() {
    if (this._gl) {
      this._gl = null;
      this._stats = null;
      this.texture_loader = null;
      this._renderer = null;
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

  pushLaserPointer(pointer_mat) {
    this._lasers.push(pointer_mat);

    // Create the pointer renderer if needed.
    /*if (!this._pointer_renderer && this._gl) {
      this._pointer_renderer = new WebVRLaserRenderer(this._gl);
    }*/
  }

  pushCursor(cursor_pos) {
    this._cursors.push(cursor_pos);

    // Create the pointer renderer if needed.
    /*if (!this._pointer_renderer && this._gl) {
      this._pointer_renderer = new WebVRLaserRenderer(this._gl);
    }*/
  }

  draw(projection_mat, view_mat, eye) {
    let view = new View();
    view.projection_matrix = projection_mat;
    view.view_matrix = view_mat;
    if (eye) {
      view.eye = eye;
    }

    this.drawViewArray([view]);
  }

  /** Draws the scene into the base layer of the VRFrame's session */
  drawVRFrame(vr_frame, pose) {
    let gl = this._gl;
    let session = vr_frame.session;
    // Assumed to be a VRWebGLLayer for now.
    let layer = session.baseLayer;

    if(!gl) {
      return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!pose) {
      return;
    }

    let views = [];
    for (let view of vr_frame.views) {
      views.push(new View(view, pose, layer));
    }

    this.drawViewArray(views);
  }

  drawViewArray(views) {
    if (!this._gl) {
      // Don't draw when we don't have a valid context
      return;
    }

    /*if (this._stats_enabled) {
      this._onDrawStats(views);
    }

    this._onDrawDebugGeometry(views);*/

    this.onDrawViews(this._gl, this._renderer, this._timestamp, views);

    // Because of the blending used when drawing the lasers/cursors they should
    // always be drawn last.
    //this._onDrawPointers(views);
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
    this._lasers.length = 0;
    this._cursors.length = 0;

    if (this._stats) {
      this._stats.end();
    }
  }

  // Override to load scene resources on construction or context restore.
  onLoadScene(gl) {
    return Promise.resolve();
  }

  // Override with custom scene rendering.
  onDrawViews(gl, renderer, timestamp, views) {}

  _onDrawStats(views) {
    let gl = this._gl;
    for (let view of views) {
      if (view.viewport) {
        let vp = view.viewport;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }

      // To ensure that the FPS counter is visible in VR mode we have to
      // render it as part of the scene.
      if (this._stats_standing) {
        mat4.fromTranslation(this._stats_mat, [0, 1.4, -0.75]);
      } else {
        mat4.fromTranslation(this._stats_mat, [0, -0.3, -0.5]);
      }
      mat4.scale(this._stats_mat, this._stats_mat, [0.3, 0.3, 0.3]);
      mat4.rotateX(this._stats_mat, this._stats_mat, -0.75);
      mat4.multiply(this._stats_mat, view.view_mat, this._stats_mat);

      this._stats.render(view.projection_mat, this._stats_mat);
    }
  }

  _onDrawDebugGeometry(views) {
    let gl = this._gl;
    if (this._debug_renderer && this._debug_geometries.length) {
      for (let view of views) {
        if (view.viewport) {
          let vp = view.viewport;
          gl.viewport(vp.x, vp.y, vp.width, vp.height);
        }
        this._debug_renderer.bind(view.projection_mat, view.view_mat);

        for (let geom of this._debug_geometries) {
          if (!geom.visible)
            continue;

          switch(geom.type) {
            case "box":
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

  _onDrawPointers(views) {
    if (this._pointer_renderer && (this._lasers.length || this._cursors.length)) {
      this._pointer_renderer.drawRays(views, this._lasers);
      this._pointer_renderer.drawCursors(views, this._cursors);
    }
  }
}
