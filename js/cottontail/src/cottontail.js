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

import {Node} from './core/node.js';
import {Renderer, createWebGLContext} from './core/renderer.js';
import {UrlTexture} from './core/texture.js';

import {PrimitiveStream} from './geometry/primitive-stream.js';
import {BoxBuilder} from './geometry/box-builder.js';

import {PbrMaterial} from './materials/pbr.js';

import {ButtonNode} from './nodes/button.js';
import {CubeSeaNode} from './nodes/cube-sea.js';
import {Gltf2Node} from './nodes/gltf2.js';
import {SkyboxNode} from './nodes/skybox.js';
import {VideoNode} from './nodes/video.js';

import {WebXRView, Scene} from './scenes/scene.js';

// A very short-term polyfill to address a change in the location of the
// getViewport call. This should dissapear within a month or so.
if (('XRWebGLLayer' in window) && !('getViewport' in XRWebGLLayer.prototype)) {
  XRWebGLLayer.prototype.getViewport = function(view) {
    return view.getViewport(this);
  };
}

export {
  Node,
  Renderer,
  createWebGLContext,
  UrlTexture,

  PrimitiveStream,
  BoxBuilder,

  PbrMaterial,

  ButtonNode,
  CubeSeaNode,
  Gltf2Node,
  SkyboxNode,
  VideoNode,

  WebXRView,
  Scene,
};
