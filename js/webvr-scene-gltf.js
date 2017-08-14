// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebVRSceneGLTF extends WebVRScene {
  constructor(url) {
    super();

    this.url = url;
    this.scene = null;
    this._loader = null;
  }

  onLoadScene(gl) {
    this._loader = new GLTF2SceneLoader(gl);

    this._loader.loadFromUrl(this.url).then((scene) => {
      this.scene = scene;
    });/*.catch((err) => {
      console.error(`Failed to load glTF 2.0 scene: ${err}`);
      this.scene = null;
    });*/
  }

  onDrawViews(gl, timestamp, projection_mats, view_mats, viewports, eyes) {
    if (!this.scene)
      return;

    this.scene.drawViewports(projection_mats, view_mats, viewports);
  }
}