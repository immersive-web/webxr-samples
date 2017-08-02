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

const GL = WebGLRenderingContext; // For enums

export class TextureSampler {
  constructor() {
    this.min_filter = null;
    this.mag_filter = null;
    this.wrap_s = null;
    this.wrap_t = null;
  }
}

export class Texture {
  constructor() {
    this.sampler = new TextureSampler();
    this.mipmap = true;
    //TODO: Anisotropy
  }

  get format() {
    return GL.RGBA
  }

  get width() {
    return 0;
  }

  get height() {
    return 0;
  }

  get texture_key() {
    return null;
  }
}

export class ImageTexture extends Texture {
  constructor(img) {
    super();

    this._img = img;

    if (img.src && img.complete) {
      if (img.naturalWidth) {
        this._promise = Promise.resolve(this);
      } else {
        this._promise = Promise.reject("Image provided had failed to load.");
      }
    } else {
      this._promise = new Promise((resolve, reject) => {
        img.addEventListener('load', () => resolve(this));
        img.addEventListener('error', reject);
      });
    }
  }

  get format() {
    // TODO: Can be RGB in some cases.
    return GL.RGBA;
  }

  get width() {
    return this._img.width;
  }

  get height() {
    return this._img.height;
  }

  waitForComplete() {
    return this._promise;
  }

  get texture_key() {
    return this._img.src;
  }
}

export class UrlTexture extends ImageTexture {
  constructor(url) {
    let img = new Image();
    super(img);
    img.src = url;
  }
}

export class BlobTexture extends ImageTexture {
  constructor(blob) {
    let img = new Image();
    super(img);
    img.src = window.URL.createObjectURL(blob);
  }
}

let next_data_texture_index = 0;

export class DataTexture extends Texture {
  constructor(data, width, height, format = GL.RGBA, type = GL.UNSIGNED_BYTE) {
    super();

    this._data = data;
    this._width = width;
    this._height = height;
    this._format = format;
    this._type = type;
    this._key = `DATA_${next_data_texture_index}`;
    next_data_texture_index++;
  }

  get format() {
    return this._format;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get texture_key() {
    return this._key;
  }
}

export class ColorTexture extends DataTexture {
  constructor(r, g, b, a) {
    let color_data = new Uint8Array([r*255.0, g*255.0, b*255.0, a*255.0]);
    super(color_data, 1, 1);

    this.mipmap = false;
    this._key = `COLOR_${color_data[0]}_${color_data[1]}_${color_data[2]}_${color_data[3]}`;
  }
}
