/*
Copyright (c) 2017, Brandon Jones.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

window.GLTF2SceneLoader = (function() {

// The shader strings don't minify well, so I've pre-emptively taken steps to
// make them smaller. The affects readability, for which I am truly sorry!
const PBR_VS = `
attribute vec3 POSITION, NORMAL;
attribute vec2 TEXCOORD_0, TEXCOORD_1;

uniform mat4 proj, view, model;
uniform vec3 lightDir;
uniform vec3 cameraPos;

varying vec3 vLight; // Vector from vertex to light.
varying vec3 vView; // Vector from vertex to camera.
varying vec2 vTex;

#ifdef USE_NORMAL_MAP
attribute vec4 TANGENT;
varying mat3 vTBN;
#else
varying vec3 vNorm;
#endif

#ifdef USE_VERTEX_COLOR
attribute vec4 COLOR_0;
varying vec4 vCol;
#endif

void main() {
  vec3 n = normalize(vec3(model * vec4(NORMAL, 0.0)));
#ifdef USE_NORMAL_MAP
  vec3 t = normalize(vec3(model * vec4(TANGENT.xyz, 0.0)));
  vec3 b = cross(n, t) * TANGENT.w;
  vTBN = mat3(t, b, n);
#else
  vNorm = n;
#endif

#ifdef USE_VERTEX_COLOR
  vCol = COLOR_0;
#endif

  vTex = TEXCOORD_0;
  vec4 mPos = model * vec4(POSITION, 1.0);
  vLight = -lightDir;
  vView = cameraPos - mPos.xyz;
  gl_Position = proj * view * mPos;
}`;

// These equations are borrowed with love from this docs from Epic because I
// just don't have anything novel to bring to the PBR scene.
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
const EPIC_PBR_FUNCTIONS = `
vec3 lambertDiffuse(vec3 cDiff) {
  return cDiff / M_PI;
}

float specD(float a, float nDotH) {
  float aSqr = a * a;
  float f = ((nDotH * nDotH) * (aSqr - 1.0) + 1.0);
  return aSqr / (M_PI * f * f);
}

float specG(float roughness, float nDotL, float nDotV) {
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float gl = nDotL / (nDotL * (1.0 - k) + k);
  float gv = nDotV / (nDotV * (1.0 - k) + k);
  return gl * gv;
}

vec3 specF(float vDotH, vec3 F0) {
  float exponent = (-5.55473 * vDotH - 6.98316) * vDotH;
  float base = 2.0;
  return F0 + (1.0 - F0) * pow(base, exponent);
}`;

const PBR_FS = `
precision highp float;

#define M_PI 3.14159265

uniform vec4 baseColorFactor;
uniform sampler2D baseColorTex;

varying vec3 vLight;
varying vec3 vView;
varying vec2 vTex;

#ifdef USE_VERTEX_COLOR
varying vec4 vCol;
#endif

#ifdef USE_NORMAL_MAP
uniform sampler2D normalTex;
varying mat3 vTBN;
#else
varying vec3 vNorm;
#endif

#ifdef USE_METAL_ROUGH_MAP
uniform sampler2D metallicRoughnessTex;
#endif
uniform vec2 metallicRoughnessFactor;

#ifdef USE_OCCLUSION
uniform sampler2D occlusionTex;
uniform float occlusionStrength;
#endif

#ifdef USE_EMISSIVE
uniform sampler2D emissiveTex;
uniform vec3 emissiveFactor;
#endif

uniform vec3 lightColor;

const vec3 hemiLightDir = vec3(0.0, 1.0, 0.0);
const vec3 skyColor = vec3(0.08, 0.08, 0.1);
const vec3 groundColor = vec3(0.05, 0.05, 0.02);

const vec3 dielectricSpec = vec3(0.04);
const vec3 black = vec3(0.0);

${EPIC_PBR_FUNCTIONS}

void main() {
#ifdef USE_BASE_COLOR_MAP
  vec4 baseColor = texture2D(baseColorTex, vTex) * baseColorFactor;
#else
  vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0) * baseColorFactor;
#endif

#ifdef USE_VERTEX_COLOR
  baseColor *= vCol;
#endif

#ifdef USE_NORMAL_MAP
  vec3 n = texture2D(normalTex, vTex).rgb;
  n = normalize(vTBN * (2.0 * n - 1.0));
#else
  vec3 n = normalize(vNorm);
#endif

  float metallic = metallicRoughnessFactor.x;
  float roughness = metallicRoughnessFactor.y;
#ifdef USE_METAL_ROUGH_MAP
  vec4 metallicRoughness = texture2D(metallicRoughnessTex, vTex);
  metallic *= metallicRoughness.b;
  roughness *= metallicRoughness.g;
#endif
  
  vec3 l = normalize(vLight);
  vec3 v = normalize(vView);
  vec3 h = normalize(l+v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = abs(dot(n, v)) + 0.001;
  float nDotH = max(dot(n, h), 0.0);
  float vDotH = max(dot(v, h), 0.0);

  // From GLTF Spec
  vec3 cDiff = mix(baseColor.rgb * (1.0 - dielectricSpec.r), black, metallic); // Diffuse color
  vec3 F0 = mix(dielectricSpec, baseColor.rgb, metallic); // Specular color
  float a = roughness * roughness;

#ifdef FULLY_ROUGH
  vec3 specular = F0 * 0.45;;
#else
  vec3 F = specF(vDotH, F0);
  float D = specD(a, nDotH);
  float G = specG(roughness, nDotL, nDotV);
  vec3 specular = (D * F * G) / (4.0 * nDotL * nDotV);
#endif
  float halfLambert = nDotL * 0.85 + 0.15;

  vec3 color = (halfLambert * lightColor * lambertDiffuse(cDiff)) + specular;

#ifdef USE_OCCLUSION
  float occlusion = texture2D(occlusionTex, vTex).r;
  color = mix(color, color * occlusion, occlusionStrength);
#endif

#ifdef USE_EMISSIVE
  color += texture2D(emissiveTex, vTex).rgb * emissiveFactor;
#endif

  // gamma correction
  color = pow(color, vec3(1.0/2.2));

  gl_FragColor = vec4(color, baseColor.a);
}`;

const ATTRIB_MAP = {
  POSITION: 1,
  NORMAL: 2,
  TANGENT: 3,
  TEXCOORD_0: 4,
  TEXCOORD_1: 5,
  COLOR_0: 6,
};

const ATTRIB_MASK = {
  POSITION:   0x0001,
  NORMAL:     0x0002,
  TANGENT:    0x0004,
  TEXCOORD_0: 0x0008,
  TEXCOORD_1: 0x0010,
  COLOR_0:    0x0020,
};

const PROGRAM_MASK = {
  USE_VERTEX_COLOR:    0x0001,
  USE_BASE_COLOR_MAP:  0x0002,
  USE_MATERIAL_COLOR:  0x0004,
  USE_NORMAL_MAP:      0x0008,
  USE_METAL_ROUGH_MAP: 0x0010,
  USE_OCCLUSION:       0x0020,
  USE_EMISSIVE:        0x0040,
  FULLY_ROUGH:         0x0080,
};

const IDENTITY = new Float32Array(
    [1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1]);
const DEF_TRANSLATION = new Float32Array([0, 0, 0]);
const DEF_ROTATION = new Float32Array([0, 0, 0, 1]);
const DEF_SCALE = new Float32Array([1, 1, 1]);

const DEF_LIGHT_DIR = new Float32Array([-0.1, -1.0, -0.2]);
const DEF_LIGHT_COLOR = new Float32Array([1.0, 1.0, 0.9]);

const GLB_MAGIC = 0x46546C67;
const CHUNK_TYPE = {
  JSON: 0x4E4F534A,
  BIN: 0x004E4942
};

function isAbsoluteUri (uri) {
  let absRegEx = new RegExp('^'+window.location.protocol, 'i');
  return !!uri.match(absRegEx);
}

function isDataUri(uri) {
  let dataRegEx = /^data:/;
  return !!uri.match(dataRegEx);
}

function resolveUri(uri, baseUrl) {
  if (isAbsoluteUri(uri) || isDataUri(uri)) {
      return uri;
  }
  return baseUrl + uri;
}

function getComponentCount(type) {
  switch (type) {
    case 'SCALAR': return 1;
    case 'VEC2': return 2;
    case 'VEC3': return 3;
    case 'VEC4': return 4;
    default: return 0;
  }
}

function isPowerOfTwo(n) {
  return (n & (n - 1)) === 0;
}

// Creates a matrix from a quaternion rotation, and vector translation and scale
function translationRotationScaleMatrix(t, r, s) {
  let x = r[0], y = r[1], z = r[2], w = r[3];
  let sx = s[0], sy = s[1], sz = s[2];
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

  let out = new Float32Array(16);
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = t[0];
  out[13] = t[1];
  out[14] = t[2];
  out[15] = 1;

  return out;
}

function mat4Mul(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  // Cache only the current line of the second matrix
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  return out;
}

function mat4GetScaling(out, mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}

function vec3Transform(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}

/**
 * GLTF2SceneLoader
 * Loads glTF 2.0 scenes into a renderable format.
 */

