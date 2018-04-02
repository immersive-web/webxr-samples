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
import { InputRenderer } from '../nodes/input-renderer.js'
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
      (layer && view) ? layer.getViewport(view) : null,
      view ? view.eye : 'left'
    );
  }
}

export class Scene extends Node {
  constructor() {
    super();

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_standing = false;
    this._stats = null;
    this._stats_enabled = false;
    this.enableStats(true); // Ensure the stats are added correctly by default.
    this._stage_bounds = null;
    this._bounds_renderer = null;

    this._input_renderer = null;
    this._reset_input_end_frame = true;

    this._skybox = null;
    this._gltf2_loader = null;

    this._last_timestamp = 0;

    this._hover_frame = 0;
    this._hovered_nodes = [];
  }

  setRenderer(renderer) {
    // Set up a non-black clear color so that we can see if something renders
    // wrong.
    renderer.gl.clearColor(0.1, 0.2, 0.3, 1.0);

    this._gltf2_loader = new GLTF2Loader(renderer);

    this._setRenderer(renderer);
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

  get inputRenderer() {
    if (!this._input_renderer) {
      this._input_renderer = new InputRenderer();
      this.addNode(this._input_renderer);
    }
    return this._input_renderer;
  }

  // Helper function that automatically adds the appropriate visual elements for
  // all input sources.
  updateInputSources(frame, frame_of_ref) {
    // FIXME: Check for the existence of the API first. This check should be
    // removed once the input API is part of the official spec.
    if (!frame.session.getInputSources)
      return;

    let input_sources = frame.session.getInputSources();

    let new_hovered_nodes = [];
    let last_hover_frame = this._hover_frame;
    this._hover_frame++;

    for (let input_source of input_sources) {
      let input_pose = frame.getInputPose(input_source, frame_of_ref);

      if (!input_pose) {
        continue;
      }

      // Any time that we have a grip matrix, we'll render a controller.
      if (input_pose.gripMatrix) {
        this.inputRenderer.addController(input_pose.gripMatrix);
      }

      if (input_pose.pointerMatrix) {
        if (input_source.pointerOrigin == "hand") {
          // If we have a pointer matrix and the pointer origin is the users
          // hand (as opposed to their head or the screen) use it to render
          // a ray coming out of the input device to indicate the pointer
          // direction.
          this.inputRenderer.addLaserPointer(input_pose.pointerMatrix);
        }

        // If we have a pointer matrix we can also use it to render a cursor
        // for both handheld and gaze-based input sources.

        // Check and see if the pointer is pointing at any selectable objects.
        let hit_result = this.hitTest(input_pose.pointerMatrix);

        if (hit_result) {
          // Render a cursor at the intersection point.
          this.inputRenderer.addCursor(hit_result.intersection);

          if (hit_result.node._hover_frame_id != last_hover_frame) {
            hit_result.node.onHoverStart();
          }
          hit_result.node._hover_frame_id = this._hover_frame;
          new_hovered_nodes.push(hit_result.node);
        } else {
          // Statically render the cursor 1 meters down the ray since we didn't
          // hit anything selectable.
          let cursor_pos = vec3.fromValues(0, 0, -1.0);
          vec3.transformMat4(cursor_pos, cursor_pos, input_pose.pointerMatrix);
          this.inputRenderer.addCursor(cursor_pos);
        }
      }
    }

    for (let hover_node of this._hovered_nodes) {
      if (hover_node._hover_frame_id != this._hover_frame) {
        hover_node.onHoverEnd();
      }
    }

    this._hovered_nodes = new_hovered_nodes;
  }

  handleSelect(input_source, frame, frame_of_ref) {
    let input_pose = frame.getInputPose(input_source, frame_of_ref);

    if (!input_pose) {
      return;
    }

    this.handleSelectPointer(input_pose.pointerMatrix);
  }

  handleSelectPointer(pointer_matrix) {
    if (pointer_matrix) {
      // Check and see if the pointer is pointing at any selectable objects.
      let hit_result = this.hitTest(pointer_matrix);

      if (hit_result) {
        // Render a cursor at the intersection point.
        hit_result.node.onSelect();
      }
    }
  }

  enableStats(enable) {
    if (enable == this._stats_enabled)
      return;

    this._stats_enabled = enable;

    if (enable) {
      this._stats = new StatsViewer();
      this._stats.selectable = true;
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
    if (this._stats) {
      if (this._stats_standing) {
        this._stats.translation = [0, 1.4, -0.75];
      } else {
        this._stats.translation = [0, -0.3, -0.5];
      }
      this._stats.scale = [0.3, 0.3, 0.3];
      quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    }
  }

  setBounds(stage_bounds) {
    this._stage_bounds = stage_bounds;
    if (stage_bounds && !this._bounds_renderer) {
      this._bounds_renderer = new BoundsRenderer();
      this.addNode(this._bounds_renderer);
    }
    if (this._bounds_renderer) {
      this._bounds_renderer.stage_bounds = stage_bounds;
    }
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
    if (!this._renderer || !pose) {
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

    let views = [];
    for (let view of xr_frame.views) {
      views.push(new WebXRView(view, pose, layer));
    }

    this.drawViewArray(views);
  }

  drawViewArray(views) {
    // Don't draw when we don't have a valid context
    if (!this._renderer)
      return;

    this._renderer.drawViews(views, this);
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

    this._update(this._timestamp, this._frame_delta);

    return this._frame_delta;
  }

  endFrame() {
    if (this._input_renderer && this._reset_input_end_frame) {
      this._input_renderer.reset();
    }

    if (this._stats) {
      this._stats.end();
    }
  }

  // Override to load scene resources on construction or context restore.
  onLoadScene(renderer) {
    return Promise.resolve();
  }
}
