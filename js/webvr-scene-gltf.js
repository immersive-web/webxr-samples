// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class WebVRSceneGLTF extends WebVRScene {
  constructor(url) {
    super();

    this.url = url;
    this.scene = null;
    this._loader = null;
    //this._stats_enabled = false;
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

  onDrawView(gl, timestamp, projection_mat, view_mat, eye) {
    if (this.scene) {
      this.scene.draw(projection_mat, view_mat);
    }
  }
}