class GLTF2SceneLoader {
  constructor(gl) {
    this.gl = gl;
    this.programCache = new ProgramCache(gl);
  }

  loadFromUrl(url) {
    return fetch(url)
        .then((response) => {
          let i = url.lastIndexOf('/');
          let baseUrl = (i !== 0) ? url.substring(0, i + 1) : '';

          if (url.endsWith('.gltf')) {
            return response.json().then((json) => {
              return this.loadFromJson(json, baseUrl);
            });
          } else if (url.endsWith('.glb')) {
            return response.arrayBuffer().then((arrayBuffer) => {
              return this.loadFromBinary(arrayBuffer, baseUrl);
            });
          } else {
            throw new Error('Unrecognized file extension');
          }
        });
  }

  loadFromBinary(arrayBuffer, baseUrl) {
    let headerView = new DataView(arrayBuffer, 0, 12);
    let magic = headerView.getUint32(0, true);
    let version = headerView.getUint32(4, true);
    let length = headerView.getUint32(8, true);

    if (magic != GLB_MAGIC) {
      throw new Error('Invalid magic string in binary header.');
    }

    if (version != 2) {
      throw new Error('Incompatible version in binary header.');
    }

    let chunks = {};
    let chunkOffset = 12;
    while (chunkOffset < length) {
      let chunkHeaderView = new DataView(arrayBuffer, chunkOffset, 8);
      let chunkLength = chunkHeaderView.getUint32(0, true);
      let chunkType = chunkHeaderView.getUint32(4, true);
      chunks[chunkType] = arrayBuffer.slice(chunkOffset + 8, chunkOffset + 8 + chunkLength);
      chunkOffset += chunkLength + 8;
    }

    if (!chunks[CHUNK_TYPE.JSON]) {
      throw new Error('File contained no json chunk.');
    }

    let decoder = new TextDecoder('utf-8');
    let jsonString = decoder.decode(chunks[CHUNK_TYPE.JSON]);
    let json = JSON.parse(jsonString);
    return this.loadFromJson(json, baseUrl, chunks[CHUNK_TYPE.BIN]);
  }

