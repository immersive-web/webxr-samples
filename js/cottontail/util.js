// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Creates a WebGL context and initializes it with some common default state.
export function createWebGLContext(glAttribs) {
  glAttribs = glAttribs || { alpha: false };

  let webglCanvas = document.createElement('canvas');
  let contextTypes = glAttribs.webgl2 ? ['webgl2'] : ['webgl', 'experimental-webgl'];
  let context = null;

  for (let contextType of contextTypes) {
    context = webglCanvas.getContext(contextType, glAttribs);
    if (context)
      break;
  }

  if (!context) {
    let webglType = (glAttribs.webgl2 ? 'WebGL 2' : 'WebGL')
    console.error('This browser does not support ' + webglType + '.');
    return null;
  }

  // Set up a non-black clear color so that we can see if something renders
  // wrong.
  context.clearColor(0.1, 0.2, 0.3, 1.0);

  // Enabled depth testing and face culling
  context.enable(context.DEPTH_TEST);
  context.enable(context.CULL_FACE);

  return context;
}

