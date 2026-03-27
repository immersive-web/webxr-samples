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

import {WebXRButton} from './util/webxr-button.js';
import {GPUScene} from './render/scenes/scene-gpu.js';
import {GPURenderer, createWebGPUContext} from './render/core/renderer-gpu.js';

export class WebXRGPUSampleApp {
  constructor(options) {
    if (!options) { options = {}; }

    this.options = {
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || 'local',
      defaultInputHandling: 'defaultInputHandling' in options ? options.defaultInputHandling : true,
      depthStencilFormat: options.depthStencilFormat || 'depth24plus',
    };

    this.device = null;
    this.renderer = null;
    this.scene = new GPUScene();
    this.binding = null;
    this.layer = null;

    this.xrButton = new WebXRButton({
      onRequestSession: () => { return this.onRequestSession(); },
      onEndSession: (session) => { this.onEndSession(session); },
    });

    this.immersiveRefSpace = null;

    this.frameCallback = (time, frame) => {
      let session = frame.session;
      let refSpace = this.immersiveRefSpace;

      session.requestAnimationFrame(this.frameCallback);
      this.scene.startFrame();

      this.onXRFrame(time, frame, refSpace);

      this.scene.endFrame();
    };
  }

  async run() {
    await this.onInitWebGPU();
    this.onInitXR();
  }

  async onInitWebGPU() {
    this.device = await createWebGPUContext({ xrCompatible: true });
    if (!this.device) {
      console.error('Failed to initialize WebGPU.');
      return;
    }
  }

  onInitXR() {
    if (navigator.xr) {
      navigator.xr.isSessionSupported(this.options.immersiveMode).then((supported) => {
        this.xrButton.enabled = supported;
      });
    }
  }

  onRequestSession() {
    return navigator.xr.requestSession(this.options.immersiveMode, {
      requiredFeatures: [this.options.referenceSpace, 'webgpu'],
    }).then((session) => {
      this.xrButton.setSession(session);
      session.isImmersive = true;
      this.onSessionStarted(session);
    });
  }

  onEndSession(session) {
    session.end();
  }

  onSessionStarted(session) {
    session.addEventListener('end', (event) => {
      this.onSessionEnded(event.session);
    });

    if (this.options.defaultInputHandling) {
      session.addEventListener('select', (event) => {
        let refSpace = this.immersiveRefSpace;
        this.scene.handleSelect(event.inputSource, event.frame, refSpace);
      });
    }

    // Create the XRGPUBinding.
    this.binding = new XRGPUBinding(session, this.device);

    // Get the preferred color format from the binding.
    let colorFormat = this.binding.getPreferredColorFormat();

    // Create a projection layer.
    this.layer = this.binding.createProjectionLayer({
      colorFormat: colorFormat,
      depthStencilFormat: this.options.depthStencilFormat,
    });

    // Set the layer on the session.
    session.updateRenderState({ layers: [this.layer] });

    // Create the renderer with the matching color format.
    this.renderer = new GPURenderer(this.device, colorFormat);
    this.scene.setRenderer(this.renderer);

    // Request reference space.
    this.onRequestReferenceSpace(session).then((refSpace) => {
      this.immersiveRefSpace = refSpace;
      session.requestAnimationFrame(this.frameCallback);
    });
  }

  onRequestReferenceSpace(session) {
    return session.requestReferenceSpace(this.options.referenceSpace);
  }

  onSessionEnded(session) {
    if (session == this.xrButton.session) {
      this.xrButton.setSession(null);
    }
    this.binding = null;
    this.layer = null;
  }

  // Override to customize frame handling.
  onXRFrame(time, frame, refSpace) {
    let pose = frame.getViewerPose(refSpace);
    if (this.options.defaultInputHandling) {
      this.scene.updateInputSources(frame, refSpace);
    }
    this.scene.drawXRFrame(frame, pose, this.binding, this.layer);
  }

  get session() {
    return this.xrButton.session;
  }
}
