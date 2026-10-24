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

const GRID_SHADER = `
  struct Camera {
    projection: mat4x4f,
    view: mat4x4f,
  }
  @group(0) @binding(0) var<uniform> camera: Camera;

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) floorPosition: vec2f,
  }

  @vertex
  fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
    let positions = array<vec2f, 6>(
      vec2f(-20.0, -20.0), vec2f(20.0, -20.0), vec2f(-20.0, 20.0),
      vec2f(-20.0, 20.0), vec2f(20.0, -20.0), vec2f(20.0, 20.0),
    );
    let floorPosition = positions[index];
    // The samples use a local reference space, with its origin near eye level.
    let position = vec4f(floorPosition.x, -1.5, floorPosition.y, 1.0);
    return VertexOutput(camera.projection * camera.view * position, floorPosition);
  }

  @fragment
  fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
    // One-meter grid lines, antialiased using their size on screen.
    let distanceToLine = abs(fract(in.floorPosition + vec2f(0.5)) - vec2f(0.5));
    let lineWidth = max(fwidth(in.floorPosition), vec2f(0.001));
    let distance = distanceToLine / lineWidth;
    let grid = 1.0 - min(min(distance.x, distance.y), 1.0);
    let color = mix(vec3f(0.04, 0.06, 0.08), vec3f(0.35, 0.55, 0.7), grid);
    let alpha = 1.0 - smoothstep(10.0, 20.0, length(in.floorPosition));
    // Leave the sky transparent so background composition layers remain visible.
    return vec4f(color * alpha, alpha);
  }
`;

export class ProjectionGrid {
  constructor(device, colorFormat) {
    this.device = device;
    this.cameras = [];

    const shader = device.createShaderModule({ code: GRID_SHADER });
    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: shader, entryPoint: 'vertexMain' },
      fragment: {
        module: shader,
        entryPoint: 'fragmentMain',
        targets: [{ format: colorFormat }],
      },
    });
  }

  draw(commandEncoder, binding, layer, pose) {
    for (let viewIndex = 0; viewIndex < pose.views.length; viewIndex++) {
      const view = pose.views[viewIndex];
      let camera = this.cameras[viewIndex];
      if (!camera) {
        const buffer = this.device.createBuffer({
          size: 32 * Float32Array.BYTES_PER_ELEMENT,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        camera = {
          buffer,
          data: new Float32Array(32),
          bindGroup: this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer } }],
          }),
        };
        this.cameras[viewIndex] = camera;
      }

      // Separate buffers keep each eye's matrices intact until submission.
      camera.data.set(view.projectionMatrix, 0);
      camera.data.set(view.transform.inverse.matrix, 16);
      this.device.queue.writeBuffer(camera.buffer, 0, camera.data);

      const subImage = binding.getViewSubImage(layer, view);
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: subImage.colorTexture.createView(subImage.getViewDescriptor()),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
        }],
      });
      const viewport = subImage.viewport;
      renderPass.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0.0, 1.0);
      renderPass.setScissorRect(viewport.x, viewport.y, viewport.width, viewport.height);
      renderPass.setPipeline(this.pipeline);
      renderPass.setBindGroup(0, camera.bindGroup);
      renderPass.draw(6);
      renderPass.end();
    }
  }

  destroy() {
    for (const camera of this.cameras) {
      camera.buffer.destroy();
    }
    this.cameras = [];
  }
}
