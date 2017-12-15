// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file builds and renders a really generic "XR Controller" that doesn't
// really match any particular piece of hardware but DOES provide a visual
// representation of all of it's inputs. It have special cases for touchpad,
// joystick, trigger, grip, and everything else is represented as a generic
// "button".
// Lots of manual vertex buffer building and magic numbers ahead!
// Consider yourself warned!

const XRInputVS = `
  uniform mat4 projectionMat;
  uniform mat4 modelViewMat;
  uniform mat3 normalMat;
  uniform vec4 color;
  attribute vec3 position;
  attribute vec3 normal;
  varying vec3 vLight;
  varying vec4 vColor;

  const vec3 lightDir = vec3(0.75, 0.5, 1.0);
  const vec3 ambientColor = vec3(0.5, 0.5, 0.5);
  const vec3 lightColor = vec3(0.75, 0.75, 0.75);

  void main() {
    vec3 normalRotated = normalMat * normal;
    float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);
    vLight = ambientColor + (lightColor * lightFactor);
    vColor = color;
    gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);
  }
`;

const XRInputFS = `
  precision mediump float;
  varying vec3 vLight;
  varying vec4 vColor;

  void main() {
    gl_FragColor = vec4(vLight, 1.0) * vColor;
  }
`;

class WebXRInputRenderer {
  constructor(gl) {
    this.gl = gl;

    this.normal_mat = mat3.create();

    // Build controller representation
    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(XRInputVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(XRInputFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      texCoord: 1,
      normal: 2
    });
    this.program.link();

    let verts = [];
    let indices = [];
    let vert_stride = 6;

    function mergeMesh(meshA, meshB) {
      return {
        vert_offset: Math.min(meshA.vert_offset, meshB.vert_offset),
        index_offset: Math.min(meshA.index_offset, meshB.index_offset),
        element_count: meshA.element_count + meshB.element_count,
      };
    }

    function addBox(width, height, depth, offset) {
      if (!offset) {
        offset = [0, 0, 0];
      }

      let x = offset[0];
      let y = offset[1];
      let z = offset[2];

      let hw = width * 0.5;
      let hh = height * 0.5;
      let hd = depth * 0.5;

      let vert_offset = verts.length / vert_stride;
      let index_offset = indices.length;

      // Bottom
      let idx = verts.length / vert_stride;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx, idx + 2, idx + 3);

      //              X       Y       Z    NX    NY   NZ
      verts.push(x - hw, y - hh, z - hd, 0.0, -1.0, 0.0);
      verts.push(x + hw, y - hh, z - hd, 0.0, -1.0, 0.0);
      verts.push(x + hw, y - hh, z + hd, 0.0, -1.0, 0.0);
      verts.push(x - hw, y - hh, z + hd, 0.0, -1.0, 0.0);

      // Top
      idx = verts.length / vert_stride;
      indices.push(idx, idx + 2, idx + 1);
      indices.push(idx, idx + 3, idx + 2);

      verts.push(x - hw, y + hh, z - hd, 0.0, 1.0, 0.0);
      verts.push(x + hw, y + hh, z - hd, 0.0, 1.0, 0.0);
      verts.push(x + hw, y + hh, z + hd, 0.0, 1.0, 0.0);
      verts.push(x - hw, y + hh, z + hd, 0.0, 1.0, 0.0);

      // Left
      idx = verts.length / vert_stride;
      indices.push(idx, idx + 2, idx + 1);
      indices.push(idx, idx + 3, idx + 2);

      verts.push(x - hw, y - hh, z - hd, -1.0, 0.0, 0.0);
      verts.push(x - hw, y + hh, z - hd, -1.0, 0.0, 0.0);
      verts.push(x - hw, y + hh, z + hd, -1.0, 0.0, 0.0);
      verts.push(x - hw, y - hh, z + hd, -1.0, 0.0, 0.0);

      // Right
      idx = verts.length / vert_stride;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx, idx + 2, idx + 3);