  loadFromJson(json, baseUrl, binaryChunk) {
    let gl = this.gl;
    let glScene = new GLTF2Scene(gl);

    let pendingPromises = [];

    if (!json.asset) {
      throw new Error("Missing asset description.");
    }

    if (json.asset.minVersion != "2.0" && json.asset.version != "2.0") {
      throw new Error("Incompatible asset version.");
    }

    let buffers = [];
    if (binaryChunk) {
      buffers[0] = new GLTF2Resource({}, baseUrl, binaryChunk);
    } else {
      for (let buffer of json.buffers) {
        buffers.push(new GLTF2Resource(buffer, baseUrl));
      }
    }

    let bufferViews = [];
    for (let bufferView of json.bufferViews) {
      bufferViews.push(new GLTF2BufferView(bufferView, buffers));
    }

    let images = [];
    if (json.images) {
      for (let image of json.images) {
        images.push(new GLTF2Resource(image, baseUrl));
      }
    }

    let textureCache = new TextureCache(gl);
    if (json.textures) {
      for (let texture of json.textures) {
        let image = images[texture.source];
        let imagePromise = image.image(bufferViews);
        let sampler = texture.sampler ? sampler[texture.sampler] : {};
        textureCache.addTexture(imagePromise, sampler);
        // Comment out if you don't mind the mesh rendering before all of the
        // textures have finished loading.
        pendingPromises.push(imagePromise);
      }
    }

    let materials = [];
    if (json.materials) {
      for (let material of json.materials) {
        materials.push(new GLTF2Material(material, textureCache));
      }
    }

    let accessors = json.accessors;

    for (let mesh of json.meshes) {
      let glMesh = new GLTF2Mesh();
      glScene.meshes.push(glMesh);

      for (let primitive of mesh.primitives) {
        let material = null;
        if ('material' in primitive) {
          material = materials[primitive.material];
        } else {
          // Create a "default" material if the primitive has none.
          material = new GLTF2Material({}, textureCache);
        }

        let glPrimitive = new GLTF2Primitive(primitive, material);
        glMesh.primitives.push(glPrimitive);

        for (let name in primitive.attributes) {
          if (name in ATTRIB_MAP) {
            let accessor = accessors[primitive.attributes[name]];
            glPrimitive.elementCount = accessor.count;
            glPrimitive.attributeMask |= ATTRIB_MASK[name];

            let bufferView = bufferViews[accessor.bufferView];
            pendingPromises.push(
                bufferView.glBuffer(gl, gl.ARRAY_BUFFER).then((buffer) => {
                    glPrimitive.addAttribute(buffer,
                        new GLTF2PrimitiveAttribute(
                            ATTRIB_MAP[name], accessor, bufferView.byteStride));
            }));
          }
        }

        // After all the attributes have been processed, get a program that is
        // appropriate for both the material and the primitive attributes.
        glPrimitive.program = this.programCache.getProgram(material, glPrimitive);

        if ('indices' in primitive) {
          let accessor = accessors[primitive.indices];
          glPrimitive.indexType = accessor.componentType;
          glPrimitive.indexByteOffset = accessor.byteOffset || 0;
          glPrimitive.elementCount = accessor.count;

          let bufferView = bufferViews[accessor.bufferView];
          pendingPromises.push(bufferView.glBuffer(gl, gl.ELEMENT_ARRAY_BUFFER).then((buffer) => {
            glPrimitive.indexBuffer = buffer;
          }));
        }
      }
    }

    let scene = json.scenes[json.scene];
    for (let nodeId of scene.nodes) {
      let node = json.nodes[nodeId];
      glScene.nodes.push(
          this.processNodes(glScene, node, json.nodes, IDENTITY));
    }

    return Promise.all(pendingPromises).then(() => glScene);
  }

