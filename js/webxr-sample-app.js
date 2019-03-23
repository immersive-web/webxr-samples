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
      let refSpace = session.mode == 'inline' ?
                        this.inlineRefSpace :
                        this.immersiveRefSpace;

      session.requestAnimationFrame(this.frameCallback);
      this.scene.startFrame();
      
      this.onXRFrame(time, frame, refSpace);

      this.scene.endFrame();
    };

    // Application options and defaults
    this.options = {
      inline: options.inline || true,
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || { type: 'stationary', subtype: 'eye-level' },
      mirror: options.mirror || true,
    };
  }

  run() {
    this.onInitXR();
  }

  onInitXR() {
    if (navigator.xr) {
      navigator.xr.supportsSessionMode('immersive-vr').then(() => {
        this.xrButton.enabled = true;
      });

      // Request an inline session if needed.
      if (this.options.inline) {
        navigator.xr.requestSession().then((session) => {
          this.onSessionStarted(session);
        });
      }
    }
  }

  onRequestSession() {
    // Called when the button gets clicked. Requests an immersive session.
    navigator.xr.requestSession({ mode: this.options.immersiveMode }).then((session) => {
      this.xrButton.setSession(session);
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

    this.onInitGL();

    let renderState = { baseLayer: new XRWebGLLayer(session, this.gl) };
    if (session.mode == 'inline' || this.options.mirror) {
      let outputCanvas = document.createElement('canvas');
      document.body.appendChild(outputCanvas);
      renderState.outputContext = outputCanvas.getContext('xrpresent');
    }

    session.updateRenderState(renderState);

    this.onRequestReferenceSpace(session).then((refSpace) => {
      if (session.mode == "immersive-vr") {
        this.immersiveRefSpace = refSpace;
      } else {
        this.inlineRefSpace = refSpace;
      }

      session.requestAnimationFrame(this.frameCallback);
    });
  }

  onRequestReferenceSpace(session) {
    if (this.options.referenceSpace) {
      return session.requestReferenceSpace(this.options.referenceSpace);
    }
  }

  onSessionEnded(session) {
    // Remove any output canvas that was associated with the session
    let outputContext = session.renderState.outputContext;
    if (outputContext && outputContext.canvas.parentElement) {
      outputContext.canvas.parentElement.removeChild(outputContext.canvas);
    }

    if (session == this.xrButton.session) {
      this.xrButton.setSession(null);
    }
  }
  
  onInitGL() {
    if (this.gl)
      return;

    this.gl = createWebGLContext({
      xrCompatible: true
    });

    this.renderer = new Renderer(this.gl);

    this.scene.setRenderer(this.renderer);
  }

  // Override to customize frame handling
  onXRFrame(time, frame, refSpace) {
    let pose = frame.getViewerPose(refSpace);
    this.scene.updateInputSources(frame, refSpace);
    this.scene.drawXRFrame(frame, pose);
  }
}
