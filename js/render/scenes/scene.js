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

import {RenderView} from '../core/renderer.js';
import {InputRenderer} from '../nodes/input-renderer.js';
import {StatsViewer} from '../nodes/stats-viewer.js';
import {Node} from '../core/node.js';
import {vec3, quat} from '../math/gl-matrix.js';
import {Ray} from '../math/ray.js';

export class WebXRView extends RenderView {
  constructor(view, layer, viewport, depthdata) {
    super(
      view ? view.projectionMatrix : null,
      view ? view.transform : null,
      viewport ? viewport : ((layer && view) ? layer.getViewport(view) : null),
      view ? view.eye : 'left',
      depthdata
    );
  }
}

export class Scene extends Node {
  constructor() {
    super();

    this._timestamp = -1;
    this._frameDelta = 0;
    this._statsStanding = false;
    this._stats = null;
    this._statsEnabled = false;
    this.enableStats(true); // Ensure the stats are added correctly by default.

    this._inputRenderer = null;
    this._resetInputEndFrame = true;

    this._lastTimestamp = 0;

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

  // Helper function that automatically adds the appropriate visual elements for
  // all input sources.
  updateInputSources(frame, refSpace) {
    let newHoveredNodes = [];
    let lastHoverFrame = this._hoverFrame;
    this._hoverFrame++;

    for (let inputSource of frame.session.inputSources) {
      let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);

      if (!targetRayPose) {
        continue;
      }

      if (inputSource.targetRayMode == 'tracked-pointer') {
        // If we have a pointer matrix and the pointer origin is the users
        // hand (as opposed to their head or the screen) use it to render
        // a ray coming out of the input device to indicate the pointer
        // direction.
        this.inputRenderer.addLaserPointer(targetRayPose.transform);
      }

      // If we have a pointer matrix we can also use it to render a cursor
      // for both handheld and gaze-based input sources.

      // Check and see if the pointer is pointing at any selectable objects.
      let hitResult = this.hitTest(targetRayPose.transform);

      if (hitResult) {
        // Render a cursor at the intersection point.
        this.inputRenderer.addCursor(hitResult.intersection);

        if (hitResult.node._hoverFrameId != lastHoverFrame) {
          hitResult.node.onHoverStart();
        }
        hitResult.node._hoverFrameId = this._hoverFrame;
        newHoveredNodes.push(hitResult.node);
      } else {
        // Statically render the cursor 1 meters down the ray since we didn't
        // hit anything selectable.
        let targetRay = new Ray(targetRayPose.transform.matrix);
        let cursorDistance = 1.0;
        let cursorPos = vec3.fromValues(
            targetRay.origin[0], //x
            targetRay.origin[1], //y
            targetRay.origin[2]  //z
            );
        vec3.add(cursorPos, cursorPos, [
            targetRay.direction[0] * cursorDistance,
            targetRay.direction[1] * cursorDistance,
            targetRay.direction[2] * cursorDistance,
            ]);
        // let cursorPos = vec3.fromValues(0, 0, -1.0);
        // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay);
        this.inputRenderer.addCursor(cursorPos);
      }

      if (inputSource.gripSpace) {
        let gripPose = frame.getPose(inputSource.gripSpace, refSpace);

        // Any time that we have a grip matrix, we'll render a controller.
        if (gripPose) {
          this.inputRenderer.addController(gripPose.transform.matrix, inputSource.handedness, inputSource.profiles[0]);
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

    if (!targetRayPose) {
      return;
    }

    this.handleSelectPointer(targetRayPose.transform);
  }

  handleSelectPointer(rigidTransform) {
    if (rigidTransform) {
      // Check and see if the pointer is pointing at any selectable objects.
      let hitResult = this.hitTest(rigidTransform);

      if (hitResult) {
        // Render a cursor at the intersection point.
        hitResult.node.handleSelect();
      }
    }
  }

  enableStats(enable) {
    if (enable == this._statsEnabled) {
      return;
    }

    this._statsEnabled = enable;

    if (enable) {
      this._stats = new StatsViewer();
      this._stats.selectable = true;
      this.addNode(this._stats);

      if (this._statsStanding) {
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
    this._statsStanding = enable;
    if (this._stats) {
      if (this._statsStanding) {
        this._stats.translation = [0, 1.4, -0.75];
      } else {
        this._stats.translation = [0, -0.3, -0.5];
      }
      this._stats.scale = [0.3, 0.3, 0.3];
      quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    }
  }

  draw(projectionMatrix, viewTransform, eye) {
    let view = new RenderView(projectionMatrix, viewTransform);
    if (eye) {
      view.eye = eye;
    }

    this.drawViewArray([view]);
  }

  /** Draws the scene into the base layer of the XRFrame's session */
  drawXRFrame(xrFrame, pose, layer, depthData) {
    if (!this._renderer || !pose) {
      return;
    }

    let gl = this._renderer.gl;
    let renderer = this._renderer;
    let session = xrFrame.session;
    // Assumed to be a XRWebGLLayer for now.
    let xrlayer = session.renderState.baseLayer;
    let views = [];

    // If there is no base layer, we know that we're dealing with xr layers
    if (!xrlayer) {
      xrlayer = layer ? layer : session.renderState.layers[0];
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.xrFramebuffer);

      for (let view of pose.views) {
        let glLayer = renderer.getXrBinding(session).getViewSubImage(xrlayer, view);  

        if (view == pose.views[0]) {
          if (renderer.multisampledMultiview) {
            renderer.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glLayer.colorTexture, 0, renderer.maxSamples, 0, 2);
          } else if (renderer.multiview) {
            renderer.multiviewExtension.framebufferTextureMultiviewOVR(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glLayer.colorTexture, 0, 0, 2);
          } else {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glLayer.colorTexture, 0);
          }

          if (glLayer.depthStencilTexture) {
            if (renderer.multisampledMultiview) {
              renderer.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, glLayer.depthStencilTexture, 0, renderer.maxSamples, 0, 2);
            } else if (renderer.multiview) {
              renderer.multiviewExtension.framebufferTextureMultiviewOVR(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, glLayer.depthStencilTexture, 0, 0, 2);
            } else {
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, glLayer.depthStencilTexture, 0);
            }
          }
        }
        views.push(new WebXRView(view, glLayer, glLayer.viewport));
      }
    } else {
      // only baseLayer has framebuffer and we need to bind it
      // even if it is null (for inline sessions)
      gl.bindFramebuffer(gl.FRAMEBUFFER, xrlayer.framebuffer);

      for (let view of pose.views) {
        views.push(new WebXRView(view, xrlayer));
      }
    }

    if (this.clear) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    this.drawViewArray(views, depthData);
  }

  drawViewArray(views, depthData) {
    // Don't draw when we don't have a valid context
    if (!this._renderer) {
      return;
    }

    this._renderer.drawViews(views, this, depthData);
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

  // Override to load scene resources on construction or context restore.
  onLoadScene(renderer) {
    return Promise.resolve();
  }
}