  processNodes(scene, node, nodes, parentTransform) {
    let glNode = new GLTF2Node();
    if (node.matrix) {
      glNode.transform = new Float32Array(node.matrix);
      mat4Mul(glNode.transform, parentTransform, glNode.transform);
    } else if (node.translation || node.rotation || node.scale ) {
      glNode.transform = translationRotationScaleMatrix(
          node.translation || DEF_TRANSLATION,
          node.rotation || DEF_ROTATION,
          node.scale || DEF_SCALE);
      mat4Mul(glNode.transform, parentTransform, glNode.transform);
    } else {
      glNode.transform = new Float32Array(parentTransform);
    }

    if ('mesh' in node) {
      let mesh = scene.meshes[node.mesh];
      mesh.instanceNodes.push(glNode);
    }

    if (node.children) {
      for (let nodeId of node.children) {
        let node = nodes[nodeId];
        glNode.children.push(
            this.processNodes(scene, node, nodes, glNode.transform));
      }
    }

    return glNode;
  }
}

class GLTF2Scene {
  constructor(gl) {
    this.gl = gl;
    this.images = [];
    this.meshes = [];
    this.nodes = [];
    this.light = { direction: DEF_LIGHT_DIR, color: DEF_LIGHT_COLOR};
    this.invViewMat = mat4.create();
    this.cameraPositions = [vec3.create()];
  }

  computeBoundingSphere() {
    if (!this.meshes.length)
      return null;

    let sphere = this.meshes[0].computeBoundingSphere();
    for (let i = 1; i < this.meshes.length; ++i) {
      let meshSphere = this.meshes[i].computeBoundingSphere();
      sphere.merge(meshSphere);
    }

    return sphere;
  }

  draw(projectionMat, viewMat) {
    this.drawViewports([projectionMat], [viewMat], null);
  }

  drawViewports(projectionMats, viewMats, viewports) {
    let gl = this.gl;

    // Compute the necessary inverse view matrices
    for (let i = 0; i < viewMats.length; ++i) {
      mat4.invert(this.invViewMat, viewMats[i]);

      if (this.cameraPositions.length <= i) {
        this.cameraPositions.push(vec3.create());
      }
      let cameraPos = this.cameraPositions[i];
      vec3.set(cameraPos, 0, 0, 0);
      vec3.transformMat4(cameraPos, cameraPos, this.invViewMat);
    }

    if (viewports && viewports.length == 1) {
      let vp = viewports[0];
      gl.viewport(vp.x, vp.y, vp.width, vp.height);
    }
    
    let program = null;

    for (let mesh of this.meshes) {
      for (let primitive of mesh.primitives) {
        // Bind the primitive's program if it's different than the one we were
        // using for the previous primitive.
        if (program != primitive.program) {
          program = primitive.program;
          program.use();

          if (viewMats.length == 1) {
            gl.uniformMatrix4fv(program.uniform.proj, false, projectionMats[0]);
            gl.uniformMatrix4fv(program.uniform.view, false, viewMats[0]);
            gl.uniform3fv(program.uniform.cameraPos, this.cameraPositions[0]);
          }

          gl.uniform3fv(program.uniform.lightDir, this.light.direction);
          gl.uniform3fv(program.uniform.lightColor, this.light.color);
        }

        let material = primitive.material;

        // TODO: Blerg. Do this better.
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.disableVertexAttribArray(4);
        gl.disableVertexAttribArray(5);
        gl.disableVertexAttribArray(6);

        if (material.doubleSided) {
          gl.disable(gl.CULL_FACE);
        } else {
          gl.enable(gl.CULL_FACE);
        }

        // Bind all appropriate textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, material.baseColorTexture);

        gl.uniform4fv(program.uniform.baseColorFactor, material.baseColorFactor);

        if (program.defines.USE_NORMAL_MAP) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, material.normalTexture);
        }

        if (program.defines.USE_OCCLUSION) {
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, material.occlusionTexture);

          gl.uniform1f(program.uniform.occlusionStrength, material.occlusionStrength);
        }

