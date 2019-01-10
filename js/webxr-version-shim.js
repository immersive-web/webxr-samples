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

// This file contains various patches to adjust for differences in outdated browser
// implementations of the WebXR API and allow the samples to be coded exclusively
// against the most recent version.

function mat4_fromRotationTranslation(out, q, v) {
  // Quaternion math
  let x = q.x, y = q.y, z = q.z, w = q.w;
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let xy = x * y2;
  let xz = x * z2;
  let yy = y * y2;
  let yz = y * z2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v.x;
  out[13] = v.y;
  out[14] = v.z;
  out[15] = 1;
  return out;
}

class XRRayShim {
  constructor(rayMatrix) {
    this._transformMatrix = rayMatrix;

    // TODO: Don't rely on these types for the shim.
    // Some browsers don't support them yet.
    let o = new DOMPointReadOnly(0, 0, 0, 1);
    let d = new DOMPointReadOnly(0, 0, -1, 0);
    let t = new DOMMatrix(rayMatrix);

    this._origin = DOMPointReadOnly.fromPoint(t.transformPoint(o));
    this._direction = DOMPointReadOnly.fromPoint(t.transformPoint(d));
  }

  get origin() {
    return this._origin;
  }

  get direction() {
    return this._direction;
  }

  get transformMatrix() {
    return this._transformMatrix;
  }
}

class XRRigidTransformShim {
  constructor(position, orientation) {
    // TODO: Don't rely on these types for the shim.
    // Some browsers don't support them yet.
    this._position = DOMPointReadOnly.fromPoint(position);
    this._orientation = DOMPointReadOnly.fromPoint(orientation);
    this._matrix = null;
  }

  get position() {
    return this._position;
  }

  get orientation() {
    return this._orientation;
  }

  get matrix() {
    if (!this._matrix) {
      this._matrix = new Float32Array(16);
      mat4_fromRotationTranslation(this._matrix, this._orientation, this._position);
    }
    return this._matrix;
  }
}

class XRViewShim {
  constructor(legacyView, devicePose) {
    this._view = legacyView;
    this._pose = devicePose;
    this._transform = null;
  }

  get eye() {
    return this._view.projectionMatrix;
  }

  get projectionMatrix() {
    return this._view.projectionMatrix;
  }

  get viewMatrix() {
    return this._pose.getViewMatrix(this._view);
  }

  get transform() {
    // FIXME: Return a transform based on the inverted view matrix
    return null;
  }
}

class WebXRVersionShim {
  constructor() {
    if (this._shouldApplyPatch()) {
      this._applyPatch();
    }

    this._defaultDevicePromise = null;
    this._defaultDevice = null;
  }

  _isMobile() {
    return /Android/i.test(navigator.userAgent) ||
          /iPhone|iPad|iPod/i.test(navigator.userAgent);s
  }

  _shouldApplyPatch() {
    // Don't apply the patch with WebXR isn't available.
    if (!('xr' in navigator)) {
      return false;
    }

    // Allow for universally disabling the version shim with a URL arg, which will
    // make it easier to test updates to native implementations.
    let query = window.location.search.substring(1) || window.location.hash.substring(1);
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      if (pair[0].toLowerCase() == 'nowebxrversionshim') {
        return false;
      }
    }

