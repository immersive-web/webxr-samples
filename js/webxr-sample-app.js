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

export class WebXRSampleApp {
  constructor(options) {
    // Application options and defaults
    if (!options) { options = {}; }

    this.options = {
      inline: 'inline' in options ? options.inline : true,
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || 'local',
      defaultInputHandling: 'defaultInputHandling' in options ? options.defaultInputHandling : true,
      controllerMesh: options.controllerMesh
    };

    this.gl = null;
    this.renderer = null;
    this.scene = new Scene();

    this.xrButton = new WebXRButton({
      onRequestSession: () => { this.onRequestSession(); },
      onEndSession: (session) => { this.onEndSession(session); }
    });

    this.immersiveRefSpace = null;
    this.inlineRefSpace = null;

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
    return session.isImmersive ? this.immersiveRefSpace : this.inlineRefSpace;
  }

  run() {
    this.onInitXR();
  }

  onInitXR() {
    if (navigator.xr) {
      navigator.xr.supportsSession('immersive-vr').then(() => {
        this.xrButton.enabled = true;
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

      if (this.options.controllerMesh) {
        this.scene.inputRenderer.setControllerMesh(this.options.controllerMesh);
      }
    }
  }

  onRequestSession() {
    // Called when the button gets clicked. Requests an immersive session.
    navigator.xr.requestSession(this.options.immersiveMode).then((session) => {
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

    session.updateRenderState({ 
      baseLayer: new XRWebGLLayer(session, this.gl, {
        compositionDisabled: !session.isImmersive
      })
    });

    this.onRequestReferenceSpace(session).then((refSpace) => {
      if (session.isImmersive) {
        this.immersiveRefSpace = refSpace;
      } else {
        this.inlineRefSpace = refSpace;
      }

      session.requestAnimationFrame(this.frameCallback);
    });
  }

  onRequestReferenceSpace(session) {
    if (this.options.referenceSpace && session.isImmersive) {
      return session.requestReferenceSpace(this.options.referenceSpace);
    } else {
      return session.requestReferenceSpace('viewer').then((refSpace) => {
        if (this.options.referenceSpace == 'local-floor' ||
            this.options.referenceSpace == 'bounded-floor') {
          refSpace = refSpace.getOffsetReferenceSpace(
                new XRRigidTransform({y: -1.6}));
        }
        return refSpace;
      });
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
}