        if (program.defines.USE_EMISSIVE) {
          gl.activeTexture(gl.TEXTURE3);
          gl.bindTexture(gl.TEXTURE_2D, material.emissiveTexture);

          gl.uniform3fv(program.uniform.emissiveFactor, material.emissiveFactor);
        }

        if (program.defines.USE_METAL_ROUGH_MAP) {
          gl.activeTexture(gl.TEXTURE4);
          gl.bindTexture(gl.TEXTURE_2D, material.metallicRoughnessTexture);

          gl.uniform2fv(program.uniform.metallicRoughnessFactor, material.metallicRoughnessFactor);
        }

        for (let buffer of primitive.buffers) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
          for (let attrib of buffer.attributes) {
            gl.enableVertexAttribArray(attrib.index);
            gl.vertexAttribPointer(
                attrib.index, attrib.componentCount, attrib.componentType,
                attrib.normalized, attrib.stride, attrib.byteOffset);
          }
        }

        if (primitive.indexBuffer) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indexBuffer);
        }

        for (let instanceNode of mesh.instanceNodes) {
          gl.uniformMatrix4fv(program.uniform.model, false, instanceNode.transform);

          if (viewMats.length == 1) {
            if (primitive.indexBuffer) {
              gl.drawElements(primitive.mode, primitive.elementCount,
                              primitive.indexType, primitive.indexByteOffset);
            } else {
              gl.drawArrays(primitive.mode, 0, primitive.elementCount);
            }
          } else {
            for (let i = 0; i < viewMats.length; ++i) {
              if (viewports) {
                let vp = viewports[i];
                gl.viewport(vp.x, vp.y, vp.width, vp.height);
              }
              gl.uniformMatrix4fv(program.uniform.proj, false, projectionMats[i]);
              gl.uniformMatrix4fv(program.uniform.view, false, viewMats[i]);
              gl.uniform3fv(program.uniform.cameraPos, this.cameraPositions[i]);

              if (primitive.indexBuffer) {
                gl.drawElements(primitive.mode, primitive.elementCount,
                                primitive.indexType, primitive.indexByteOffset);
              } else {
                gl.drawArrays(primitive.mode, 0, primitive.elementCount);
              }
            }
          }
        }
      }
    }
  }
}

class GLTF2BoundingSphere {
  constructor(center, radius) {
    this.center = [center[0], center[1], center[2]];
    this.radius = radius;
  }

  merge(other) {
    // Compute the distance between the centers.
    let vx = other.center[0] - this.center[0];
    let vy = other.center[1] - this.center[1];
    let vz = other.center[2] - this.center[2];
    let vlen = Math.sqrt(vx*vx + vy*vy + vz*vz);
    let r1 = this.radius;
    let r2 = other.radius;

    // If the center points are exactly equal, take the largest radius.
    if (vlen == 0) {
      this.radius == Math.max(r1, r2);
      return this;
    }

    // If this sphere completely contains the other sphere, stay unchanged.
    if (r1 > vlen + r2)
      return this;

    // If the other sphere completely contains this sphere, copy it.
    if (r2 > vlen + r1) {
      this.center[0] = other.center[0];
      this.center[1] = other.center[1];
      this.center[2] = other.center[2];
      this.radius = r2;
      return this;
    }

    // Otherwise merge the two spheres into a new one.
    let s = (0.5 * (r2 + vlen - r1)/vlen);
    this.center[0] += vx * s;
    this.center[1] += vy * s;
    this.center[2] += vz * s;

    this.radius = (r1 + vlen + r2) * 0.5;

    return this;
  }
}

class GLTF2Node {
  constructor() {
    this.children = [];
    this.transform = null;
  }
}

