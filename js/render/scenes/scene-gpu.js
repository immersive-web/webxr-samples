// Copyright 2026 The Immersive Web Community Group
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

import {RenderView} from '../core/renderer-gpu.js';
import {InputRenderer} from '../nodes/input-renderer.js';
import {StatsGPUViewer} from '../nodes/stats-viewer-gpu.js';
import {Node} from '../core/node.js';
import {vec3, quat} from '../math/gl-matrix.js';
import {Ray} from '../math/ray.js';

// A RenderView that is configured from an XRView and an XRGPUSubImage.
export class WebXRGPUView extends RenderView {
  constructor(view, subImage, colorView, depthView) {
    let viewport = subImage ? subImage.viewport : null;
    super(
      view ? view.projectionMatrix : null,
      view ? view.transform : null,
      viewport ? {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height,
      } : null,
      view ? view.eye : 'left'
    );
    // Store the GPUTextureViews for the renderer.
    this._colorView = colorView || null;
    this._depthView = depthView || null;
  }
}

export class GPUScene extends Node {
  constructor() {
    super();

    this._timestamp = -1;
    this._frameDelta = 0;
    this._statsStanding = false;
    this._stats = null;
    this._statsEnabled = false;

    this._inputRenderer = null;
    this._resetInputEndFrame = true;

    this._hoverFrame = 0;
    this._hoveredNodes = [];

    this.clear = true;
  }

  setRenderer(renderer) {
    this._setRenderer(renderer);
  }

  loseRenderer() {
    if (this._renderer) {
      this._stats = null;
      this._renderer = null;
      this._inputRenderer = null;
    }
  }

  get inputRenderer() {
    if (!this._inputRenderer) {
      this._inputRenderer = new InputRenderer();
      this.addNode(this._inputRenderer);
    }
    return this._inputRenderer;
  }

  updateInputSources(frame, refSpace) {
    let newHoveredNodes = [];
    let lastHoverFrame = this._hoverFrame;
    this._hoverFrame++;

    for (let inputSource of frame.session.inputSources) {
      let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);
      if (!targetRayPose) continue;

      if (inputSource.targetRayMode == 'tracked-pointer') {
        this.inputRenderer.addLaserPointer(targetRayPose.transform);
      }

      let hitResult = this.hitTest(targetRayPose.transform);
      if (hitResult) {
        this.inputRenderer.addCursor(hitResult.intersection);
        if (hitResult.node._hoverFrameId != lastHoverFrame) {
          hitResult.node.onHoverStart();
        }
        hitResult.node._hoverFrameId = this._hoverFrame;
        newHoveredNodes.push(hitResult.node);
      } else {
        let targetRay = new Ray(targetRayPose.transform.matrix);
        let cursorPos = vec3.fromValues(
          targetRay.origin[0], targetRay.origin[1], targetRay.origin[2]
        );
        vec3.add(cursorPos, cursorPos, [
          targetRay.direction[0], targetRay.direction[1], targetRay.direction[2],
        ]);
        this.inputRenderer.addCursor(cursorPos);
      }

      if (inputSource.gripSpace) {
        let gripPose = frame.getPose(inputSource.gripSpace, refSpace);
        if (gripPose) {
          this.inputRenderer.addController(
            gripPose.transform.matrix,
            inputSource.handedness,
            inputSource.profiles[0]
          );
        }
      }
    }

    for (let hoverNode of this._hoveredNodes) {
      if (hoverNode._hoverFrameId != this._hoverFrame) {
        hoverNode.onHoverEnd();
      }
    }
    this._hoveredNodes = newHoveredNodes;
  }

  handleSelect(inputSource, frame, refSpace) {
    let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);
    if (!targetRayPose) return;
    this.handleSelectPointer(targetRayPose.transform);
  }

  handleSelectPointer(rigidTransform) {
    if (rigidTransform) {
      let hitResult = this.hitTest(rigidTransform);
      if (hitResult) {
        hitResult.node.handleSelect();
      }
    }
  }

  enableStats(enable) {
    if (enable == this._statsEnabled) return;
    this._statsEnabled = enable;

    if (enable) {
      this._stats = new StatsGPUViewer();
      this._stats.selectable = true;
      this.addNode(this._stats);
      if (this._statsStanding) {
        this._stats.translation = [0, 0.1, -0.75];
      } else {
        this._stats.translation = [0, -0.3, -0.5];
      }
      this._stats.scale = [0.3, 0.3, 0.3];
      quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    } else {
      if (this._stats) {
        this.removeNode(this._stats);
        this._stats = null;
      }
    }
  }

  standingStats(enable) {
    this._statsStanding = enable;
    if (this._stats) {
      if (this._statsStanding) {
        this._stats.translation = [0, 0.1, -0.75];
      } else {
        this._stats.translation = [0, -0.3, -0.5];
      }
      this._stats.scale = [0.3, 0.3, 0.3];
      quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    }
  }

  // Draws the scene using the WebXR/WebGPU binding.
  // binding: XRGPUBinding instance
  // layer: XRProjectionLayer created via binding.createProjectionLayer()
  drawXRFrame(xrFrame, pose, binding, layer) {
    if (!this._renderer || !pose) return;

    let renderer = this._renderer;
    let views = [];

    for (let view of pose.views) {
      let subImage = binding.getViewSubImage(layer, view);
      let viewDesc = subImage.getViewDescriptor();

      let colorView = subImage.colorTexture.createView(viewDesc);
      let depthView = null;
      if (subImage.depthStencilTexture) {
        depthView = subImage.depthStencilTexture.createView(viewDesc);
      }

      views.push(new WebXRGPUView(view, subImage, colorView, depthView));
    }

    this.drawViewArray(views);
  }

  drawViewArray(views) {
    if (!this._renderer) return;
    this._renderer.drawViews(views, this);
  }

  startFrame() {
    let prevTimestamp = this._timestamp;
    this._timestamp = performance.now();
    if (this._stats) {
      this._stats.begin();
    }

    if (prevTimestamp >= 0) {
      this._frameDelta = this._timestamp - prevTimestamp;
    } else {
      this._frameDelta = 0;
    }

    this._update(this._timestamp, this._frameDelta);
    return this._frameDelta;
  }

  endFrame() {
    if (this._inputRenderer && this._resetInputEndFrame) {
      this._inputRenderer.reset();
    }
    if (this._stats) {
      this._stats.end();
    }
  }

  onLoadScene(renderer) {
    return Promise.resolve();
  }
}
