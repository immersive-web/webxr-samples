WebXR Samples Renderer
==========================================
A simple WebGL renderering framework optimised for demonstrating WebXR concepts.

This library does two things well and not much else:

1) Loading and Rendering GLTF 2.0 files.
2) Optimising for WebXR-style rendering.

However it explicitly goes out of it's way to NOT wrap much, if any, WebXR
functionality. This is because arguably it's sole purpose in life is to enable
the WebXR samples, who's sole purpose in life is to provide easy-to-follow code
snippets demonstrating the API use and thus anything this code did to hide the
WebXR API's direct use is counter productive.

The only "third party" dependency is gl-matrix.

Using this renderer for your own projects is very much not recommended, as you will
almost certainly be better served by one of the other more popular frameworks
out there.

Library previously had a build step but all WebXR-enabled browsers support JS
modules, so it turned out to be more of a nusiance than it was worth.
