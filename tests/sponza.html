<!doctype html>
<!--
Copyright 2018 The Immersive Web Community Group

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<html>
  <head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'>
    <meta name='mobile-web-app-capable' content='yes'>
    <meta name='apple-mobile-web-app-capable' content='yes'>
    <link rel='icon' type='image/png' sizes='32x32' href='../favicon-32x32.png'>
    <link rel='icon' type='image/png' sizes='96x96' href='../favicon-96x96.png'>
    <link rel='stylesheet' href='../css/common.css'>

    <title>Sponza</title>
  </head>
  <body>
    <header>
      <details open>
        <summary>Sponza</summary>
        <p>
          Loads a larger scene than other samples for performance testing.
          <a class="back" href="./">Back</a>
        </p>
      </details>
    </header>
    <script type="module">
      import {WebXRSampleApp} from '../js/webxr-sample-app.js';
      import {Gltf2Node} from '../js/render/nodes/gltf2.js';
      import {SkyboxNode} from '../js/render/nodes/skybox.js';
      import {quat} from '../js/render/math/gl-matrix.js';
      import {QueryArgs} from '../js/util/query-args.js';

      // If requested, use the polyfill to provide support for mobile devices
      // and devices which only support WebVR.
      import WebXRPolyfill from '../js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
      if (QueryArgs.getBool('usePolyfill', true)) {
        let polyfill = new WebXRPolyfill();
      }

      // WebXR sample app setup
      class CustomWebXRSampleApp extends WebXRSampleApp {
        onInitRenderer() {
          super.onInitRenderer();

          this.renderer.globalLightDir = [-0.2, -1.0, -0.2];
          this.renderer.globalLightColor = [7.0, 7.0, 8.0];
        }
      };

      let app = new CustomWebXRSampleApp({
        referenceSpace: 'local-floor'
      });
      document.querySelector('header').appendChild(app.xrButton.domElement);

      app.scene.addNode(new SkyboxNode({url: '../media/textures/eilenriede-park-2k.png'}));
      let sponza = new Gltf2Node({url: '../media/gltf/sponza/Sponza.gltf'});

      // Rotate the scene 90deg so that you start looking down the gallery.
      quat.rotateY(sponza.rotation, sponza.rotation, Math.PI / 2.0);
      app.scene.addNode(sponza);
      app.scene.standingStats(true);

      // Start the XR application.
      app.run();
    </script>
  </body>
</html>