    return true;
  }

  _ensureDefaultDevice() {
    if (!this._defaultDevicePromise) {
      this._defaultDevicePromise = navigator.xr.requestDevice().then((device) => {
        this._defaultDevice = device;
        return device;
      });
    }
    return this._defaultDevicePromise;
  }

  _makeCanvas() {
    // Create a fullscreen canvas element for use with legacy AR mode.
    let canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.right = 0;
    canvas.style.bottom = 0;
    canvas.style.margin = 0;
    return canvas;
  }

  _applyPatch() {
    //===========================
    // Chrome 72 and older
    //===========================

    let shim = this;

    if ('requestDevice' in XR.prototype) {
      console.log('[WebXR version shim] Installing navigator.xr.requestSession shim.');
      console.log('[WebXR version shim] Installing navigator.xr.supportsSessionMode shim.');

      XR.prototype.requestSession = function(options) {
        return shim._ensureDefaultDevice().then((device) => {
          let newOptions = {};
          if (options.outputContext) {
            newOptions.outputContext = options.outputContext;
          }

          if (options.mode == 'immersive-vr') {
            newOptions.immersive = true;
          } else if (options.mode == 'immersive-ar') {
            // These Chrome versions don't support immersive AR mode, they need
            // a canvas in the DOM for use as output context.
            newOptions.immersive = false;
            newOptions.environmentIntegration = true;

            shim._outputCanvasForAR = shim._makeCanvas();
            newOptions.outputContext = shim._outputCanvasForAR.getContext('xrpresent');
          } else if (!options.mode || options.mode == 'inline') {
            newOptions.immersive = false;
          } else {
            throw new TypeError('Invalid mode');
          }

          return device.requestSession(newOptions).then((session) => {
            if (shim._outputCanvasForAR) {
              // If we're using the backwards compatible output canvas, add it
              // to the DOM now and clean it up on session end.
              document.body.appendChild(shim._outputCanvasForAR);
              session.addEventListener('end', () => {
                document.body.removeChild(shim._outputCanvasForAR);
                shim._outputCanvasForAR = null;
              });
            }
            session.mode = options.mode;
            return session;
          });
        });
      };

      XR.prototype.supportsSessionMode = function(mode) {
        return shim._ensureDefaultDevice().then((device) => {
          let newOptions = {};

          if (mode == 'immersive-vr') {
            newOptions.immersive = true;
          } else if (mode == 'immersive-ar') {
            // These Chrome versions don't support immersive AR mode, they need
            // a canvas in the DOM for use as output context.
            newOptions.immersive = false;
            newOptions.environmentIntegration = true;

            // Make a temporary canvas for checking support, but don't attach it
            // to the DOM. The actual output canvas will be created later if/when
            // a session is created.
            let tempCanvas = shim._makeCanvas();
            newOptions.outputContext = tempCanvas.getContext('xrpresent');
          } else if (mode == 'inline') {
            return Promise.resolve();
          } else {
            throw new TypeError('Invalid mode');
          }

          return device.supportsSession(newOptions);
        });
      };
    }

    if ('XRRigidTransform' in window) {
      console.log('[WebXR version shim] Installing XRRigidTransform shim.');
      window.XRRigidTransform = XRRigidTransformShim;
    }

    if ('transformMatrix' in XRRay.prototype) {
      console.log('[WebXR version shim] Installing XRRay.matrix shim.');
      Object.defineProperty(XRRay.prototype, 'matrix', {
        enumerable: true, configurable: false, writeable: false,
        get: function() { return this.transformMatrix; }
      });
    }

    if ('requestFrameOfReference' in XRSession.prototype) {
      console.log('[WebXR version shim] Installing XRSession.requestReferenceSpace shim.');
      XRSession.prototype.requestReferenceSpace = function(options) {
        if (options.type == 'stationary') {
          if (options.subtype == 'eye-level') {
            return this.requestFrameOfReference('eye-level');
          } else if (options.subtype == 'floor-level') {
            return this.requestFrameOfReference('stage');
          } else if (options.subtype == 'position-disabled') {
            return this.requestFrameOfReference('head-model');
          }
        } else if (options.type == 'bounded') {
          return this.requestFrameOfReference('stage', { disableStageEmulation: true });
        }
        
        // Covers 'unbounded', which didn't have an equivalent in the older spec
        return Promise.reject(new Error('Unsupported reference space'));
      };
    }

    let usingViewsShim = false;

    if ('getDevicePose' in XRFrame.prototype) {
      console.log('[WebXR version shim] Installing XRSession.getViewerPose shim.');
      usingViewsShim = true;
      XRFrame.prototype.getViewerPose = function(referenceSpace) {
        let pose = this.getDevicePose(referenceSpace);
        if (pose && `views` in XRFrame.prototype) {
          pose.views = [];
          for (let view of this.views) {
            pose.views.push(new XRViewShim(view, pose));
          }
        }
        return pose;
      }
    } else if (!('views' in XRViewerPose.prototype)) {
      console.log('[WebXR version shim] Installing XRViewerPose.views shim.');
      usingViewsShim = true;
      const NATIVE_GET_VIEWER_POSE = XRFrame.prototype.getViewerPose;
      XRFrame.prototype.getViewerPose = function(referenceSpace) {
        let pose = NATIVE_GET_VIEWER_POSE.call(this, referenceSpace);
        if (pose && `views` in XRFrame.prototype) {
          pose.views = [];
          for (let view of this.views) {
            pose.views.push(new XRViewShim(view, pose));
          }
        }
        return pose;
      }
    }

    if (usingViewsShim) {
      const NATIVE_GET_VIEWPORT = XRWebGLLayer.prototype.getViewport;
      XRWebGLLayer.prototype.getViewport = function(view) {
        if (view instanceof XRViewShim) {
          view = view._view;
        }
        return NATIVE_GET_VIEWPORT.call(this, view);
      }
    }

    if ('XRDevicePose' in window) {
      if ('poseModelMatrix' in XRDevicePose.prototype) {
        console.log('[WebXR version shim] Installing XRViewerPose.transform shim.');
        Object.defineProperty(XRDevicePose.prototype, 'transform', {
          enumerable: true, configurable: false, writeable: false,
          get: function() {
            // FIXME: Convert pose matrix into transform
            return null;
          }
        });
      }
    }

    if ('setCompatibleXRDevice' in WebGLRenderingContext.prototype) {
      console.log('[WebXR version shim] Installing WebGL XR compatibility shim.');

      WebGL2RenderingContext.prototype.makeXRCompatible =
      WebGLRenderingContext.prototype.makeXRCompatible = function() {
        return shim._ensureDefaultDevice().then((device) => {
          return this.setCompatibleXRDevice(device);
        });
      }

      // TODO: In order for this to work currently it must be called after
      // either a supportsSessionMode or requestSession resolves.
      const NATIVE_GET_CONTEXT = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, options) {
        if (type == 'webgl' || type == 'webgl2') {
          if (options.xrCompatible) {
            options.compatibleXRDevice = shim._defaultDevice;
          }
        }
        return NATIVE_GET_CONTEXT.call(this, type, options);
      };

      const NATIVE_OFFSCREEN_GET_CONTEXT = OffscreenCanvas.prototype.getContext;
      OffscreenCanvas.prototype.getContext = function(type, options) {
        if (type == 'webgl' || type == 'webgl2') {
          if (options.xrCompatible) {
            options.compatibleXRDevice = shim._defaultDevice;
          }
        }
        return NATIVE_OFFSCREEN_GET_CONTEXT.call(this, type, options);
      };
    }

    //===========================
    // Chrome 67/68
    //===========================

    // Map 'immersive' to the old 'exclusive' verbiage if needed.
    if ('exclusive' in XRSession.prototype) {
      const NATIVE_SUPPORTS_SESSION = XRDevice.prototype.supportsSession;
      XRDevice.prototype.supportsSession = function(options) {
        options.exclusive = !!options.immersive;
        return NATIVE_SUPPORTS_SESSION.call(this, options);
      };

      const NATIVE_REQUEST_SESSION = XRDevice.prototype.requestSession;
      XRDevice.prototype.requestSession = function(options) {
        options.exclusive = !!options.immersive;
        return NATIVE_REQUEST_SESSION.call(this, options);
      };

      Object.defineProperty(XRSession.prototype, 'immersive', {
        enumerable: true, configurable: false, writeable: false,
        get: function() { return this.exclusive; }
      });
    }

    // We can't test for the existence of the enums in question directly, so this code
    // will just try to create the requested type and fall back if it fails.
    const NATIVE_REQUEST_FRAME_OF_REFERENCE = XRSession.prototype.requestFrameOfReference;
    XRSession.prototype.requestFrameOfReference = function(type, options) {
      let session = this;
      // Try the current type.
      return NATIVE_REQUEST_FRAME_OF_REFERENCE.call(session, type, options).catch((error)=>{
        // FIXME: Should be checking for TypeError specifically. Requires a polyfill update.
        if(error instanceof Error) {
          // If the current type fails, switch to the other version.
          switch(type) {
            case 'eye-level':
              type = 'eyeLevel';
              break;
            case 'head-model':
              type = 'headModel';
              break;
            default:
              return Promise.reject(error);
          }
          return Promise.resolve(NATIVE_REQUEST_FRAME_OF_REFERENCE.call(session, type, options));
        } else {
          return Promise.reject(error);
        }
      });
    };

    // Make sure that requestAnimationFrame is always supplied with a timestamp
    const NATIVE_REQUEST_ANIMATION_FRAME = XRSession.prototype.requestAnimationFrame;
    XRSession.prototype.requestAnimationFrame = function(callback) {
      return NATIVE_REQUEST_ANIMATION_FRAME.call(this, (timestamp, frame) => {
        callback(timestamp ? timestamp : performance.now(), frame);
      });
    };

    if (!('getNativeFramebufferScaleFactor' in XRWebGLLayer)) {
      if (this._isMobile()) {
        const NATIVE_WEBGL_LAYER = XRWebGLLayer;
        const NATIVE_WEBGL_LAYER_PROTOTYPE = XRWebGLLayer.prototype;
        XRWebGLLayer = function(session, gl, options) {
          if (options && options.framebufferScaleFactor) {
            // On Chrome 67/68 mobile the default framebuffer returned is 0.7 of full res.
            options.framebufferScaleFactor = 0.7 * options.framebufferScaleFactor;
          }

          return new NATIVE_WEBGL_LAYER(session, gl, options);
        };

        XRWebGLLayer.prototype = NATIVE_WEBGL_LAYER_PROTOTYPE;

        Object.defineProperty(XRWebGLLayer, 'getNativeFramebufferScaleFactor', {
          enumerable: true, configurable: false, writeable: false,
          value: function(session) {
            if (!session) {
              throw new TypeError('No XRSession specified');
            }
            if (isMobile()) {
              // On Chrome 67/68 mobile the default framebuffer returned is 0.7 of full res.
              return 1.42857;
            } else {
              // On Chrome 67/68 desktop the full res buffer is already returned.
              return 1.0;
            }
          }
        });
      }
    }

    // If the environmentBlendMode isn't available report it as 'opaque', since any
    // implementations lacking this property only really worked on VR headsets.
    if (!('environmentBlendMode' in XRSession.prototype)) {
      Object.defineProperty(XRSession.prototype, 'environmentBlendMode', {
        enumerable: true, configurable: false, writeable: false,
        get: function() { return 'opaque'; }
      });
    }

    if (!('targetRayMode' in XRInputSource.prototype)) {
      Object.defineProperty(XRInputSource.prototype, 'targetRayMode', {
        enumerable: true, configurable: false, writeable: false,
        get: function() {
          switch (this.pointerOrigin) {
            case 'head': return 'gaze';
            case 'hand': return 'tracked-pointer';
            case 'screen': return 'screen';

            default: throw new ValueError('Unrecognized pointerOrigin: ' + this.pointerOrigin);
          }
        }
      });
    }

    if (!('targetRay' in XRInputPose.prototype)) {
      Object.defineProperty(XRInputPose.prototype, 'targetRay', {
        enumerable: true, configurable: false, writeable: false,
        get: function() {
          if (!this._targetRay) {
            if (this.targetRayMatrix) {
              this._targetRay = new XRRayShim(this.targetRayMatrix);
            } else if (this.pointerMatrix) {
              this._targetRay = new XRRayShim(this.pointerMatrix);
            }
          }
          return this._targetRay || null;
        }
      });
    }
  }
}
