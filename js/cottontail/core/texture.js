// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function isPowerOfTwo(n) {
  return (n & (n - 1)) === 0;
}

export class Texture {
  constructor(gl, texture_promise, default_texture) {
    this._gl = gl;
    this._texture_handle = default_texture || null;
    this._promise = texture_promise;
    this._complete = false;
    this._promise.then((handle) => {
      this._complete = true;
      this._texture_handle = handle;
    });
  }

  waitForComplete() {
    return this._promise.then(() => this);
  }

  bind(slot) {
    let gl = this._gl;
    gl.activeTexture(gl.TEXTURE0 + (slot || 0));
    gl.bindTexture(gl.TEXTURE_2D, this._texture_handle);
  }
}

export class TextureCache {
  constructor(gl) {
    this.gl = gl;
    this._textures = {};
  }

  fromUrl(url, sampler) {
    if (url in this._textures) {
      return this._textures[url];
    }

    return this.addTexture(url, new Promise((resolve, reject) => {
      let img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject);
      img.src = url;
    }), sampler);
  }

  fromDataView(key, data_view, mime_type, sampler) {
    if (key in this._textures) {
      return this._textures[key];
    }

    return this.addTexture(key, new Promise((resolve, reject) => {
      let img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject);

      let blob = new Blob([data_view], {type: mime_type});
      img.src = window.URL.createObjectURL(blob);
    }), sampler);
  }

  addTexture(key, image_promise, sampler) {
    let gl = this.gl;
    if (!sampler) {
      sampler = {};
    }

    let promise = image_promise.then((img) => {
      let texture_handle = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture_handle);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      let power_of_two = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
      let min_filter = sampler.minFilter || (power_of_two ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      let wrapS = sampler.wrapS || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      let wrapT = sampler.wrapT || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.magFilter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

      if (min_filter >= gl.NEAREST_MIPMAP_NEAREST &&
          min_filter <= gl.LINEAR_MIPMAP_LINEAR) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }

      return texture_handle;
    });

    let texture = new Texture(gl, promise);
    this._textures[key] = texture;

    return texture;
  }

  getTexture(key, default_texture) {
    if (key in this._textures) {
      return this._textures[key];
    }

    let default_key = `__default_${default_texture}`;
    if (default_key in this._textures) {
      return this._textures[default_key];
    }

    switch (default_texture) {
      case 'white':
        this._textures[default_key] = this.colorTexture(1.0, 1.0, 1.0, 1.0);
        break;
      case 'black':
        this._textures[default_key] = this.colorTexture(0.0, 0.0, 0.0, 1.0);
        break;
      case 'normal':
        this._textures[default_key] = this.colorTexture(0.0, 0.0, 1.0, 1.0);
        break;
      case 'transparent':
        this._textures[default_key] = this.colorTexture(0.0, 0.0, 0.0, 0.0);
        break;
      default: return null;
    }
    return this._textures[default_key];
  }

  colorTexture(r, g, b, a) {
    let gl = this.gl;
    let data = new Uint8Array([r*255.0, g*255.0, b*255.0, a*255.0]);
    let texture_handle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_handle);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return new Texture(gl, Promise.resolve(texture_handle));
  }
}