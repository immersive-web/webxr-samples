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

import { Renderer, RenderView } from '../core/renderer.js'
import { BoundsRenderer } from '../nodes/bounds-renderer.js'
import { InputRenderPrimitives } from '../nodes/input-renderer.js'
import { Skybox } from '../nodes/skybox.js'
import { StatsViewer } from '../nodes/stats-viewer.js'
import { Program } from '../core/program.js'
import { Node } from '../core/node.js'
import { GLTF2Loader } from '../loaders/gltf2.js'

export class WebXRView extends RenderView {
  constructor(view, pose, layer) {
    super(
      view ? view.projectionMatrix : null,
      (pose && view) ? pose.getViewMatrix(view) : null,
      (layer && view) ? view.getViewport(layer) : null,
      view ? view.eye : 'left'
    );
  }
}

export class Scene extends Node {
  constructor() {
    super();

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_enabled = true;
    this._stats_standing = false;
    this._stats = null;
    this._stage_bounds = null;
    this._bounds_renderer = null;

    this._renderer = null;

    this.texture_loader = null;

    this._debug_renderer = null;
    this._debug_geometries = [];

    this._input_renderer = null;

    this._last_laser = 0;
    this._last_cursor = 0;
    this._lasers = [];
    this._cursors = [];

    this._skybox = null;
    this._gltf2_loader = null;
  }

  setRenderer(renderer) {
    this._renderer = renderer;

    // Set up a non-black clear color so that we can see if something renders
    // wrong.
    renderer.gl.clearColor(0.1, 0.2, 0.3, 1.0);

    if (renderer) {
      this._gltf2_loader = new GLTF2Loader(renderer);

      if (this._skybox) {
        this._skybox.setRenderer(renderer);
      }

      if (this._stats_enabled) {
        this._stats = new StatsViewer(this._renderer);
        this.addNode(this._stats);

        if (this._stats_standing) {
          this._stats.translation = [0, 1.4, -0.75];
        } else {
          this._stats.translation = [0, -0.3, -0.5];
        }
        this._stats.scale = [0.3, 0.3, 0.3];
        quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
      }

      if (this._stage_bounds) {
        this._bounds_renderer = new BoundsRenderer(this._renderer);
        this._bounds_renderer.stage_bounds = this._stage_bounds;
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

  setSkybox(image_url) {
    if (this._skybox) {
      this.removeNode(this._skybox);
      this._skybox = null;
    }
    if (image_url) {
      this._skybox = new Skybox(image_url);
      this.addNode(this._skybox);

      if (this._renderer)
        this._skybox.setRenderer(this._renderer);
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

  get gltf2Loader() {
    return this._gltf2_loader;
  }

  enableStats(enable) {
    if (enable == this._stats_enabled)
      return;

    this._stats_enabled = enable;

    if (enable && this._renderer) {
      this._stats = new StatsViewer(this._renderer);
      this.addNode(this._stats);

      if (this._stats_standing) {
        this._stats.translation = [0, 1.4, -0.75];
      } else {
        this._stats.translation = [0, -0.3, -0.5];
      }
      this._stats.scale = [0.3, 0.3, 0.3];
      quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);

    } else if (!enable) {
      if (this._stats) {
        this.removeNode(this._stats);
        this._stats = null;
      }
    }
  }

  standingStats(enable) {
    this._stats_standing = enable;
  }

  setBounds(stage_bounds) {
    this._stage_bounds = stage_bounds;
    if (!this._bounds_renderer && this._renderer) {
      this._bounds_renderer = new BoundsRenderer(this._renderer);
    }
    if (this._bounds_renderer) {
      this._bounds_renderer.stage_bounds = stage_bounds;
    }
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
      this._debug_renderer = new WGLUDebugGeometry(this._renderer.gl);
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
    let view = new RenderView();
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

    let gl = this._renderer.gl;
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
      views.push(new WebXRView(view, pose, layer));
    }

    this.drawViewArray(views);
  }

  drawViewArray(views) {
    if (!this._renderer) {
      // Don't draw when we don't have a valid context
      return;
    }

    this.onDrawViews(this._renderer, this._timestamp, views);
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
  onDrawViews(renderer, timestamp, views) {
    renderer.drawViews(views, this);
  }

  _onDrawStats(views) {
    let gl = this._renderer.gl;
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
    let gl = this._renderer.gl;
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