      verts.push(x + hw, y - hh, z - hd, 1.0, 0.0, 0.0);
      verts.push(x + hw, y + hh, z - hd, 1.0, 0.0, 0.0);
      verts.push(x + hw, y + hh, z + hd, 1.0, 0.0, 0.0);
      verts.push(x + hw, y - hh, z + hd, 1.0, 0.0, 0.0);

      // Back
      idx = verts.length / vert_stride;
      indices.push(idx, idx + 2, idx + 1);
      indices.push(idx, idx + 3, idx + 2);

      verts.push(x - hw, y - hh, z - hd, 0.0, 0.0, -1.0);
      verts.push(x + hw, y - hh, z - hd, 0.0, 0.0, -1.0);
      verts.push(x + hw, y + hh, z - hd, 0.0, 0.0, -1.0);
      verts.push(x - hw, y + hh, z - hd, 0.0, 0.0, -1.0);

      // Front
      idx = verts.length / vert_stride;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx, idx + 2, idx + 3);

      verts.push(x - hw, y - hh, z + hd, 0.0, 0.0, 1.0);
      verts.push(x + hw, y - hh, z + hd, 0.0, 0.0, 1.0);
      verts.push(x + hw, y + hh, z + hd, 0.0, 0.0, 1.0);
      verts.push(x - hw, y + hh, z + hd, 0.0, 0.0, 1.0);

      return {
        vert_offset: vert_offset * Float32Array.BYTES_PER_ELEMENT,
        index_offset: index_offset * Uint16Array.BYTES_PER_ELEMENT,
        element_count: indices.length - index_offset,
      };
    }

    function addCylinder(radius, height, offset, segments) {
      if (!offset) {
        offset = [0, 0, 0];
      }

      if (!segments) {
        segments = 12;
      }

      let vert_offset = verts.length / vert_stride;
      let index_offset = indices.length;

      // Cylinder side
      let segment_angle = (Math.PI * 2.0) / segments;
      for (let i = 0; i < segments; ++i) {
        let segment_offset = verts.length / vert_stride;
        // Top Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], height * 0.5 + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Top Normal
        verts.push(Math.cos(segment_angle * i), 0, Math.sin(segment_angle * i));
        // Bottom Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], -height * 0.5 + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Bottom Normal
        verts.push(Math.cos(segment_angle * i), 0, Math.sin(segment_angle * i));

        if (i > 0) {
          indices.push(segment_offset, segment_offset-1, segment_offset-2);
          indices.push(segment_offset-1, segment_offset, segment_offset+1);
        }
      }

      // Connect the loop
      let segment_offset = (verts.length / vert_stride) - 1;
      indices.push(segment_offset, segment_offset-1, vert_offset);
      indices.push(segment_offset, vert_offset, vert_offset+1);

      // Cylinder top
      let top_offset = verts.length / vert_stride;
      for (let i = 0; i < segments; ++i) {
        let segment_offset = verts.length / vert_stride;
        // Top Cap Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], height * 0.5 + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Top Cap Normal
        verts.push(0, 1, 0);

        if (i > 1) {
          indices.push(top_offset, segment_offset, segment_offset-1);
        }
      }

      // Cylinder bottom
      let bottom_offset = verts.length / vert_stride;
      for (let i = 0; i < segments; ++i) {
        let segment_offset = verts.length / vert_stride;
        // Top Cap Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], -height * 0.5 + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Top Cap Normal
        verts.push(0, -1, 0);

        if (i > 1) {
          indices.push(bottom_offset, segment_offset-1, segment_offset);
        }
      }

      return {
        vert_offset: vert_offset * Float32Array.BYTES_PER_ELEMENT,
        index_offset: index_offset * Uint16Array.BYTES_PER_ELEMENT,
        element_count: indices.length - index_offset,
      };
    }

    function addCone(radius, height, offset, segments) {
      if (!offset) {
        offset = [0, 0, 0];
      }

      if (!segments) {
        segments = 12;
      }

      let vert_offset = verts.length / vert_stride;
      let index_offset = indices.length;

      // Cone side
      let segment_angle = (Math.PI * 2.0) / segments;
      for (let i = 0; i < segments; ++i) {
        let segment_offset = verts.length / vert_stride;

        // TODO: The normal here is a bit off, look into fixing that.

        // Point Position
        verts.push(offset[0], offset[1], offset[2]);
        // Point Normal
        verts.push(Math.cos(segment_angle * i), 0, Math.sin(segment_angle * i));
        // Base Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], height + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Base Normal
        verts.push(Math.cos(segment_angle * i), 0, Math.sin(segment_angle * i));

        if (i > 0) {
          indices.push(segment_offset-2, segment_offset-1, segment_offset);
          indices.push(segment_offset+1, segment_offset, segment_offset-1);
        }
      }

      // Connect the loop
      let segment_offset = (verts.length / vert_stride) - 1;
      indices.push(vert_offset, segment_offset-1, segment_offset);
      indices.push(vert_offset+1, vert_offset, segment_offset);

      // Cone base
      let base_offset = verts.length / vert_stride;
      for (let i = 0; i < segments; ++i) {
        let segment_offset = verts.length / vert_stride;
        // Base Position
        verts.push(Math.cos(segment_angle * i) * radius + offset[0], height + offset[1], Math.sin(segment_angle * i) * radius + offset[2]);
        // Base Normal
        verts.push(0, 1, 0);

        if (i > 1) {
          indices.push(base_offset, segment_offset, segment_offset-1);
        }
      }

      return {
        vert_offset: vert_offset * Float32Array.BYTES_PER_ELEMENT,
        index_offset: index_offset * Uint16Array.BYTES_PER_ELEMENT,
        element_count: indices.length - index_offset,
      };
    }

    this.base = mergeMesh(
      addCylinder(0.008, 0.005, [0, 0, 0]),
      addBox(0.012, 0.0045, 0.02, [0, 0, 0.015]));

    this.touchpad = addCylinder(0.007, 0.0025, [0, 0.0025, 0]);
    this.touchpoint = addCylinder(0.002, 0.001, [-0.003, 0.0035, -0.003]);
    this.joystick = addCone(0.003, 0.004, [0, 0.002, 0], 8);
    this.trigger = addCylinder(0.007, 0.0035, [0, 0, -0.002]);
    this.grip = mergeMesh(
        addBox(0.002, 0.0035, 0.01, [-0.006, 0, 0.012]),
        addBox(0.002, 0.0035, 0.01, [0.006, 0, 0.012]));
    this.button = addCylinder(0.002, 0.001, [0.010, 0.0025, 0], 8);

    this.vert_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    this.index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  draw(projection_mat, view_mat) {
    let gl = this.gl;
    let program = this.program;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projection_mat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, view_mat);
    gl.uniformMatrix3fv(program.uniform.normalMat, false, this.normal_mat);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.normal);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(program.attrib.normal, 3, gl.FLOAT, false, 24, 12);

    function drawMesh(mesh, r, g, b) {
      gl.uniform4f(program.uniform.color, r, g, b, 1.0);
      gl.drawElements(gl.TRIANGLES, mesh.element_count, gl.UNSIGNED_SHORT, mesh.index_offset);
    }

    drawMesh(this.base, 0.6, 0.6, 0.6);
    drawMesh(this.touchpad, 0.3, 0.3, 0.6);
    drawMesh(this.touchpoint, 0.6, 0.6, 1.0);
    drawMesh(this.joystick, 0.3, 0.6, 0.3);
    drawMesh(this.trigger, 0.6, 0.3, 0.3);
    drawMesh(this.grip, 0.6, 0.3, 0.3);

    drawMesh(this.button, 0.6, 0.3, 0.3);
  }
}