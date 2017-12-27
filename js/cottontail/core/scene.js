// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Renderer, View } from './renderer.js'
import { InputRenderPrimitives } from '../utility/input-renderer.js'
import { StatsViewer } from '../utility/stats-viewer.js'
import { Program } from './program.js'
import { TextureCache } from './texture.js'
import { Node } from './node.js'

export class Scene extends Node {
  constructor() {
    super();

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_enabled = true;
    this._stats_standing = false;
    this._stats = null;
    this._stats_node = null;

    this._renderer = null;

    this.texture_loader = null;

    this._debug_renderer = null;
    this._debug_geometries = [];

    this._input_renderer = null;

    this._last_laser = 0;
    this._last_cursor = 0;
    this._lasers = [];
    this._cursors = [];
  }

  setRenderer(renderer) {
    this._renderer = renderer;

    if (renderer) {
      //this.texture_loader = new WGLUTextureLoader(gl);

      if (this._stats_enabled) {
        this._stats = new StatsViewer(this._renderer);
        this._stats_node = this._stats.getNode();
        this.addNode(this._stats_node);

        if (this._stats_standing) {
          this._stats_node.translation = [0, 1.4, -0.75];
        } else {
          this._stats_node.translation = [0, -0.3, -0.5];
        }
        this._stats_node.scale = [0.3, 0.3, 0.3];
      }
      
      /*if (this._debug_geometries.length) {
        this._debug_renderer = new WGLUDebugGeometry(gl);
      }*/

      if (this._lasers.length || this._cursors.length) {
        this._input_renderer = new InputRenderPrimitives(this._renderer);
      }

      this.onLoadScene(this._renderer);
    }
  }

  loseRenderer() {
    if (this._renderer) {
      this._stats = null;
      this.texture_loader = null;
      this._renderer = null;
      this._input_renderer = null;
    }
  }

  enableStats(enable) {
    if (enable == this._stats_enabled)
      return;

    this._stats_enabled = enable;

    if (enable && this._renderer) {
      this._stats = new StatsViewer(this._renderer);
      this._stats_node = this._stats.getNode();
      this.addNode(this._stats_node);

      if (this._stats_standing) {
        this._stats_node.translation = [0, 1.4, -0.75];
      } else {
        this._stats_node.translation = [0, -0.3, -0.5];
      }
      this._stats_node.scale = [0.3, 0.3, 0.3];
      //this._stats_node.rotateX(-0.75);

    } else if (!enable) {
      this._stats = null;
      if (this._stats_node) {
        this.removeNode(this._stats_node);
        this._stats_node = null;
      }
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
    if (!this._debug_renderer && this._renderer) {
      this._debug_renderer = new WGLUDebugGeometry(this._renderer._gl);
    }

    return geometry;
  }

  pushLaserPointer(pointer_matrix) {
    // Create the pointer renderer if needed.
    if (!this._input_renderer && this._renderer) {
      this._input_renderer = new InputRenderPrimitives(this._renderer);
    }

    if (this._last_laser < this._lasers.length) {
      this._lasers[this._last_laser].matrix = pointer_matrix;
      this._lasers[this._last_laser].visible = true;
    } else {
      let laser_node = this._input_renderer.getLaserNode();
      laser_node.matrix = pointer_matrix;
      this.addNode(laser_node);
      this._lasers.push(laser_node);
    }
    this._last_laser++;
  }

  pushCursor(cursor_pos) {
    // Create the pointer renderer if needed.
    if (!this._input_renderer && this._renderer) {
      this._input_renderer = new InputRenderPrimitives(this._renderer);
    }

    if (this._last_cursor < this._cursors.length) {
      this._cursors[this._last_cursor].translation = cursor_pos;
      this._cursors[this._last_cursor].visible = true;
    } else {
      let cursor_node = this._input_renderer.getCursorNode();
      cursor_node.translation = cursor_pos;
      this.addNode(cursor_node);
      this._cursors.push(cursor_node);
    }
    this._last_cursor++;
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

  /** Draws the scene into the base layer of the XRFrame's session */
  drawXRFrame(xr_frame, pose) {
    if (!this._renderer) {
      return;
    }

    let gl = this._renderer._gl;
    let session = xr_frame.session;
    // Assumed to be a XRWebGLLayer for now.
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
    for (let view of xr_frame.views) {
      views.push(new View(view, pose, layer));
    }

    this.drawViewArray(views);
  }

  drawViewArray(views) {
    if (!this._renderer) {
      // Don't draw when we don't have a valid context
      return;
    }

    /*if (this._stats_enabled) {
      this._onDrawStats(views);
    }

    this._onDrawDebugGeometry(views);*/

    this.onDrawViews(this._renderer, this._timestamp, views);

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
    for (let laser of this._lasers) {
      laser.visible = false;
    }
    for (let cursor of this._cursors) {
      cursor.visible = false;
    }
    this._last_laser = 0;
    this._last_cursor = 0;

    if (this._stats) {
      this._stats.end();
    }
  }

  // Override to load scene resources on construction or context restore.
  onLoadScene(renderer) {
    return Promise.resolve();
  }

  // Override with custom scene rendering.
  onDrawViews(renderer, timestamp, views) {}

  _onDrawStats(views) {
    let gl = this._renderer._gl;
    for (let view of views) {
      if (view.viewport) {
        let vp = view.viewport;
        gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }

      // To ensure that the FPS counter is visible in XR mode we have to
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
    let gl = this._renderer._gl;
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
