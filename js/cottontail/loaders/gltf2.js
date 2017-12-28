// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { PbrMaterial } from '../materials/pbr.js'
import { Node, MeshNode } from '../core/node.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'

const GL = WebGLRenderingContext; // For enums

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

/**
 * GLTF2SceneLoader
 * Loads glTF 2.0 scenes into a renderable node tree.
 */

export class GLTF2Loader {
  constructor(renderer) {
    this.renderer = renderer;
    this._gl = renderer._gl;
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
    let gl = this._gl;

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

    let texture_cache = this.renderer.texture_cache;
    if (json.textures) {
      let i = 0;
      for (let texture of json.textures) {
        let image = images[texture.source];
        let imagePromise = image.image(bufferViews);
        let sampler = texture.sampler ? sampler[texture.sampler] : {};
        texture_cache.addTexture(`gltf2_${i}`, imagePromise, sampler);
      }
    }

    let materials = [];
    if (json.materials) {
      for (let material of json.materials) {
        let glMaterial = new PbrMaterial();
        let pbr = material.pbrMetallicRoughness || {};
        // TODO: Handle textures here.
        glMaterial.base_color_factor = new Float32Array(pbr.baseColorFactor || [1, 1, 1, 1]);
        glMaterial.base_color_texture = null;
        glMaterial.metallic_roughness_factor = new Float32Array([
            pbr.metallicFactor || 1.0,
            pbr.roughnessFactor || 1.0]);
        glMaterial.metallic_roughness_texture = null;
        glMaterial.normal_texture = null;
        glMaterial.occlusion_texture = null;
        glMaterial.occlusion_strength = (material.occlusionTexture && material.occlusionTexture.strength) ? material.occlusionTexture.strength : 1.0;
        glMaterial.emissive_factor = new Float32Array(material.emissiveFactor || [0, 0, 0]);
        glMaterial.emissive_texture = null;

        switch(material.alphaMode) {
          case "BLEND":
            glMaterial.state.blend = true;
            break;
          case "MASK":
            // Not really supported.
            glMaterial.state.blend = true;
            break;
          default: // Includes "OPAQUE"
            glMaterial.state.blend = false;
        }

        //glMaterial.alpha_mode = material.alphaMode;
        //glMaterial.alpha_cutoff = material.alphaCutoff;
        glMaterial.state.cull_face = !(material.doubleSided);

        materials.push(glMaterial);
      }
    }

    let accessors = json.accessors;

    let meshes = [];
    for (let mesh of json.meshes) {
      let glMesh = new GLTF2Mesh();
      meshes.push(glMesh);

      for (let primitive of mesh.primitives) {
        let material = null;
        if ('material' in primitive) {
          material = materials[primitive.material];
        } else {
          // Create a "default" material if the primitive has none.
          material = new Material();
        }

        let attributes = [];
        let element_count = 0;
        /*let glPrimitive = new GLTF2Primitive(primitive, material);
        glMesh.primitives.push(glPrimitive);*/

        for (let name in primitive.attributes) {
          let accessor = accessors[primitive.attributes[name]];
          let bufferView = bufferViews[accessor.bufferView];
          element_count = accessor.count;

          let glAttribute = new PrimitiveAttribute(
            name,
            bufferView.renderBuffer(this.renderer, GL.ARRAY_BUFFER),
            getComponentCount(accessor.type),
            accessor.componentType,
            bufferView.byteStride || 0,
            accessor.byteOffset || 0
          );
          glAttribute.normalized = accessor.normalized || false;
          
          attributes.push(glAttribute);
        }

        let glPrimitive = new Primitive(attributes, element_count, primitive.mode);

        if ('indices' in primitive) {
          let accessor = accessors[primitive.indices];
          let bufferView = bufferViews[accessor.bufferView];

          glPrimitive.setIndexBuffer(
            bufferView.renderBuffer(this.renderer, GL.ELEMENT_ARRAY_BUFFER),
            accessor.byteOffset || 0,
            accessor.componentType
          );
          glPrimitive.indexType = accessor.componentType;
          glPrimitive.indexByteOffset = accessor.byteOffset || 0;
          glPrimitive.element_count = accessor.count;
        }

        // After all the attributes have been processed, get a program that is
        // appropriate for both the material and the primitive attributes.
        glMesh.primitives.push(
            this.renderer.createRenderPrimitive(glPrimitive, material));
      }
    }

    let scene_node = new Node();
    let scene = json.scenes[json.scene];
    for (let nodeId of scene.nodes) {
      let node = json.nodes[nodeId];
      scene_node.addNode(
          this.processNodes(node, json.nodes, meshes));
    }

    return scene_node;
  }

  processNodes(node, nodes, meshes) {
    let glNode = null;
    if ('mesh' in node) {
      let mesh = meshes[node.mesh];
      glNode = new MeshNode(mesh.primitives);
    } else {
      glNode = new Node();
    }

    if (node.matrix) {
      glNode.matrix = new Float32Array(node.matrix);
    } else if (node.translation || node.rotation || node.scale) {
      if (node.translation)
        glNode.translation = new Float32Array(node.translation);

      if (node.rotation)
        glNode.rotation = new Float32Array(node.rotation);

      if (node.scale)
        glNode.scale = new Float32Array(node.scale);
    }

    if (node.children) {
      for (let nodeId of node.children) {
        let node = nodes[nodeId];
        glNode.addNode(this.processNodes(node, nodes, meshes));
      }
    }

    return glNode;
  }
}

class GLTF2Mesh {
  constructor() {
    this.primitives = [];
  }
}

class GLTF2BufferView {
  constructor(json, buffers) {
    this.buffer = buffers[json.buffer];
    this.byteOffset = json.byteOffset || 0;
    this.byteLength = json.byteLength || null;
    this.byteStride = json.byteStride;

    this._viewPromise = null;
    this._renderBuffer = null;
  }

  dataView() {
    if (!this._viewPromise) {
      this._viewPromise = this.buffer.arrayBuffer().then((arrayBuffer) => {
        return new DataView(arrayBuffer, this.byteOffset, this.byteLength);
      });
    }
    return this._viewPromise;
  }

  renderBuffer(renderer, target) {
    if (!this._renderBuffer) {
      this._renderBuffer = renderer.createRenderBuffer(target, this.dataView());
    }
    return this._renderBuffer;
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
