/*
 * Copyright 2026 The Immersive Web Community Group
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class WebGPULayerTest {
  constructor(config) {
    this.config = config;
    this.button = document.getElementById('xr-button');
    this.status = document.getElementById('status');

    this.device = null;
    this.session = null;
    this.binding = null;
    this.referenceSpace = null;
    this.projectionLayer = null;
    this.testLayer = null;
    this.image = null;
    this.imageSource = null;
    this.imageCache = new Map();
    this.settings = {};
    this.modeDescription = 'mono';
    this.layerDrawCount = 0;
    this.redrawVerified = false;
    this.endStatus = null;

    this.onButtonClicked = this.onButtonClicked.bind(this);
    this.onXRFrame = this.onXRFrame.bind(this);
  }

  async initialize() {
    try {
      if (!navigator.xr) {
        throw new Error('WebXR is not supported.');
      }
      if (!navigator.gpu) {
        throw new Error('WebGPU is not supported.');
      }
      if (!('XRGPUBinding' in window)) {
        throw new Error('XRGPUBinding is not supported.');
      }

      const sessionSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!sessionSupported) {
        throw new Error('Immersive VR is not supported.');
      }

      const adapter = await navigator.gpu.requestAdapter({ xrCompatible: true });
      if (!adapter) {
        throw new Error('No XR-compatible WebGPU adapter is available.');
      }

      this.device = await adapter.requestDevice();
      this.button.addEventListener('click', this.onButtonClicked);
      this.button.textContent = 'Enter VR';
      this.button.disabled = false;
      this.setStatus(`${this.config.layerName} layer test ready.`);
    } catch (error) {
      this.reportError(error);
    }
  }

  async onButtonClicked() {
    if (this.session) {
      this.button.disabled = true;
      this.endStatus = `${this.config.layerName} layer session ended.`;
      try {
        await this.session.end();
      } catch (error) {
        this.reportError(error);
      }
      return;
    }

    this.button.disabled = true;
    this.setStatus(`Starting ${this.config.layerName.toLowerCase()} layer test...`);

    let session = null;
    try {
      session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['webgpu', 'layers'],
      });
      this.session = session;
      session.addEventListener('end', () => this.onSessionEnded(session), { once: true });
      await this.onSessionStarted(session);
    } catch (error) {
      this.endStatus = `Error: ${this.errorText(error)}`;
      console.error(error);
      if (session) {
        try {
          await session.end();
        } catch (endError) {
          console.error(endError);
        }
      } else {
        this.session = null;
        this.button.textContent = 'Enter VR';
        this.button.disabled = false;
        this.setStatus(this.endStatus, true);
        this.endStatus = null;
      }
    }
  }

  async onSessionStarted(session) {
    this.settings = this.config.getSettings?.() || {};
    this.modeDescription = this.config.describeSettings?.(this.settings) || 'mono';
    this.binding = new XRGPUBinding(session, this.device);
    const colorFormat = this.binding.getPreferredColorFormat();

    this.referenceSpace = await session.requestReferenceSpace('local');
    this.projectionLayer = this.binding.createProjectionLayer({ colorFormat });
    session.updateRenderState({ layers: [this.projectionLayer] });

    this.layerDrawCount = 0;
    this.redrawVerified = false;
    this.button.textContent = 'Exit VR';
    this.button.disabled = false;
    this.setStatus(`Loading the ${this.modeDescription} image...`);
    session.requestAnimationFrame(this.onXRFrame);

    const imagePath = this.config.getImagePath?.(this.settings) || this.config.imagePath;
    const image = await this.getImage(imagePath);
    if (session !== this.session) {
      return;
    }

    this.image = image;
    this.imageSource = this.prepareImageSource(image);
    this.testLayer = this.config.createLayer({
      binding: this.binding,
      colorFormat,
      image: this.image,
      settings: this.settings,
      space: this.referenceSpace,
    });

    session.updateRenderState({
      layers: [this.testLayer, this.projectionLayer],
    });

    this.setStatus(
      `Waiting to draw the ${this.modeDescription} ${this.config.layerName.toLowerCase()} layer.`,
    );
  }

  onSessionEnded(endedSession) {
    if (endedSession !== this.session) {
      return;
    }

    this.testLayer?.destroy();
    this.projectionLayer?.destroy();
    this.session = null;
    this.binding = null;
    this.referenceSpace = null;
    this.projectionLayer = null;
    this.testLayer = null;
    this.image = null;
    this.imageSource = null;
    this.settings = {};

    this.button.textContent = 'Enter VR';
    this.button.disabled = false;
    const message = this.endStatus || `${this.config.layerName} layer test ready.`;
    this.setStatus(message, message.startsWith('Error:'));
    this.endStatus = null;
  }

  onXRFrame(time, frame) {
    if (frame.session !== this.session) {
      return;
    }
    this.session.requestAnimationFrame(this.onXRFrame);

    try {
      if (this.testLayer) {
        this.config.updateLayer?.({
          frame,
          layer: this.testLayer,
          session: this.session,
          settings: this.settings,
        });
      }

      const shouldDrawLayer = Boolean(this.testLayer?.needsRedraw);
      const pose = frame.getViewerPose(this.referenceSpace);
      if (!shouldDrawLayer && !pose) {
        return;
      }

      if (shouldDrawLayer) {
        this.copyImageToCompositionLayer(frame);
      }
      if (pose) {
        const commandEncoder = this.device.createCommandEncoder();
        this.clearProjectionLayer(commandEncoder, pose);
        this.device.queue.submit([commandEncoder.finish()]);
      }

      if (shouldDrawLayer) {
        this.layerDrawCount++;
        this.setStatus(
          `Copied the ${this.modeDescription} image to the ${this.config.layerName.toLowerCase()} layer.`,
        );
      } else if (this.layerDrawCount > 0 && !this.redrawVerified) {
        this.redrawVerified = true;
        this.setStatus(
          `Pass: ${this.config.layerName} layer rendered and needsRedraw cleared.`,
        );
      }
    } catch (error) {
      console.error(error);
      this.endStatus = `Error: ${this.errorText(error)}`;
      this.session.end().catch((endError) => console.error(endError));
    }
  }

  copyImageToCompositionLayer(frame) {
    if (this.config.isCube) {
      this.copyCubeImage(frame);
      return;
    }

    const layout = this.settings.layout || 'mono';
    const eyes = this.settings.stereo ? ['left', 'right'] : ['none'];

    for (let eyeIndex = 0; eyeIndex < eyes.length; eyeIndex++) {
      const subImage = this.binding.getSubImage(this.testLayer, frame, eyes[eyeIndex]);
      const viewDescriptor = subImage.getViewDescriptor();
      const viewport = subImage.viewport;
      const sourceOrigin = { x: 0, y: 0 };

      if (layout === 'stereo-left-right') {
        sourceOrigin.x = eyeIndex * viewport.width;
      } else if (layout === 'stereo-top-bottom') {
        sourceOrigin.y = eyeIndex * viewport.height;
      }

      this.device.queue.copyExternalImageToTexture(
        {
          source: this.imageSource,
          origin: sourceOrigin,
        },
        {
          texture: subImage.colorTexture,
          origin: {
            x: viewport.x,
            y: viewport.y,
            z: viewDescriptor.baseArrayLayer,
          },
        },
        {
          width: viewport.width,
          height: viewport.height,
        },
      );
    }
  }

  copyCubeImage(frame) {
    const faceSize = this.imageSource.height;
    const expectedWidth = faceSize * (this.settings.stereo ? 12 : 6);
    if (this.imageSource.width !== expectedWidth) {
      throw new Error(
        `Expected a ${expectedWidth}x${faceSize} cube strip, got ` +
        `${this.imageSource.width}x${this.imageSource.height}.`,
      );
    }

    // Flipping the full strip places the right-eye faces first, matching the
    // source mapping used by the WebGL cube layer sample.
    const eyeCopies = this.settings.stereo
      ? [
          { eye: 'right', sourceFaceOffset: 0 },
          { eye: 'left', sourceFaceOffset: 6 },
        ]
      : [{ eye: 'none', sourceFaceOffset: 0 }];

    for (const eyeCopy of eyeCopies) {
      const subImage = this.binding.getSubImage(this.testLayer, frame, eyeCopy.eye);
      const baseDescriptor = subImage.getViewDescriptor();
      for (let face = 0; face < 6; face++) {
        this.device.queue.copyExternalImageToTexture(
          {
            source: this.imageSource,
            origin: {
              x: (eyeCopy.sourceFaceOffset + face) * faceSize,
              y: 0,
            },
          },
          {
            texture: subImage.colorTexture,
            origin: {
              x: 0,
              y: 0,
              z: baseDescriptor.baseArrayLayer + face,
            },
          },
          {
            width: faceSize,
            height: faceSize,
          },
        );
      }
    }
  }

  clearProjectionLayer(commandEncoder, pose) {
    for (const view of pose.views) {
      const subImage = this.binding.getViewSubImage(this.projectionLayer, view);
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: subImage.colorTexture.createView(subImage.getViewDescriptor()),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
        }],
      });

      const viewport = subImage.viewport;
      renderPass.setViewport(
        viewport.x,
        viewport.y,
        viewport.width,
        viewport.height,
        0.0,
        1.0,
      );
      renderPass.end();
    }
  }

  errorText(error) {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image), { once: true });
      image.addEventListener(
        'error',
        () => reject(new Error(`Failed to load image: ${path}`)),
        { once: true },
      );
      image.src = path;
    });
  }

  async getImage(path) {
    if (!path) {
      throw new Error('No source image was selected.');
    }

    if (!this.imageCache.has(path)) {
      this.imageCache.set(path, this.loadImage(path));
    }

    try {
      return await this.imageCache.get(path);
    } catch (error) {
      this.imageCache.delete(path);
      throw error;
    }
  }

  prepareImageSource(image) {
    if (!this.config.flipSourceX) {
      return image;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create a 2D context for the cube image.');
    }

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, 0);
    return canvas;
  }

  reportError(error) {
    console.error(error);
    this.button.textContent = 'Unavailable';
    this.button.disabled = true;
    this.setStatus(`Error: ${this.errorText(error)}`, true);
  }

  setStatus(message, isError = false) {
    this.status.textContent = message;
    this.status.style.color = isError ? '#b00020' : '';
  }
}

export function startLayerTest(config) {
  const test = new WebGPULayerTest(config);
  test.initialize();
  return test;
}