class GLTF2Material {
  constructor(json, textureCache) {
    let pbr = json.pbrMetallicRoughness || {};
    this.baseColorFactor = new Float32Array(pbr.baseColorFactor || [1, 1, 1, 1]);
    this.baseColorTexture = textureCache.getTexture(pbr.baseColorTexture);
    this.metallicRoughnessFactor = new Float32Array([
        pbr.metallicFactor || 1.0,
        pbr.roughnessFactor || 1.0]);
    this.metallicRoughnessTexture = textureCache.getTexture(pbr.metallicRoughnessTexture);
    this.normalTexture = textureCache.getTexture(json.normalTexture);
    this.occlusionTexture = textureCache.getTexture(json.occlusionTexture);
    this.occlusionStrength = (json.occlusionTexture && json.occlusionTexture.strength) ? json.occlusionTexture.strength : 1.0;
    this.emissiveFactor = new Float32Array(json.emissiveFactor || [0, 0, 0]);
    this.emissiveTexture = textureCache.getTexture(json.emissiveTexture, json.emissiveFactor ? 'white' : null);
    this.alphaMode = json.alpaMode;
    this.alphaCutoff = json.alphaCutoff;
    this.doubleSided = json.doubleSided;
  }
}

class GLTF2Mesh {
  constructor() {
    this.primitives = [];
    this.instanceNodes = [];
  }

  computeBoundingSphere() {
    let sphere = null;
    let scaleVec = new Float32Array(3);

    for (let primitive of this.primitives) {
      let primSphere = primitive.computeBoundingSphere();
      for (let instance of this.instanceNodes) {
        let instanceSphere = new GLTF2BoundingSphere(primSphere.center, primSphere.radius);

        // Transform the sphere center by the instance transform matrix
        vec3Transform(instanceSphere.center, instanceSphere.center, instance.transform);

        // Make sure the radius is properly scaled as well
        mat4GetScaling(scaleVec, instance.transform);
        let scale = Math.max(scaleVec[0], Math.max(scaleVec[1], scaleVec[2]));
        instanceSphere.radius *= scale;

        if (sphere == null) {
          sphere = instanceSphere;
        } else {
          sphere.merge(instanceSphere);
        }
      }
    }

    return sphere;
  }
}

class GLTF2Primitive {
  constructor(json, material) {
    this.mode = 'mode' in json ? json.mode : 4; // == gl.TRIANGLES;
    this.buffers = [];
    this.indexBuffer = null;
    this.indexByteOffset = 0;
    this.indexType = 5123; // == GL.UNSIGNED_SHORT;
    this.elementCount = 0;
    this.material = material;
    this.max = [0, 0, 0];
    this.min = [0, 0, 0];
    this._boundingSphere = null;
    this.attributeMask = 0;
    this.program = null;
  }

  addAttribute(buffer, attribute) {
    if (attribute.index == ATTRIB_MAP.POSITION) {
      this.max = attribute.max;
      this.min = attribute.min;
    }
    for (let i = 0; i < this.buffers; ++i) {
      if (this.buffers[i] == buffer) {
        this.buffers[i].attributes.push(attribute);
        return;
      }
    }
    let primitiveBuffer = new GLTF2PrimitiveBuffer(buffer);
    primitiveBuffer.attributes.push(attribute);
    this.buffers.push(primitiveBuffer);
  }

  computeBoundingSphere() {
    if (!this._boundingSphere) {
      let dx = this.max[0] - this.min[0];
      let dy = this.max[1] - this.min[1];
      let dz = this.max[2] - this.min[2];
      let dlen = Math.sqrt(dx*dx + dy*dy + dz*dz);
      let cx = (this.max[0] + this.min[0]) * 0.5;
      let cy = (this.max[1] + this.min[1]) * 0.5;
      let cz = (this.max[2] + this.min[2]) * 0.5;
      this._boundingSphere = new GLTF2BoundingSphere([cx, cy, cz], dlen*0.5);
    }
    return this._boundingSphere;
  }
}

class GLTF2PrimitiveBuffer {
  constructor(buffer) {
    this.buffer = buffer;
    this.attributes = [];
  }
}

class GLTF2PrimitiveAttribute {
  constructor(index, accessor, stride) {
    this.index = index;
    this.byteOffset = accessor.byteOffset || 0;
    this.componentType = accessor.componentType;
    this.componentCount = getComponentCount(accessor.type);
    this.normalized = accessor.normalized || false;
    this.count = accessor.count;
    this.max = accessor.max;
    this.min = accessor.min;
    this.stride = stride || 0;
  }
}

