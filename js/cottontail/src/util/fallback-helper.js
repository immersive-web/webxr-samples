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

export class FallbackHelper {
  constructor(scene, gl) {
    this.scene = scene;
    this._emulateStage = false;

    let viewMatrix = mat4.create();
    this.viewMatrix = viewMatrix;

    let projectionMatrix = mat4.create();
    this.projectionMatrix = projectionMatrix;

    // Using a simple identity matrix for the view.
    mat4.identity(this.viewMatrix);

    // We need to track the canvas size in order to resize the WebGL
    // backbuffer width and height, as well as update the projection matrix
    // and adjust the viewport.
    function onResize() {
      gl.canvas.width = gl.canvas.offsetWidth * window.devicePixelRatio;
      gl.canvas.height = gl.canvas.offsetHeight * window.devicePixelRatio;
      mat4.perspective(projectionMatrix, Math.PI*0.4,
                       gl.canvas.width/gl.canvas.height,
                       0.1, 1000.0);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    window.addEventListener('resize', onResize);
    onResize();

    function onFrame() {
      window.requestAnimationFrame(onFrame);

      scene.startFrame();

      // We can skip setting the framebuffer and viewport every frame, because
      // it won't change from frame to frame and we're updating the viewport
      // only when we resize for efficency.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // We're drawing with our own projection and view matrix now, and we
      // don't have a list of view to loop through, but otherwise all of the
      // WebGL drawing logic is exactly the same.
      scene.draw(projectionMatrix, viewMatrix);

      scene.endFrame();
    }

    window.requestAnimationFrame(onFrame);
  }

  get emulateStage() {
    return this._emulateStage;
  }

  set emulateStage(value) {
    this._emulateStage = value;

    // If we're emulating a stage frame of reference we'll need to move the view
    // matrix roughly a meter and a half up in the air.
    mat4.identity(this.viewMatrix);
    if (this._emulateStage) {
      mat4.translate(this.viewMatrix, this.viewMatrix, [0, -1.6, 0]);
    }
  }
}
