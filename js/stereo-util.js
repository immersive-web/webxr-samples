window.VRStereoUtil = (function () {
  "use strict";

  var VS = [
      "#version 300 es",
      "uniform vec2 u_offset;",
      "uniform vec2 u_scale;",
      "out mediump vec2 v_texcoord;",

      "void main() {",

      //  xy - coords of the quad, normalized to 0..1
      //  xy  - UV of the source texture coordinate.
      "    const vec2 quad_positions[6] = vec2[6]",
      "    (",
      "        vec2(0.0, 0.0),",
      "        vec2(1.0, 0.0),",
      "        vec2(0.0, 1.0),",
      
      "        vec2(0.0, 1.0),",
      "        vec2(1.0, 0.0),",
      "        vec2(1.0, 1.0)",
      "    );",
      
      "    gl_Position = vec4(((quad_positions[gl_VertexID].xy * u_scale + u_offset) * 2.0) - 1.0, 0.0, 1.0);",
      "    v_texcoord = quad_positions[gl_VertexID].xy * u_scale + u_offset;",
      "}",
  ].join("\n");

  var VSMultiview = [
      "#version 300 es",
      "uniform vec2 u_offset;",
      "uniform vec2 u_scale;",
      "out mediump vec3 v_texcoord;",

      "void main() {",
      // offset of eye quad in -1..1 space
      "    const float eye_offset_x[12] = float[12] (",
      "        0.0, 0.0, 0.0, 0.0, 0.0, 0.0,",
      "        1.0, 1.0, 1.0, 1.0, 1.0, 1.0",
      "    );",
      //  xy - coords of the quad, normalized to 0..1
      //  xy  - UV of the source texture coordinate.
      //  z   - texture layer (eye) index - 0 or 1.
      "    const vec3 quad_positions[12] = vec3[12]",
      "    (",
      "        vec3(0.0, 0.0, 0.0),",
      "        vec3(1.0, 0.0, 0.0),",
      "        vec3(0.0, 1.0, 0.0),",

      "        vec3(0.0, 1.0, 0.0),",
      "        vec3(1.0, 0.0, 0.0),",
      "        vec3(1.0, 1.0, 0.0),",

      "        vec3(0.0, 0.0, 1.0),",
      "        vec3(1.0, 0.0, 1.0),",
      "        vec3(0.0, 1.0, 1.0),",

      "        vec3(0.0, 1.0, 1.0),",
      "        vec3(1.0, 0.0, 1.0),",
      "        vec3(1.0, 1.0, 1.0)",
      "    );",

      "    const vec2 pos_scale = vec2(0.5, 1.0);",
      "    vec2 eye_offset = vec2(eye_offset_x[gl_VertexID], 0.0);",
      "    gl_Position = vec4(((quad_positions[gl_VertexID].xy * u_scale + u_offset) * pos_scale * 2.0) - 1.0 + eye_offset, 0.0, 1.0);",
      "    v_texcoord = vec3(quad_positions[gl_VertexID].xy * u_scale + u_offset, quad_positions[gl_VertexID].z);",
      "}",
  ].join("\n");

  var FS = [
      "#version 300 es",
      "uniform mediump sampler2D u_source_texture;",
      "in mediump vec2 v_texcoord;",
      "out mediump vec4 output_color;",
      
      "void main()",
      "{",
      "    output_color = texture(u_source_texture, v_texcoord);",
      "}",
  ].join("\n");

  var FSMultiview = [
    "#version 300 es",
    "uniform mediump sampler2DArray u_source_texture;",
    "in mediump vec3 v_texcoord;",
    "out mediump vec4 output_color;",

    "void main()",
    "{",
    "    output_color = texture(u_source_texture, v_texcoord);",
    "}",
  ].join("\n");


  var StereoUtil = function (gl) {
    this.gl = gl;

    //this.vaoext = gl.getExtension("OES_vertex_array_object"); // Vendor prefixes may apply!  
    this.vao = gl.createVertexArray();

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(VS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(FS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      texCoord: 1
    });
    this.program.link();

    console.log("compiling multiview shader");
    this.program_multiview = new WGLUProgram(gl);
    this.program_multiview.attachShaderSource(VSMultiview, gl.VERTEX_SHADER);
    this.program_multiview.attachShaderSource(FSMultiview, gl.FRAGMENT_SHADER);
    this.program_multiview.bindAttribLocation({
      v_texcoord: 0,
    });
    this.program_multiview.link();
  };

  var mvrenReported = false;
  StereoUtil.prototype.blit = function (multiview,
    source_texture,
    source_rect_uv_x,
    source_rect_uv_y,
    source_rect_uv_width,
    source_rect_uv_height,
    dest_surface_width,
    dest_surface_height) {
    let gl = this.gl;
    let program = this.program;

    gl.activeTexture(gl.TEXTURE0);  

    if (multiview) {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, source_texture);  
      if (!mvrenReported) {
        console.log("render multiview");
        mvrenReported = true;
      }
      program = this.program_multiview;
      program.use();
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, source_texture);  
      mvrenReported = false;
      program.use();
      //gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
      //gl.uniformMatrix4fv(program.uniform.modelViewMat, false, modelViewMat);
    }

    // Render to the destination texture, sampling from the scratch texture
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
//    gl.disable(gl.CULL_FACE);
    gl.colorMask(true, true, true, true);
    gl.depthMask(false);
//    gl.disable(gl.BLEND);
//    gl.disable(gl.DITHER);

    gl.viewport(0, 0, dest_surface_width, dest_surface_height);

    gl.uniform2f(program.uniform.u_scale, source_rect_uv_width, source_rect_uv_height);
    gl.uniform2f(program.uniform.u_offset, source_rect_uv_x, source_rect_uv_y);
    gl.uniform1i(program.uniform.u_source_texture, 0);

    // Start setting up VAO  
    gl.bindVertexArray(this.vao);    
    if (multiview) {
      gl.drawArrays(gl.TRIANGLES, 0, 12);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
};

  return StereoUtil;
})();