class GLTF2BufferView {
  constructor(json, buffers) {
    this.buffer = buffers[json.buffer];
    this.byteOffset = json.byteOffset || 0;
    this.byteLength = json.byteLength || null;
    this.byteStride = json.byteStride;

    this._viewPromise = null;
    this._glBufferPromise = null;
  }

  dataView() {
    if (!this._viewPromise) {
      this._viewPromise = this.buffer.arrayBuffer().then((arrayBuffer) => {
        return new DataView(arrayBuffer, this.byteOffset, this.byteLength);
      });
    }
    return this._viewPromise;
  }

  glBuffer(gl, target) {
    if (!this._glBufferPromise) {
      this._glBufferPromise = this.dataView().then((dataView) => {
        let buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, dataView, gl.STATIC_DRAW);
        return buffer;
      });
    }
    return this._glBufferPromise;
  }
}

class GLTF2Resource {
  constructor(json, baseUrl, arrayBuffer) {
    this.json = json;
    this.baseUrl = baseUrl;

    this._dataPromise = null;
    if (arrayBuffer) {
      this._dataPromise = Promise.resolve(arrayBuffer);
    }
  }

  arrayBuffer() {
    if (!this._dataPromise) {
      if (isDataUri(this.json.uri)) {
        let base64String = this.json.uri.replace('data:application/octet-stream;base64,', '');
        let binaryArray = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
        this._dataPromise = Promise.resolve(binaryArray.buffer);
        return this._dataPromise;
      }

      this._dataPromise = fetch(resolveUri(this.json.uri, this.baseUrl))
          .then((response) => response.arrayBuffer());
    }
    return this._dataPromise;
  }

  image(bufferViews) {
    if (!this._dataPromise) {
      if (this.json.uri) {
        this._dataPromise = new Promise((resolve, reject) => {
          let img = new Image();
          img.addEventListener('load', () => resolve(img));
          img.addEventListener('error', reject);

          if (isDataUri(this.json.uri)) {
            img.src = this.json.uri;
          } else {
            img.src = `${this.baseUrl}${this.json.uri}`;
          }
        });
      } else {
        let view = bufferViews[this.json.bufferView];
        this._dataPromise = view.dataView().then((dataView) => {
          return new Promise((resolve, reject) => {
            let img = new Image();
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', reject);

            let blob = new Blob([dataView], { type: this.json.mimeType } );
            img.src = window.URL.createObjectURL(blob);
          });
        });
      }
    }
    return this._dataPromise;
  }
}

class TextureCache {
  constructor(gl) {
    this.gl = gl;
    this.textures = [];
    this._white = null;
  }

  addTexture(imagePromise, sampler) {
    let gl = this.gl;
    let texture = gl.createTexture();
    this.textures.push(texture);
    imagePromise.then((img) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      let powerOfTwo = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
      let minFilter = sampler.minFilter || (powerOfTwo ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      let wrapS = sampler.wrapS || (powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      let wrapT = sampler.wrapT || (powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.magFilter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

      if (minFilter >= gl.NEAREST_MIPMAP_NEAREST &&
          minFilter <= gl.LINEAR_MIPMAP_LINEAR) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    });
  }

  getTexture(textureInfo, defaultTexture) {
    if (!textureInfo) {
      switch (defaultTexture) {
        case 'white':
          if (!this._white) {
            this._white = this.colorTexture(1.0, 1.0, 1.0, 1.0);
          }
          return this._white;
        default: return null;
      }
    }

    return this.textures[textureInfo.index];
  }

  colorTexture(r, g, b, a) {
    let gl = this.gl;
    let data = new Uint8Array([r*255.0, g*255.0, b*255.0, a*255.0]);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }
}

class Program {
  constructor(gl, vertSrc, fragSrc, attribMap, defines) {
    this.gl = gl;
    this.program = gl.createProgram();
    this.attrib = null;
    this.uniform = null;
    this.defines = {};

    this._firstUse = true;

    let definesString = '';
    if (defines) {
      for (let define in defines) {
        this.defines[define] = defines[define];
        definesString += `#define ${define} ${defines[define]}\n`;
      }
    }

    this._vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.attachShader(this.program, this._vertShader);
    gl.shaderSource(this._vertShader, definesString + vertSrc);
    gl.compileShader(this._vertShader);

    this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.attachShader(this.program, this._fragShader);
    gl.shaderSource(this._fragShader, definesString + fragSrc);
    gl.compileShader(this._fragShader);

    if (attribMap) {
      this.attrib = {};
      for (let attribName in attribMap) {
        gl.bindAttribLocation(this.program, attribMap[attribName], attribName);
        this.attrib[attribName] = attribMap[attribName];
      }
    }

    gl.linkProgram(this.program);
  }

  use() {
    let gl = this.gl;

    // If this is the first time the program has been used do all the error checking and
    // attrib/uniform querying needed.
    let firstUse = this._firstUse;
    if (this._firstUse) {
      this._firstUse = false;
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
          console.error('Vertex shader compile error:', gl.getShaderInfoLog(this._vertShader));
        } else if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
          console.error('Fragment shader compile error:', gl.getShaderInfoLog(this._fragShader));
        } else {
          console.error('Program link error:', gl.getProgramInfoLog(this.program));
        }
        gl.deleteProgram(this.program);
        this.program = null;
      } else {
        if (!this.attrib) {
          this.attrib = {};
          let attribCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
          for (let i = 0; i < attribCount; i++) {
            let attribInfo = gl.getActiveAttrib(this.program, i);
            this.attrib[attribInfo.name] = gl.getAttribLocation(this.program, attribInfo.name);
          }
        }

        this.uniform = {};
        let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        let uniformName = '';
        for (let i = 0; i < uniformCount; i++) {
          let uniformInfo = gl.getActiveUniform(this.program, i);
          uniformName = uniformInfo.name.replace('[0]', '');
          this.uniform[uniformName] = gl.getUniformLocation(this.program, uniformName);
        }
      }
      gl.deleteShader(this._vertShader);
      gl.deleteShader(this._fragShader);
    }

