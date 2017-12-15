// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebXRSceneGLTF extends WebXRScene {
  constructor(url) {
    super();

    this.url = url;
    this.scene = null;
    this._loader = null;
  }

  onLoadScene(gl) {
    this._loader = new GLTF2SceneLoader(gl);

    return this._loader.loadFromUrl(this.url).then((scene) => {
      this.scene = scene;
    });
  }

  onDrawViews(gl, timestamp, views) {
    if (!this.scene)
      return;

    let projection_mats = [];
    let view_mats = [];
    let viewports = [];

    for (let view of views) {
      projection_mats.push(view.projection_mat);
      view_mats.push(view.view_mat);
      if (view.viewport) {
        viewports.push(view.viewport);
      }
    }

    this.scene.drawViewports(projection_mats, view_mats, viewports);
  }
}