// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebXRView {
  constructor(view, pose, layer) {
    this.projection_mat = view ? view.projectionMatrix : null;
    this.view_mat = (pose && view) ? pose.getViewMatrix(view) : null;
    this.viewport = (layer && view) ? view.getViewport(layer) : null;
    // If an eye isn't given just assume the left eye.
    this.eye = view ? view.eye : "left";
  }
}

class WebXRScene {
  constructor() {
    this._gl = null;

    this._timestamp = -1;
    this._frame_delta = 0;
    this._stats_enabled = true;
    this._stats_standing = false;
    this._stats = null;
    this._stats_mat = mat4.create();

    this.texture_loader = null;

    this._debug_renderer = null;
    this._debug_geometries = [];

    this._pointer_renderer = null;
    this._lasers = [];
    this._cursors = [];

    this._splash_renderer = null;
    this._splash_url = null;

    this._load_promise = Promise.resolve();
    this._loaded = false;
  }

  setWebGLContext(gl) {
    if (this._gl == gl) {
      return this._load_promise;
    }

    this._gl = gl;
    this._loaded = false;

    if (gl) {
      if (this._stats_enabled) {
        this._stats = new WGLUStats(gl);
      }
      this.texture_loader = new WGLUTextureLoader(gl);

      if (this._splash_url) {
        this._splash_renderer = new WebXRSplashScreen(gl, scene.texture_loader.loadTexture(this._splash_url));
      }

      if (this._debug_geometries.length) {
        this._debug_renderer = new WGLUDebugGeometry(gl);
      }

      if (this._lasers.length || this._cursors.length) {
        this._pointer_renderer = new WebXRLaserRenderer(gl);
      }

      this._load_promise = this.onLoadScene(gl);
    } else {
      this._load_promise = Promise.resolve(); 
    }

    this._load_promise.then(() => {
      this._loaded = true;
    });

    return this._load_promise;
  }

  waitForLoadWithSplashScreen(session, splash_url) {
    let gl = this._gl;
    if (!gl) {
      return Promise.reject();
    }

    // If the scene is already loaded don't bother with this.
    if (!this._loaded) {
      let drawSplash = () => {
        // Grab a temporary frame of reference to draw a single frame with.
        session.requestFrameOfReference('headModel').then((frameOfRef) => {
          // Check and see of the scene has loaded while we were preparing the
          // splash, in which case we've wasted a bit of time and won't display
          // the splash screen at all.
          if (!this._loaded) {
            session.requestAnimationFrame((frame) => {
              gl.bindFramebuffer(gl.FRAMEBUFFER, session.baseLayer.framebuffer);

              let pose = frame.getDevicePose(frameOfRef);
              let views = [];
              for (let view of frame.views) {
                views.push(new WebXRView(view, pose, session.baseLayer));
              }
              this._splash_renderer.draw(views);
            });
          }
        });
      }

      if (this._splash_url != splash_url) {
        this._splash_url = splash_url;
        this.texture_loader.loadTexture(this._splash_url, null, (texture) => {
          this._splash_renderer = new WebXRSplashScreen(gl, texture);
          drawSplash();
        });
      } else {
        drawSplash();
      }
    }
    
    return this._load_promise;
  }

  loseWebGLContext() {
    if (this._gl) {
      this._gl = null;
      this._stats = null;
      this.texture_loader = null;
      this._splash_renderer = null;
      this._debug_renderer = null;
      this._pointer_renderer = null;
    }
  }

  enableStats(enable) {
    if (enable == this._stats_enabled)
      return;

    this._stats_enabled = enable;

    if (enable && this.gl) {
      this._stats = new WGLUStats(this.gl);
    } else if (!enable) {
      this._stats = null;
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
    if (!this._debug_renderer && this._gl) {
      this._debug_renderer = new WGLUDebugGeometry(this._gl);
    }

    return geometry;
  }

  pushLaserPointer(pointer_mat) {
    this._lasers.push(pointer_mat);

    // Create the pointer renderer if needed.
    if (!this._pointer_renderer && this._gl) {
      this._pointer_renderer = new WebXRLaserRenderer(this._gl);
    }
  }

  pushCursor(cursor_pos) {
    this._cursors.push(cursor_pos);

    // Create the pointer renderer if needed.
    if (!this._pointer_renderer && this._gl) {
      this._pointer_renderer = new WebXRLaserRenderer(this._gl);
    }
  }

  draw(projection_mat, view_mat, eye) {
    let view = new WebXRView();
    view.projection_mat = projection_mat;
    view.view_mat = view_mat;
    if (eye) {
      view.eye = eye;
    }

    this.drawViewArray([view]);
  }

  /** Draws the scene into the base layer of the XRFrame's session */
  drawXRFrame(xr_frame, pose) {
    let gl = this._gl;
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
    if (!this._gl) {
      // Don't draw when we don't have a valid context
      return;
    }

    if (this._stats_enabled) {
      this._onDrawStats(views);
    }

    this._onDrawDebugGeometry(views);

    this.onDrawViews(this._gl, this._timestamp, views);

    // Because of the blending used when drawing the lasers/cursors they should
    // always be drawn last.
    this._onDrawPointers(views);
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
    this._lasers.length = 0;
    this._cursors.length = 0;

    if (this._stats) {
      this._stats.end();
    }
  }

  // Override to load scene resources on construction or context restore.
  onLoadScene(gl) {
    return Promise.resolve();
  }

  // Override with custom scene rendering.
  onDrawViews(gl, timestamp, views) {}

  _onDrawStats(views) {
    let gl = this._gl;
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
    let gl = this._gl;
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