    gl.useProgram(this.program);

    // We can set up some uniforms right away that we know will never change again
    if (firstUse) {
      gl.uniform1i(this.uniform.baseColorTex, 0);

      if (this.defines.USE_NORMAL_MAP) {
        gl.uniform1i(this.uniform.normalTex, 1);
      }

      if (this.defines.USE_OCCLUSION) {
        gl.uniform1i(this.uniform.occlusionTex, 2);
      }

      if (this.defines.USE_EMISSIVE) {
        gl.uniform1i(this.uniform.emissiveTex, 3);
      }

      if (this.defines.USE_METAL_ROUGH_MAP) {
        gl.uniform1i(this.uniform.metallicRoughnessTex, 4);
      }
    }
  }
}

class ProgramCache {
  constructor(gl) {
    this.gl = gl;
    this.programs = [];
  }

  getProgram(material, primitive) {
    let programMask = 0;
    let programDefines = {};
    let gl = this.gl;

    if (primitive.attributeMask & ATTRIB_MASK.COLOR_0) {
      programMask |= PROGRAM_MASK.USE_VERTEX_COLOR;
      programDefines['USE_VERTEX_COLOR'] = 1;
    }

    if (primitive.attributeMask & ATTRIB_MASK.TEXCOORD_0) {
      if(material.baseColorTexture) {
        programMask |= PROGRAM_MASK.USE_BASE_COLOR_MAP;
        programDefines['USE_BASE_COLOR_MAP'] = 1;
      }

      if(material.normalTexture && (primitive.attributeMask & ATTRIB_MASK.TANGENT)) {
        programMask |= PROGRAM_MASK.USE_NORMAL_MAP;
        programDefines['USE_NORMAL_MAP'] = 1;
      }

      if(material.metallicRoughnessTexture) {
        programMask |= PROGRAM_MASK.USE_METAL_ROUGH_MAP;
        programDefines['USE_METAL_ROUGH_MAP'] = 1;
      }

      if(material.occlusionTexture) {
        programMask |= PROGRAM_MASK.USE_OCCLUSION;
        programDefines['USE_OCCLUSION'] = 1;
      }

      if(material.emissiveTexture) {
        programMask |= PROGRAM_MASK.USE_EMISSIVE;
        programDefines['USE_EMISSIVE'] = 1;
      }
    }

    if ((!material.metallicRoughnessTexture || !(primitive.attributeMask & ATTRIB_MASK.TEXCOORD_0)) &&
        material.metallicRoughnessFactor[1] == 1.0) {
      programMask |= PROGRAM_MASK.FULLY_ROUGH;
      programDefines['FULLY_ROUGH'] = 1;
    }

    // Check and see if a compatible shader already exists.
    if (this.programs[programMask]) {
      return this.programs[programMask];
    }

    // If no existing compatible shader was found, create a new one.
    let program = new Program(gl, PBR_VS, PBR_FS, ATTRIB_MAP, programDefines);
    this.programs[programMask] = program;
    return program;
  }
}

return GLTF2SceneLoader;
})();
