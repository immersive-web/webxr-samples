// Copyright 2019 The Immersive Web Community Group
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
import {Scene} from './render/scenes/scene.js';
import {Renderer, createWebGLContext} from './render/core/renderer.js';
import {InlineViewerHelper} from './util/inline-viewer-helper.js';

export class WebXRSampleApp {
  constructor(options) {
    // Application options and defaults
    if (!options) { options = {}; }

    this.options = {
      inline: 'inline' in options ? options.inline : true,
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || 'local',
      defaultInputHandling: 'defaultInputHandling' in options ? options.defaultInputHandling : true
    };

    this.gl = null;
    this.renderer = null;
    this.scene = new Scene();

    this.xrButton = new WebXRButton({
      onRequestSession: () => { return this.onRequestSession(); },
      onEndSession: (session) => { this.onEndSession(session); }
    });

    this.immersiveRefSpace = null;
    this.inlineViewerHelper = null;

    this.frameCallback = (time, frame) => {
      let session = frame.session;
      let refSpace = this.getSessionReferenceSpace(session);

      session.requestAnimationFrame(this.frameCallback);
      this.scene.startFrame();

      this.onXRFrame(time, frame, refSpace);

      this.scene.endFrame();
    };
  }

  getSessionReferenceSpace(session) {
    return session.isImmersive ? this.immersiveRefSpace : this.inlineViewerHelper.referenceSpace;
  }

  run() {
    this.onInitXR();
  }

  onInitXR() {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        this.xrButton.enabled = supported;
      });

      // Request an inline session if needed.
      if (this.options.inline) {
        navigator.xr.requestSession('inline').then((session) => {
          this.onSessionStarted(session);
        });
      }
    }
  }

  onCreateGL() {
    return createWebGLContext({
      xrCompatible: true
    });
  }

  onCreateXRLayer(session) {
    return new XRWebGLLayer(session, this.gl);
  }

  onInitRenderer() {
    if (this.gl)
      return;

    this.gl = this.onCreateGL();

    if(this.gl) {
      let canvas = this.gl.canvas;
      if (canvas instanceof HTMLCanvasElement) {
        document.body.append(this.gl.canvas);
        function onResize() {
          canvas.width = canvas.clientWidth * window.devicePixelRatio;
          canvas.height = canvas.clientHeight * window.devicePixelRatio;
        }
        window.addEventListener('resize', onResize);
        onResize();
      }

      this.renderer = new Renderer(this.gl);
      this.scene.setRenderer(this.renderer);
    }
  }

  onRequestSession() {
    // Called when the button gets clicked. Requests an immersive session.
    return navigator.xr.requestSession(this.options.immersiveMode, {
        requiredFeatures: [this.options.referenceSpace]
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
        let refSpace = this.getSessionReferenceSpace(event.frame.session);
        this.scene.handleSelect(event.inputSource, event.frame, refSpace);
      });
    }

    this.onInitRenderer();

    this.scene.inputRenderer.useProfileControllerMeshes(session);

    session.updateRenderState({
      baseLayer: this.onCreateXRLayer(session)
    });

    this.onRequestReferenceSpace(session).then((refSpace) => {
      if (session.isImmersive) {
        this.immersiveRefSpace = refSpace;
      } else {
        this.inlineViewerHelper = new InlineViewerHelper(this.gl.canvas, refSpace);
        if (this.options.referenceSpace == 'local-floor' ||
            this.options.referenceSpace == 'bounded-floor') {
          this.inlineViewerHelper.setHeight(1.6);
        }
      }

      session.requestAnimationFrame(this.frameCallback);
    });
  }

  onRequestReferenceSpace(session) {
    if (this.options.referenceSpace && session.isImmersive) {
      return session.requestReferenceSpace(this.options.referenceSpace);
    } else {
      return session.requestReferenceSpace('viewer');
    }
  }

  onSessionEnded(session) {
    if (session == this.xrButton.session) {
      this.xrButton.setSession(null);
    }
  }

  // Override to customize frame handling
  onXRFrame(time, frame, refSpace) {
    let pose = frame.getViewerPose(refSpace);
    if (this.options.defaultInputHandling) {
      this.scene.updateInputSources(frame, refSpace);
    }
    this.scene.drawXRFrame(frame, pose);
  }

  get session() {
    return this.xrButton.session;
  }
}
