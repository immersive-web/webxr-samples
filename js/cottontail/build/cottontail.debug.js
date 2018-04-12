/*Copyright 2018 The Immersive Web Community Group

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
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GLTF2Scene = exports.Scene = exports.WebXRView = exports.VideoNode = exports.CubeSea = exports.ButtonNode = exports.PbrMaterial = exports.BoxBuilder = exports.PrimitiveStream = exports.UrlTexture = exports.createWebGLContext = exports.Renderer = exports.Node = undefined;
	
	var _node = __webpack_require__(1);
	
	var _renderer = __webpack_require__(3);
	
	var _texture = __webpack_require__(6);
	
	var _primitiveStream = __webpack_require__(7);
	
	var _boxBuilder = __webpack_require__(9);
	
	var _pbr = __webpack_require__(10);
	
	var _buttonNode = __webpack_require__(11);
	
	var _cubeSea = __webpack_require__(12);
	
	var _video = __webpack_require__(13);
	
	var _scene = __webpack_require__(14);
	
	var _gltf = __webpack_require__(21);
	
	// A very short-term polyfill to address a change in the location of the
	// getViewport call. This should dissapear within a month or so.
	if ('XRWebGLLayer' in window && !('getViewport' in XRWebGLLayer.prototype)) {
	  XRWebGLLayer.prototype.getViewport = function (view) {
	    return view.getViewport(this);
	  };
	} // Copyright 2018 The Immersive Web Community Group
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
	
	exports.Node = _node.Node;
	exports.Renderer = _renderer.Renderer;
	exports.createWebGLContext = _renderer.createWebGLContext;
	exports.UrlTexture = _texture.UrlTexture;
	exports.PrimitiveStream = _primitiveStream.PrimitiveStream;
	exports.BoxBuilder = _boxBuilder.BoxBuilder;
	exports.PbrMaterial = _pbr.PbrMaterial;
	exports.ButtonNode = _buttonNode.ButtonNode;
	exports.CubeSea = _cubeSea.CubeSea;
	exports.VideoNode = _video.VideoNode;
	exports.WebXRView = _scene.WebXRView;
	exports.Scene = _scene.Scene;
	exports.GLTF2Scene = _gltf.GLTF2Scene;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Node = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright 2018 The Immersive Web Community Group
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
	
	var _ray = __webpack_require__(2);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var DEFAULT_TRANSLATION = new Float32Array([0, 0, 0]);
	var DEFAULT_ROTATION = new Float32Array([0, 0, 0, 1]);
	var DEFAULT_SCALE = new Float32Array([1, 1, 1]);
	
	var tmp_ray_matrix = mat4.create();
	var tmp_ray_origin = vec3.create();
	
	var Node = exports.Node = function () {
	  function Node() {
	    _classCallCheck(this, Node);
	
	    this.name = null; // Only for debugging
	    this.children = [];
	    this.parent = null;
	    this.visible = true;
	    this.selectable = false;
	
	    this._matrix = null;
	
	    this._dirty_trs = false;
	    this._translation = null;
	    this._rotation = null;
	    this._scale = null;
	
	    this._dirty_world_matrix = false;
	    this._world_matrix = null;
	
	    this._active_frame_id = -1;
	    this._hover_frame_id = -1;
	    this._render_primitives = null;
	    this._renderer = null;
	
	    this._select_handler = null;
	  }
	
	  _createClass(Node, [{
	    key: '_setRenderer',
	    value: function _setRenderer(renderer) {
	      if (this._renderer == renderer) return;
	
	      if (this._renderer) {
	        // Changing the renderer removes any previously attached renderPrimitives
	        // from a different renderer.
	        this.clearRenderPrimitives();
	      }
	
	      this._renderer = renderer;
	      if (renderer) {
	        this.onRendererChanged(renderer);
	
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	          for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var child = _step.value;
	
	            child._setRenderer(renderer);
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	      }
	    }
	  }, {
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {}
	    // Override in other node types to respond to changes in the renderer.
	
	
	    // Create a clone of this node and all of it's children. Does not duplicate
	    // RenderPrimitives, the cloned nodes will be treated as new instances of the
	    // geometry.
	
	  }, {
	    key: 'clone',
	    value: function clone() {
	      var clone_node = new Node();
	      clone_node.name = this.name;
	      clone_node.visible = this.visible;
	      clone_node._renderer = this._renderer;
	
	      clone_node._dirty_trs = this._dirty_trs;
	
	      if (this._translation) {
	        clone_node._translation = vec3.create();
	        vec3.copy(clone_node._translation, this._translation);
	      }
	
	      if (this._rotation) {
	        clone_node._rotation = quat.create();
	        quat.copy(clone_node._rotation, this._rotation);
	      }
	
	      if (this._scale) {
	        clone_node._scale = vec3.create();
	        vec3.copy(clone_node._scale, this._scale);
	      }
	
	      // Only copy the matrices if they're not already dirty.
	      if (!clone_node._dirty_trs && this._matrix) {
	        clone_node._matrix = mat4.create();
	        mat4.copy(clone_node._matrix, this._matrix);
	      }
	
	      clone_node._dirty_world_matrix = this._dirty_world_matrix;
	      if (!clone_node._dirty_world_matrix && this._world_matrix) {
	        clone_node._world_matrix = mat4.create();
	        mat4.copy(clone_node._world_matrix, this._world_matrix);
	      }
	
	      if (this._render_primitives) {
	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;
	
	        try {
	          for (var _iterator2 = this._render_primitives[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var primitive = _step2.value;
	
	            clone_node.addRenderPrimitive(primitive);
	          }
	        } catch (err) {
	          _didIteratorError2 = true;
	          _iteratorError2 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	              _iterator2.return();
	            }
	          } finally {
	            if (_didIteratorError2) {
	              throw _iteratorError2;
	            }
	          }
	        }
	      }
	
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;
	
	      try {
	        for (var _iterator3 = this.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var child = _step3.value;
	
	          clone_node.addNode(child.clone());
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	
	      return clone_node;
	    }
	  }, {
	    key: 'markActive',
	    value: function markActive(frame_id) {
	      if (this.visible && this._render_primitives) {
	        this._active_frame_id = frame_id;
	        var _iteratorNormalCompletion4 = true;
	        var _didIteratorError4 = false;
	        var _iteratorError4 = undefined;
	
	        try {
	          for (var _iterator4 = this._render_primitives[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var primitive = _step4.value;
	
	            primitive.markActive(frame_id);
	          }
	        } catch (err) {
	          _didIteratorError4 = true;
	          _iteratorError4 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	              _iterator4.return();
	            }
	          } finally {
	            if (_didIteratorError4) {
	              throw _iteratorError4;
	            }
	          }
	        }
	      }
	
	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;
	
	      try {
	        for (var _iterator5 = this.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          var child = _step5.value;
	
	          if (child.visible) {
	            child.markActive(frame_id);
	          }
	        }
	      } catch (err) {
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion5 && _iterator5.return) {
	            _iterator5.return();
	          }
	        } finally {
	          if (_didIteratorError5) {
	            throw _iteratorError5;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'addNode',
	    value: function addNode(value) {
	      if (!value || value.parent == this) {
	        return;
	      }
	
	      if (value.parent) {
	        value.parent.removeNode(value);
	      }
	      value.parent = this;
	
	      this.children.push(value);
	
	      if (this._renderer) {
	        value._setRenderer(this._renderer);
	      }
	    }
	  }, {
	    key: 'removeNode',
	    value: function removeNode(value) {
	      var i = this.children.indexOf(value);
	      if (i > -1) {
	        this.children.splice(i, 1);
	        value.parent = null;
	      }
	    }
	  }, {
	    key: 'clearNodes',
	    value: function clearNodes() {
	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;
	
	      try {
	        for (var _iterator6 = this.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var child = _step6.value;
	
	          child.parent = null;
	        }
	      } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion6 && _iterator6.return) {
	            _iterator6.return();
	          }
	        } finally {
	          if (_didIteratorError6) {
	            throw _iteratorError6;
	          }
	        }
	      }
	
	      this.children = [];
	    }
	  }, {
	    key: 'setMatrixDirty',
	    value: function setMatrixDirty() {
	      if (!this._dirty_world_matrix) {
	        this._dirty_world_matrix = true;
	        var _iteratorNormalCompletion7 = true;
	        var _didIteratorError7 = false;
	        var _iteratorError7 = undefined;
	
	        try {
	          for (var _iterator7 = this.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	            var child = _step7.value;
	
	            child.setMatrixDirty();
	          }
	        } catch (err) {
	          _didIteratorError7 = true;
	          _iteratorError7 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion7 && _iterator7.return) {
	              _iterator7.return();
	            }
	          } finally {
	            if (_didIteratorError7) {
	              throw _iteratorError7;
	            }
	          }
	        }
	      }
	    }
	  }, {
	    key: '_updateLocalMatrix',
	    value: function _updateLocalMatrix() {
	      if (!this._matrix) {
	        this._matrix = mat4.create();
	      }
	
	      if (this._dirty_trs) {
	        this._dirty_trs = false;
	        mat4.fromRotationTranslationScale(this._matrix, this._rotation || DEFAULT_ROTATION, this._translation || DEFAULT_TRANSLATION, this._scale || DEFAULT_SCALE);
	      }
	
	      return this._matrix;
	    }
	  }, {
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      var _this = this;
	
	      var child_promises = [];
	      var _iteratorNormalCompletion8 = true;
	      var _didIteratorError8 = false;
	      var _iteratorError8 = undefined;
	
	      try {
	        for (var _iterator8 = this.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	          var child = _step8.value;
	
	          child_promises.push(child.waitForComplete());
	        }
	      } catch (err) {
	        _didIteratorError8 = true;
	        _iteratorError8 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion8 && _iterator8.return) {
	            _iterator8.return();
	          }
	        } finally {
	          if (_didIteratorError8) {
	            throw _iteratorError8;
	          }
	        }
	      }
	
	      if (this._render_primitives) {
	        var _iteratorNormalCompletion9 = true;
	        var _didIteratorError9 = false;
	        var _iteratorError9 = undefined;
	
	        try {
	          for (var _iterator9 = this._render_primitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	            var primitive = _step9.value;
	
	            child_promises.push(primitive.waitForComplete());
	          }
	        } catch (err) {
	          _didIteratorError9 = true;
	          _iteratorError9 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion9 && _iterator9.return) {
	              _iterator9.return();
	            }
	          } finally {
	            if (_didIteratorError9) {
	              throw _iteratorError9;
	            }
	          }
	        }
	      }
	      return Promise.all(child_promises).then(function () {
	        return _this;
	      });
	    }
	  }, {
	    key: 'addRenderPrimitive',
	    value: function addRenderPrimitive(primitive) {
	      if (!this._render_primitives) this._render_primitives = [primitive];else this._render_primitives.push(primitive);
	      primitive._instances.push(this);
	    }
	  }, {
	    key: 'removeRenderPrimitive',
	    value: function removeRenderPrimitive(primitive) {
	      if (!this._render_primitives) return;
	
	      var index = this._render_primitives._instances.indexOf(primitive);
	      if (index > -1) {
	        this._render_primitives._instances.splice(index, 1);
	
	        index = primitive._instances.indexOf(this);
	        if (index > -1) {
	          primitive._instances.splice(index, 1);
	        }
	
	        if (!this._render_primitives.length) this._render_primitives = null;
	      }
	    }
	  }, {
	    key: 'clearRenderPrimitives',
	    value: function clearRenderPrimitives() {
	      if (this._render_primitives) {
	        var _iteratorNormalCompletion10 = true;
	        var _didIteratorError10 = false;
	        var _iteratorError10 = undefined;
	
	        try {
	          for (var _iterator10 = this._render_primitives[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	            var primitive = _step10.value;
	
	            var index = primitive._instances.indexOf(this);
	            if (index > -1) {
	              primitive._instances.splice(index, 1);
	            }
	          }
	        } catch (err) {
	          _didIteratorError10 = true;
	          _iteratorError10 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion10 && _iterator10.return) {
	              _iterator10.return();
	            }
	          } finally {
	            if (_didIteratorError10) {
	              throw _iteratorError10;
	            }
	          }
	        }
	
	        this._render_primitives = null;
	      }
	    }
	  }, {
	    key: '_hitTestSelectableNode',
	    value: function _hitTestSelectableNode(ray_matrix) {
	      if (this._render_primitives) {
	        var ray = null;
	        var _iteratorNormalCompletion11 = true;
	        var _didIteratorError11 = false;
	        var _iteratorError11 = undefined;
	
	        try {
	          for (var _iterator11 = this._render_primitives[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	            var primitive = _step11.value;
	
	            if (primitive._min) {
	              if (!ray) {
	                mat4.invert(tmp_ray_matrix, this.world_matrix);
	                mat4.multiply(tmp_ray_matrix, tmp_ray_matrix, ray_matrix);
	                ray = new _ray.Ray(tmp_ray_matrix);
	              }
	              var intersection = ray.intersectsAABB(primitive._min, primitive._max);
	              if (intersection) {
	                vec3.transformMat4(intersection, intersection, this.world_matrix);
	                return intersection;
	              }
	            }
	          }
	        } catch (err) {
	          _didIteratorError11 = true;
	          _iteratorError11 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion11 && _iterator11.return) {
	              _iterator11.return();
	            }
	          } finally {
	            if (_didIteratorError11) {
	              throw _iteratorError11;
	            }
	          }
	        }
	      }
	      var _iteratorNormalCompletion12 = true;
	      var _didIteratorError12 = false;
	      var _iteratorError12 = undefined;
	
	      try {
	        for (var _iterator12 = this.children[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	          var child = _step12.value;
	
	          var _intersection = child._hitTestSelectableNode(ray_matrix);
	          if (_intersection) {
	            return _intersection;
	          }
	        }
	      } catch (err) {
	        _didIteratorError12 = true;
	        _iteratorError12 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion12 && _iterator12.return) {
	            _iterator12.return();
	          }
	        } finally {
	          if (_didIteratorError12) {
	            throw _iteratorError12;
	          }
	        }
	      }
	
	      return null;
	    }
	  }, {
	    key: 'hitTest',
	    value: function hitTest(ray_matrix) {
	      var ray_origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	      if (!ray_origin) {
	        ray_origin = tmp_ray_origin;
	        vec3.set(ray_origin, 0, 0, 0);
	        vec3.transformMat4(ray_origin, ray_origin, ray_matrix);
	      }
	
	      if (this.selectable && this.visible) {
	        var intersection = this._hitTestSelectableNode(ray_matrix);
	        if (intersection) {
	          return {
	            node: this,
	            intersection: intersection,
	            distance: vec3.distance(ray_origin, intersection)
	          };
	        }
	        return null;
	      }
	
	      var result = null;
	      var _iteratorNormalCompletion13 = true;
	      var _didIteratorError13 = false;
	      var _iteratorError13 = undefined;
	
	      try {
	        for (var _iterator13 = this.children[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	          var child = _step13.value;
	
	          var child_result = child.hitTest(ray_matrix, ray_origin);
	          if (child_result) {
	            if (!result || result.distance > child_result.distance) {
	              result = child_result;
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError13 = true;
	        _iteratorError13 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion13 && _iterator13.return) {
	            _iterator13.return();
	          }
	        } finally {
	          if (_didIteratorError13) {
	            throw _iteratorError13;
	          }
	        }
	      }
	
	      return result;
	    }
	  }, {
	    key: 'onSelect',
	    value: function onSelect(value) {
	      this._select_handler = value;
	    }
	  }, {
	    key: 'handleSelect',
	
	
	    // Called when a selectable node is selected.
	    value: function handleSelect() {
	      if (this._select_handler) this._select_handler();
	    }
	
	    // Called when a selectable element is pointed at.
	
	  }, {
	    key: 'onHoverStart',
	    value: function onHoverStart() {}
	
	    // Called when a selectable element is no longer pointed at.
	
	  }, {
	    key: 'onHoverEnd',
	    value: function onHoverEnd() {}
	  }, {
	    key: '_update',
	    value: function _update(timestamp, frame_delta) {
	      this.onUpdate(timestamp, frame_delta);
	
	      var _iteratorNormalCompletion14 = true;
	      var _didIteratorError14 = false;
	      var _iteratorError14 = undefined;
	
	      try {
	        for (var _iterator14 = this.children[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
	          var child = _step14.value;
	
	          child._update(timestamp, frame_delta);
	        }
	      } catch (err) {
	        _didIteratorError14 = true;
	        _iteratorError14 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion14 && _iterator14.return) {
	            _iterator14.return();
	          }
	        } finally {
	          if (_didIteratorError14) {
	            throw _iteratorError14;
	          }
	        }
	      }
	    }
	
	    // Called every frame so that the nodes can animate themselves
	
	  }, {
	    key: 'onUpdate',
	    value: function onUpdate(timestamp, frame_delta) {}
	  }, {
	    key: 'matrix',
	    set: function set(value) {
	      this._matrix = value;
	      this.setMatrixDirty();
	      this._dirty_trs = false;
	      this._translation = null;
	      this._rotation = null;
	      this._scale = null;
	    },
	    get: function get() {
	      this.setMatrixDirty();
	
	      return this._updateLocalMatrix();
	    }
	  }, {
	    key: 'world_matrix',
	    get: function get() {
	      if (!this._world_matrix) {
	        this._dirty_world_matrix = true;
	        this._world_matrix = mat4.create();
	      }
	
	      if (this._dirty_world_matrix || this._dirty_trs) {
	        if (this.parent) {
	          // TODO: Some optimizations that could be done here if the node matrix
	          // is an identity matrix.
	          mat4.mul(this._world_matrix, this.parent.world_matrix, this._updateLocalMatrix());
	        } else {
	          mat4.copy(this._world_matrix, this._updateLocalMatrix());
	        }
	        this._dirty_world_matrix = false;
	      }
	
	      return this._world_matrix;
	    }
	
	    // TODO: Decompose matrix when fetching these?
	
	  }, {
	    key: 'translation',
	    set: function set(value) {
	      if (value != null) {
	        this._dirty_trs = true;
	        this.setMatrixDirty();
	      }
	      this._translation = value;
	    },
	    get: function get() {
	      this._dirty_trs = true;
	      this.setMatrixDirty();
	      if (!this._translation) {
	        this._translation = vec3.clone(DEFAULT_TRANSLATION);
	      }
	      return this._translation;
	    }
	  }, {
	    key: 'rotation',
	    set: function set(value) {
	      if (value != null) {
	        this._dirty_trs = true;
	        this.setMatrixDirty();
	      }
	      this._rotation = value;
	    },
	    get: function get() {
	      this._dirty_trs = true;
	      this.setMatrixDirty();
	      if (!this._rotation) {
	        this._rotation = quat.clone(DEFAULT_ROTATION);
	      }
	      return this._rotation;
	    }
	  }, {
	    key: 'scale',
	    set: function set(value) {
	      if (value != null) {
	        this._dirty_trs = true;
	        this.setMatrixDirty();
	      }
	      this._scale = value;
	    },
	    get: function get() {
	      this._dirty_trs = true;
	      this.setMatrixDirty();
	      if (!this._scale) {
	        this._scale = vec3.clone(DEFAULT_SCALE);
	      }
	      return this._scale;
	    }
	  }, {
	    key: 'renderPrimitives',
	    get: function get() {
	      return this._render_primitives;
	    }
	  }, {
	    key: 'selectHandler',
	    get: function get() {
	      return this._select_handler;
	    }
	  }]);

	  return Node;
	}();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var normal_mat = mat3.create();
	
	var RAY_INTERSECTION_OFFSET = 0.02;
	
	var Ray = exports.Ray = function () {
	  function Ray() {
	    var matrix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	    _classCallCheck(this, Ray);
	
	    this.origin = vec3.create();
	
	    this._dir = vec3.create();
	    this._dir[2] = -1.0;
	
	    if (matrix) {
	      vec3.transformMat4(this.origin, this.origin, matrix);
	      mat3.fromMat4(normal_mat, matrix);
	      vec3.transformMat3(this._dir, this._dir, normal_mat);
	    }
	
	    // To force the inverse and sign calculations.
	    this.dir = this._dir;
	  }
	
	  _createClass(Ray, [{
	    key: "intersectsAABB",
	
	
	    // Borrowed from:
	    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
	    value: function intersectsAABB(min, max) {
	      var r = this;
	
	      var bounds = [min, max];
	
	      var tmin = (bounds[r.sign[0]][0] - r.origin[0]) * r.inv_dir[0];
	      var tmax = (bounds[1 - r.sign[0]][0] - r.origin[0]) * r.inv_dir[0];
	      var tymin = (bounds[r.sign[1]][1] - r.origin[1]) * r.inv_dir[1];
	      var tymax = (bounds[1 - r.sign[1]][1] - r.origin[1]) * r.inv_dir[1];
	
	      if (tmin > tymax || tymin > tmax) return null;
	      if (tymin > tmin) tmin = tymin;
	      if (tymax < tmax) tmax = tymax;
	
	      var tzmin = (bounds[r.sign[2]][2] - r.origin[2]) * r.inv_dir[2];
	      var tzmax = (bounds[1 - r.sign[2]][2] - r.origin[2]) * r.inv_dir[2];
	
	      if (tmin > tzmax || tzmin > tmax) return null;
	      if (tzmin > tmin) tmin = tzmin;
	      if (tzmax < tmax) tmax = tzmax;
	
	      var t = -1;
	      if (tmin > 0 && tmax > 0) {
	        t = Math.min(tmin, tmax);
	      } else if (tmin > 0) {
	        t = tmin;
	      } else if (tmax > 0) {
	        t = tmax;
	      } else {
	        // Intersection is behind the ray origin.
	        return null;
	      }
	
	      // Push ray intersection point back along the ray a bit so that cursors
	      // don't accidentally intersect with the hit surface.
	      t -= RAY_INTERSECTION_OFFSET;
	
	      // Return the point where the ray first intersected with the AABB.
	      var intersection_point = vec3.clone(this._dir);
	      vec3.scale(intersection_point, intersection_point, t);
	      vec3.add(intersection_point, intersection_point, this.origin);
	      return intersection_point;
	    }
	  }, {
	    key: "dir",
	    get: function get() {
	      return this._dir;
	    },
	    set: function set(value) {
	      this._dir = vec3.copy(this._dir, value);
	      vec3.normalize(this._dir, this._dir);
	
	      this.inv_dir = vec3.fromValues(1.0 / this._dir[0], 1.0 / this._dir[1], 1.0 / this._dir[2]);
	
	      this.sign = [this.inv_dir[0] < 0 ? 1 : 0, this.inv_dir[1] < 0 ? 1 : 0, this.inv_dir[2] < 0 ? 1 : 0];
	    }
	  }]);

	  return Ray;
	}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Renderer = exports.RenderView = exports.ATTRIB_MASK = exports.ATTRIB = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright 2018 The Immersive Web Community Group
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
	
	exports.createWebGLContext = createWebGLContext;
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _program = __webpack_require__(5);
	
	var _texture = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ATTRIB = exports.ATTRIB = {
	  POSITION: 1,
	  NORMAL: 2,
	  TANGENT: 3,
	  TEXCOORD_0: 4,
	  TEXCOORD_1: 5,
	  COLOR_0: 6
	};
	
	var ATTRIB_MASK = exports.ATTRIB_MASK = {
	  POSITION: 0x0001,
	  NORMAL: 0x0002,
	  TANGENT: 0x0004,
	  TEXCOORD_0: 0x0008,
	  TEXCOORD_1: 0x0010,
	  COLOR_0: 0x0020
	};
	
	var DEF_LIGHT_DIR = new Float32Array([-0.1, -1.0, -0.2]);
	var DEF_LIGHT_COLOR = new Float32Array([1.0, 1.0, 0.9]);
	
	var PRECISION_REGEX = new RegExp('precision (lowp|mediump|highp) float;');
	
	var VERTEX_SHADER_SINGLE_ENTRY = '\nuniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;\n\nvoid main() {\n  gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);\n}\n';
	
	var VERTEX_SHADER_MULTI_ENTRY = '\n#ERROR Multiview rendering is not implemented\nvoid main() {\n  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n}\n';
	
	var FRAGMENT_SHADER_ENTRY = '\nvoid main() {\n  gl_FragColor = fragment_main();\n}\n';
	
	function isPowerOfTwo(n) {
	  return (n & n - 1) === 0;
	}
	
	// Creates a WebGL context and initializes it with some common default state.
	function createWebGLContext(glAttribs) {
	  glAttribs = glAttribs || { alpha: false };
	
	  var webglCanvas = document.createElement('canvas');
	  var contextTypes = glAttribs.webgl2 ? ['webgl2'] : ['webgl', 'experimental-webgl'];
	  var context = null;
	
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = contextTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var contextType = _step.value;
	
	      context = webglCanvas.getContext(contextType, glAttribs);
	      if (context) break;
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	
	  if (!context) {
	    var webglType = glAttribs.webgl2 ? 'WebGL 2' : 'WebGL';
	    console.error('This browser does not support ' + webglType + '.');
	    return null;
	  }
	
	  return context;
	}
	
	var RenderView = exports.RenderView = function () {
	  function RenderView(projection_matrix, view_matrix) {
	    var viewport = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	    var eye = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'left';
	
	    _classCallCheck(this, RenderView);
	
	    this.projection_matrix = projection_matrix;
	    this.view_matrix = view_matrix;
	    this.viewport = viewport;
	    // If an eye isn't given the left eye is assumed.
	    this._eye = eye;
	    this._eye_index = eye == 'left' ? 0 : 1;
	  }
	
	  _createClass(RenderView, [{
	    key: 'eye',
	    get: function get() {
	      return this._eye;
	    },
	    set: function set(value) {
	      this._eye = value;
	      this._eye_index = value == 'left' ? 0 : 1;
	    }
	  }, {
	    key: 'eye_index',
	    get: function get() {
	      return this._eye_index;
	    }
	  }]);
	
	  return RenderView;
	}();
	
	var RenderBuffer = function () {
	  function RenderBuffer(target, usage, buffer) {
	    var _this = this;
	
	    var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	
	    _classCallCheck(this, RenderBuffer);
	
	    this._target = target;
	    this._usage = usage;
	    this._length = length;
	    if (buffer instanceof Promise) {
	      this._buffer = null;
	      this._promise = buffer.then(function (buffer) {
	        _this._buffer = buffer;
	        return _this;
	      });
	    } else {
	      this._buffer = buffer;
	      this._promise = Promise.resolve(this);
	    }
	  }
	
	  _createClass(RenderBuffer, [{
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      return this._promise;
	    }
	  }]);
	
	  return RenderBuffer;
	}();
	
	var RenderPrimitiveAttribute = function RenderPrimitiveAttribute(primitive_attribute) {
	  _classCallCheck(this, RenderPrimitiveAttribute);
	
	  this._attrib_index = ATTRIB[primitive_attribute.name];
	  this._component_count = primitive_attribute.component_count;
	  this._component_type = primitive_attribute.component_type;
	  this._stride = primitive_attribute.stride;
	  this._byte_offset = primitive_attribute.byte_offset;
	  this._normalized = primitive_attribute.normalized;
	};
	
	var RenderPrimitiveAttributeBuffer = function RenderPrimitiveAttributeBuffer(buffer) {
	  _classCallCheck(this, RenderPrimitiveAttributeBuffer);
	
	  this._buffer = buffer;
	  this._attributes = [];
	};
	
	var RenderPrimitive = function () {
	  function RenderPrimitive(primitive) {
	    _classCallCheck(this, RenderPrimitive);
	
	    this._instances = [];
	    this._material = null;
	
	    this.setPrimitive(primitive);
	  }
	
	  _createClass(RenderPrimitive, [{
	    key: 'setPrimitive',
	    value: function setPrimitive(primitive) {
	      this._mode = primitive.mode;
	      this._element_count = primitive.element_count;
	      this._promise = null;
	      this._vao = null;
	      this._complete = false;
	      this._attribute_buffers = [];
	      this._attribute_mask = 0;
	
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = primitive.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var attribute = _step2.value;
	
	          this._attribute_mask |= ATTRIB_MASK[attribute.name];
	          var render_attribute = new RenderPrimitiveAttribute(attribute);
	          var found_buffer = false;
	          var _iteratorNormalCompletion3 = true;
	          var _didIteratorError3 = false;
	          var _iteratorError3 = undefined;
	
	          try {
	            for (var _iterator3 = this._attribute_buffers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	              var attribute_buffer = _step3.value;
	
	              if (attribute_buffer._buffer == attribute.buffer) {
	                attribute_buffer._attributes.push(render_attribute);
	                found_buffer = true;
	                break;
	              }
	            }
	          } catch (err) {
	            _didIteratorError3 = true;
	            _iteratorError3 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                _iterator3.return();
	              }
	            } finally {
	              if (_didIteratorError3) {
	                throw _iteratorError3;
	              }
	            }
	          }
	
	          if (!found_buffer) {
	            var _attribute_buffer = new RenderPrimitiveAttributeBuffer(attribute.buffer);
	            _attribute_buffer._attributes.push(render_attribute);
	            this._attribute_buffers.push(_attribute_buffer);
	          }
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      this._index_buffer = null;
	      this._index_byte_offset = 0;
	      this._index_type = 0;
	
	      if (primitive.index_buffer) {
	        this._index_byte_offset = primitive.index_byte_offset;
	        this._index_type = primitive.index_type;
	        this._index_buffer = primitive.index_buffer;
	      }
	
	      if (primitive._min) {
	        this._min = vec3.clone(primitive._min);
	        this._max = vec3.clone(primitive._max);
	      } else {
	        this._min = null;
	        this._max = null;
	      }
	
	      if (this._material != null) {
	        this.waitForComplete(); // To flip the _complete flag.
	      }
	    }
	  }, {
	    key: 'setRenderMaterial',
	    value: function setRenderMaterial(material) {
	      this._material = material;
	      this._promise = null;
	      this._complete = false;
	
	      if (this._material != null) {
	        this.waitForComplete(); // To flip the _complete flag.
	      }
	    }
	  }, {
	    key: 'markActive',
	    value: function markActive(frame_id) {
	      if (this._complete) {
	        this._active_frame_id = frame_id;
	
	        if (this.material) {
	          this.material.markActive(frame_id);
	        }
	
	        if (this.program) {
	          this.program.markActive(frame_id);
	        }
	      }
	    }
	  }, {
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      var _this2 = this;
	
	      if (!this._promise) {
	        if (!this._material) {
	          return Promise.reject("RenderPrimitive does not have a material");
	        }
	
	        var completion_promises = [];
	        completion_promises.push(this._material.waitForComplete());
	
	        var _iteratorNormalCompletion4 = true;
	        var _didIteratorError4 = false;
	        var _iteratorError4 = undefined;
	
	        try {
	          for (var _iterator4 = this._attribute_buffers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var attribute_buffer = _step4.value;
	
	            if (!attribute_buffer._buffer._buffer) {
	              completion_promises.push(attribute_buffer._buffer._promise);
	            }
	          }
	        } catch (err) {
	          _didIteratorError4 = true;
	          _iteratorError4 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	              _iterator4.return();
	            }
	          } finally {
	            if (_didIteratorError4) {
	              throw _iteratorError4;
	            }
	          }
	        }
	
	        if (this._index_buffer && !this._index_buffer._buffer) {
	          completion_promises.push(this._index_buffer._promise);
	        }
	
	        this._promise = Promise.all(completion_promises).then(function () {
	          _this2._complete = true;
	          return _this2;
	        });
	      }
	      return this._promise;
	    }
	  }, {
	    key: 'samplers',
	    get: function get() {
	      return this._material._sampler_dictionary;
	    }
	  }, {
	    key: 'uniforms',
	    get: function get() {
	      return this._material._uniform_dictionary;
	    }
	  }]);
	
	  return RenderPrimitive;
	}();
	
	var inverse_matrix = mat4.create();
	
	function setCap(gl, gl_enum, cap, prev_state, state) {
	  var change = (state & cap) - (prev_state & cap);
	  if (!change) return;
	
	  if (change > 0) {
	    gl.enable(gl_enum);
	  } else {
	    gl.disable(gl_enum);
	  }
	}
	
	var RenderMaterialSampler = function () {
	  function RenderMaterialSampler(renderer, material_sampler, index) {
	    _classCallCheck(this, RenderMaterialSampler);
	
	    this._renderer = renderer;
	    this._uniform_name = material_sampler._uniform_name;
	    this._texture = renderer._getRenderTexture(material_sampler._texture);
	    this._index = index;
	  }
	
	  _createClass(RenderMaterialSampler, [{
	    key: 'texture',
	    set: function set(value) {
	      this._texture = this._renderer._getRenderTexture(value);
	    }
	  }]);
	
	  return RenderMaterialSampler;
	}();
	
	var RenderMaterialUniform = function () {
	  function RenderMaterialUniform(material_uniform) {
	    _classCallCheck(this, RenderMaterialUniform);
	
	    this._uniform_name = material_uniform._uniform_name;
	    this._uniform = null;
	    this._length = material_uniform._length;
	    if (material_uniform._value instanceof Array) {
	      this._value = new Float32Array(material_uniform._value);
	    } else {
	      this._value = new Float32Array([material_uniform._value]);
	    }
	  }
	
	  _createClass(RenderMaterialUniform, [{
	    key: 'value',
	    set: function set(value) {
	      if (this._value.length == 1) {
	        this._value[0] = value;
	      } else {
	        for (var i = 0; i < this._value.length; ++i) {
	          this._value[i] = value[i];
	        }
	      }
	    }
	  }]);
	
	  return RenderMaterialUniform;
	}();
	
	var RenderMaterial = function () {
	  function RenderMaterial(renderer, material, program) {
	    _classCallCheck(this, RenderMaterial);
	
	    this._program = program;
	    this._state = material.state._state;
	
	    this._sampler_dictionary = {};
	    this._samplers = [];
	    for (var i = 0; i < material._samplers.length; ++i) {
	      var render_sampler = new RenderMaterialSampler(renderer, material._samplers[i], i);
	      this._samplers.push(render_sampler);
	      this._sampler_dictionary[render_sampler._uniform_name] = render_sampler;
	    }
	
	    this._uniform_dictionary = {};
	    this._uniforms = [];
	    var _iteratorNormalCompletion5 = true;
	    var _didIteratorError5 = false;
	    var _iteratorError5 = undefined;
	
	    try {
	      for (var _iterator5 = material._uniforms[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	        var uniform = _step5.value;
	
	        var render_uniform = new RenderMaterialUniform(uniform);
	        this._uniforms.push(render_uniform);
	        this._uniform_dictionary[render_uniform._uniform_name] = render_uniform;
	      }
	    } catch (err) {
	      _didIteratorError5 = true;
	      _iteratorError5 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion5 && _iterator5.return) {
	          _iterator5.return();
	        }
	      } finally {
	        if (_didIteratorError5) {
	          throw _iteratorError5;
	        }
	      }
	    }
	
	    this._complete_promise = null;
	    this._first_bind = true;
	
	    this._render_order = material.render_order;
	    if (this._render_order == _material.RENDER_ORDER.DEFAULT) {
	      if (this._state & _material.CAP.BLEND) {
	        this._render_order = _material.RENDER_ORDER.TRANSPARENT;
	      } else {
	        this._render_order = _material.RENDER_ORDER.OPAQUE;
	      }
	    }
	  }
	
	  _createClass(RenderMaterial, [{
	    key: 'bind',
	    value: function bind(gl) {
	      // First time we do a binding, cache the uniform locations and remove
	      // unused uniforms from the list.
	      if (this._first_bind) {
	        for (var i = 0; i < this._samplers.length;) {
	          var sampler = this._samplers[i];
	          if (!this._program.uniform[sampler._uniform_name]) {
	            this._samplers.splice(i, 1);
	            continue;
	          }
	          ++i;
	        }
	
	        for (var _i = 0; _i < this._uniforms.length;) {
	          var uniform = this._uniforms[_i];
	          uniform._uniform = this._program.uniform[uniform._uniform_name];
	          if (!uniform._uniform) {
	            this._uniforms.splice(_i, 1);
	            continue;
	          }
	          ++_i;
	        }
	        this._first_bind = false;
	      }
	
	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;
	
	      try {
	        for (var _iterator6 = this._samplers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var _sampler = _step6.value;
	
	          gl.activeTexture(gl.TEXTURE0 + _sampler._index);
	          if (_sampler._texture) {
	            //sampler._texture.bind(i);
	            gl.bindTexture(gl.TEXTURE_2D, _sampler._texture);
	          } else {
	            gl.bindTexture(gl.TEXTURE_2D, null);
	          }
	        }
	      } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion6 && _iterator6.return) {
	            _iterator6.return();
	          }
	        } finally {
	          if (_didIteratorError6) {
	            throw _iteratorError6;
	          }
	        }
	      }
	
	      var _iteratorNormalCompletion7 = true;
	      var _didIteratorError7 = false;
	      var _iteratorError7 = undefined;
	
	      try {
	        for (var _iterator7 = this._uniforms[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	          var _uniform = _step7.value;
	
	          switch (_uniform._length) {
	            case 1:
	              gl.uniform1fv(_uniform._uniform, _uniform._value);break;
	            case 2:
	              gl.uniform2fv(_uniform._uniform, _uniform._value);break;
	            case 3:
	              gl.uniform3fv(_uniform._uniform, _uniform._value);break;
	            case 4:
	              gl.uniform4fv(_uniform._uniform, _uniform._value);break;
	          }
	        }
	      } catch (err) {
	        _didIteratorError7 = true;
	        _iteratorError7 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion7 && _iterator7.return) {
	            _iterator7.return();
	          }
	        } finally {
	          if (_didIteratorError7) {
	            throw _iteratorError7;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      var _this3 = this;
	
	      if (!this._complete_promise) {
	        if (this._samplers.length == 0) {
	          this._complete_promise = Promise.resolve(this);
	        } else {
	          var promises = [];
	          var _iteratorNormalCompletion8 = true;
	          var _didIteratorError8 = false;
	          var _iteratorError8 = undefined;
	
	          try {
	            for (var _iterator8 = this._samplers[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	              var sampler = _step8.value;
	
	              if (sampler._texture && !sampler._texture._complete) {
	                promises.push(sampler._texture._promise);
	              }
	            }
	          } catch (err) {
	            _didIteratorError8 = true;
	            _iteratorError8 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion8 && _iterator8.return) {
	                _iterator8.return();
	              }
	            } finally {
	              if (_didIteratorError8) {
	                throw _iteratorError8;
	              }
	            }
	          }
	
	          this._complete_promise = Promise.all(promises).then(function () {
	            return _this3;
	          });
	        }
	      }
	      return this._complete_promise;
	    }
	
	    // Material State fetchers
	
	  }, {
	    key: '_capsDiff',
	
	
	    // Only really for use from the renderer
	    value: function _capsDiff(other_state) {
	      return other_state & _material.MAT_STATE.CAPS_RANGE ^ this._state & _material.MAT_STATE.CAPS_RANGE;
	    }
	  }, {
	    key: '_blendDiff',
	    value: function _blendDiff(other_state) {
	      if (!(this._state & _material.CAP.BLEND)) return 0;
	      return other_state & _material.MAT_STATE.BLEND_FUNC_RANGE ^ this._state & _material.MAT_STATE.BLEND_FUNC_RANGE;
	    }
	  }, {
	    key: '_depthFuncDiff',
	    value: function _depthFuncDiff(other_state) {
	      if (!(this._state & _material.CAP.DEPTH_TEST)) return 0;
	      return other_state & _material.MAT_STATE.DEPTH_FUNC_RANGE ^ this._state & _material.MAT_STATE.DEPTH_FUNC_RANGE;
	    }
	  }, {
	    key: 'cull_face',
	    get: function get() {
	      return !!(this._state & _material.CAP.CULL_FACE);
	    }
	  }, {
	    key: 'blend',
	    get: function get() {
	      return !!(this._state & _material.CAP.BLEND);
	    }
	  }, {
	    key: 'depth_test',
	    get: function get() {
	      return !!(this._state & _material.CAP.DEPTH_TEST);
	    }
	  }, {
	    key: 'stencil_test',
	    get: function get() {
	      return !!(this._state & _material.CAP.STENCIL_TEST);
	    }
	  }, {
	    key: 'color_mask',
	    get: function get() {
	      return !!(this._state & _material.CAP.COLOR_MASK);
	    }
	  }, {
	    key: 'depth_mask',
	    get: function get() {
	      return !!(this._state & _material.CAP.DEPTH_MASK);
	    }
	  }, {
	    key: 'stencil_mask',
	    get: function get() {
	      return !!(this._state & _material.CAP.STENCIL_MASK);
	    }
	  }, {
	    key: 'depth_func',
	    get: function get() {
	      return ((this._state & _material.MAT_STATE.DEPTH_FUNC_RANGE) >> _material.MAT_STATE.DEPTH_FUNC_SHIFT) + WebGLRenderingContext.NEVER;
	    }
	  }, {
	    key: 'blend_func_src',
	    get: function get() {
	      return (0, _material.stateToBlendFunc)(this._state, _material.MAT_STATE.BLEND_SRC_RANGE, _material.MAT_STATE.BLEND_SRC_SHIFT);
	    }
	  }, {
	    key: 'blend_func_dst',
	    get: function get() {
	      return (0, _material.stateToBlendFunc)(this._state, _material.MAT_STATE.BLEND_DST_RANGE, _material.MAT_STATE.BLEND_DST_SHIFT);
	    }
	  }]);
	
	  return RenderMaterial;
	}();
	
	var Renderer = exports.Renderer = function () {
	  function Renderer(gl) {
	    _classCallCheck(this, Renderer);
	
	    this._gl = gl || createWebGLContext();
	    this._frame_id = -1;
	    this._program_cache = {};
	    this._texture_cache = {};
	    this._render_primitives = Array(_material.RENDER_ORDER.DEFAULT);
	    this._camera_positions = [];
	
	    this._vao_ext = gl.getExtension("OES_vertex_array_object");
	
	    var frag_high_precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
	    this._default_frag_precision = frag_high_precision.precision > 0 ? 'highp' : 'mediump';
	
	    this._depth_mask_needs_reset = false;
	    this._color_mask_needs_reset = false;
	  }
	
	  _createClass(Renderer, [{
	    key: 'createRenderBuffer',
	    value: function createRenderBuffer(target, data) {
	      var usage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : WebGLRenderingContext.STATIC_DRAW;
	
	      var gl = this._gl;
	      var gl_buffer = gl.createBuffer();
	
	      if (data instanceof Promise) {
	        var render_buffer = new RenderBuffer(target, usage, data.then(function (data) {
	          gl.bindBuffer(target, gl_buffer);
	          gl.bufferData(target, data, usage);
	          render_buffer._length = data.byteLength;
	          return gl_buffer;
	        }));
	        return render_buffer;
	      } else {
	        gl.bindBuffer(target, gl_buffer);
	        gl.bufferData(target, data, usage);
	        return new RenderBuffer(target, usage, gl_buffer, data.byteLength);
	      }
	    }
	  }, {
	    key: 'updateRenderBuffer',
	    value: function updateRenderBuffer(buffer, data) {
	      var _this4 = this;
	
	      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	      if (buffer._buffer) {
	        var gl = this._gl;
	        gl.bindBuffer(buffer._target, buffer._buffer);
	        if (offset == 0 && buffer._length == data.byteLength) {
	          gl.bufferData(buffer._target, data, buffer._usage);
	        } else {
	          gl.bufferSubData(buffer._target, offset, data);
	        }
	      } else {
	        buffer.waitForComplete().then(function (buffer) {
	          _this4.updateRenderBuffer(buffer, data, offset);
	        });
	      }
	    }
	  }, {
	    key: 'createRenderPrimitive',
	    value: function createRenderPrimitive(primitive, material) {
	      var render_primitive = new RenderPrimitive(primitive);
	
	      var program = this._getMaterialProgram(material, render_primitive);
	      var render_material = new RenderMaterial(this, material, program);
	      render_primitive.setRenderMaterial(render_material);
	
	      if (!this._render_primitives[render_material._render_order]) {
	        this._render_primitives[render_material._render_order] = [];
	      }
	
	      this._render_primitives[render_material._render_order].push(render_primitive);
	
	      return render_primitive;
	    }
	  }, {
	    key: 'createMesh',
	    value: function createMesh(primitive, material) {
	      var mesh_node = new _node.Node();
	      mesh_node.addRenderPrimitive(this.createRenderPrimitive(primitive, material));
	      return mesh_node;
	    }
	  }, {
	    key: 'drawViews',
	    value: function drawViews(views, root_node) {
	      if (!root_node) {
	        return;
	      }
	
	      var gl = this._gl;
	      this._frame_id++;
	
	      root_node.markActive(this._frame_id);
	
	      // If there's only one view then flip the algorithm a bit so that we're only
	      // setting the viewport once.
	      if (views.length == 1 && views[0].viewport) {
	        var vp = views[0].viewport;
	        this._gl.viewport(vp.x, vp.y, vp.width, vp.height);
	      }
	
	      // Get the positions of the 'camera' for each view matrix.
	      for (var i = 0; i < views.length; ++i) {
	        mat4.invert(inverse_matrix, views[i].view_matrix);
	
	        if (this._camera_positions.length <= i) {
	          this._camera_positions.push(vec3.create());
	        }
	        var camera_position = this._camera_positions[i];
	        vec3.set(camera_position, 0, 0, 0);
	        vec3.transformMat4(camera_position, camera_position, inverse_matrix);
	      }
	
	      // Draw each set of render primitives in order
	      var _iteratorNormalCompletion9 = true;
	      var _didIteratorError9 = false;
	      var _iteratorError9 = undefined;
	
	      try {
	        for (var _iterator9 = this._render_primitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	          var render_primitives = _step9.value;
	
	          if (render_primitives && render_primitives.length) {
	            this._drawRenderPrimitiveSet(views, render_primitives);
	          }
	        }
	      } catch (err) {
	        _didIteratorError9 = true;
	        _iteratorError9 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion9 && _iterator9.return) {
	            _iterator9.return();
	          }
	        } finally {
	          if (_didIteratorError9) {
	            throw _iteratorError9;
	          }
	        }
	      }
	
	      if (this._vao_ext) {
	        this._vao_ext.bindVertexArrayOES(null);
	      }
	
	      if (this._depth_mask_needs_reset) {
	        gl.depthMask(true);
	      }
	      if (this._color_mask_needs_reset) {
	        gl.colorMask(true, true, true, true);
	      }
	    }
	  }, {
	    key: '_drawRenderPrimitiveSet',
	    value: function _drawRenderPrimitiveSet(views, render_primitives) {
	      var gl = this._gl;
	      var program = null;
	      var material = null;
	      var attrib_mask = 0;
	
	      // Loop through every primitive known to the renderer.
	      var _iteratorNormalCompletion10 = true;
	      var _didIteratorError10 = false;
	      var _iteratorError10 = undefined;
	
	      try {
	        for (var _iterator10 = render_primitives[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	          var primitive = _step10.value;
	
	          // Skip over those that haven't been marked as active for this frame.
	          if (primitive._active_frame_id != this._frame_id) {
	            continue;
	          }
	
	          // Bind the primitive material's program if it's different than the one we
	          // were using for the previous primitive.
	          // TODO: The ording of this could be more efficient.
	          if (program != primitive._material._program) {
	            program = primitive._material._program;
	            program.use();
	
	            if (program.uniform.LIGHT_DIRECTION) gl.uniform3fv(program.uniform.LIGHT_DIRECTION, DEF_LIGHT_DIR);
	
	            if (program.uniform.LIGHT_COLOR) gl.uniform3fv(program.uniform.LIGHT_COLOR, DEF_LIGHT_COLOR);
	
	            if (views.length == 1) {
	              gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, views[0].projection_matrix);
	              gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, views[0].view_matrix);
	              gl.uniform3fv(program.uniform.CAMERA_POSITION, this._camera_positions[0]);
	              gl.uniform1i(program.uniform.EYE_INDEX, views[0].eye_index);
	            }
	          }
	
	          if (material != primitive._material) {
	            this._bindMaterialState(primitive._material, material);
	            primitive._material.bind(gl, program, material);
	            material = primitive._material;
	          }
	
	          if (this._vao_ext) {
	            if (primitive._vao) {
	              this._vao_ext.bindVertexArrayOES(primitive._vao);
	            } else {
	              primitive._vao = this._vao_ext.createVertexArrayOES();
	              this._vao_ext.bindVertexArrayOES(primitive._vao);
	              this._bindPrimitive(primitive);
	            }
	          } else {
	            this._bindPrimitive(primitive, attrib_mask);
	            attrib_mask = primitive._attribute_mask;
	          }
	
	          for (var i = 0; i < views.length; ++i) {
	            var view = views[i];
	            if (views.length > 1) {
	              if (view.viewport) {
	                var vp = view.viewport;
	                gl.viewport(vp.x, vp.y, vp.width, vp.height);
	              }
	              gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, view.projection_matrix);
	              gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, view.view_matrix);
	              gl.uniform3fv(program.uniform.CAMERA_POSITION, this._camera_positions[i]);
	              gl.uniform1i(program.uniform.EYE_INDEX, view.eye_index);
	            }
	
	            var _iteratorNormalCompletion11 = true;
	            var _didIteratorError11 = false;
	            var _iteratorError11 = undefined;
	
	            try {
	              for (var _iterator11 = primitive._instances[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	                var instance = _step11.value;
	
	                if (instance._active_frame_id != this._frame_id) {
	                  continue;
	                }
	
	                gl.uniformMatrix4fv(program.uniform.MODEL_MATRIX, false, instance.world_matrix);
	
	                if (primitive._index_buffer) {
	                  gl.drawElements(primitive._mode, primitive._element_count, primitive._index_type, primitive._index_byte_offset);
	                } else {
	                  gl.drawArrays(primitive._mode, 0, primitive._element_count);
	                }
	              }
	            } catch (err) {
	              _didIteratorError11 = true;
	              _iteratorError11 = err;
	            } finally {
	              try {
	                if (!_iteratorNormalCompletion11 && _iterator11.return) {
	                  _iterator11.return();
	                }
	              } finally {
	                if (_didIteratorError11) {
	                  throw _iteratorError11;
	                }
	              }
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError10 = true;
	        _iteratorError10 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion10 && _iterator10.return) {
	            _iterator10.return();
	          }
	        } finally {
	          if (_didIteratorError10) {
	            throw _iteratorError10;
	          }
	        }
	      }
	    }
	  }, {
	    key: '_getRenderTexture',
	    value: function _getRenderTexture(texture) {
	      var _this5 = this;
	
	      if (!texture) {
	        return null;
	      }
	
	      var key = texture.texture_key;
	      if (!key) {
	        throw new Error("Texure does not have a valid key");
	      }
	
	      if (key in this._texture_cache) {
	        return this._texture_cache[key];
	      } else {
	        var gl = this._gl;
	        var texture_handle = gl.createTexture();
	        this._texture_cache[key] = texture_handle;
	
	        if (texture instanceof _texture.DataTexture) {
	          gl.bindTexture(gl.TEXTURE_2D, texture_handle);
	          gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture._type, texture._data);
	          this._setSamplerParameters(texture);
	        } else {
	          // Initialize the texture to black
	          gl.bindTexture(gl.TEXTURE_2D, texture_handle);
	          gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, gl.UNSIGNED_BYTE, null);
	          this._setSamplerParameters(texture);
	
	          texture.waitForComplete().then(function () {
	            gl.bindTexture(gl.TEXTURE_2D, texture_handle);
	            gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
	            _this5._setSamplerParameters(texture);
	
	            if (texture instanceof _texture.VideoTexture) {
	              // "Listen for updates" to the video frames and copy to the texture.
	              var _updateFrame = function _updateFrame() {
	                if (!texture._video.paused && !texture._video.waiting) {
	                  gl.bindTexture(gl.TEXTURE_2D, texture_handle);
	                  gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
	                  window.setTimeout(_updateFrame, 16); // TODO: UUUUUUUGGGGGGGHHHH!
	                }
	              };
	
	              texture._video.addEventListener('playing', _updateFrame);
	            }
	          });
	        }
	
	        return texture_handle;
	      }
	    }
	  }, {
	    key: '_setSamplerParameters',
	    value: function _setSamplerParameters(texture) {
	      var gl = this._gl;
	
	      var sampler = texture.sampler;
	      var power_of_two = isPowerOfTwo(texture.width) && isPowerOfTwo(texture.height);
	      var mipmap = power_of_two && texture.mipmap;
	      if (mipmap) {
	        gl.generateMipmap(gl.TEXTURE_2D);
	      }
	
	      var min_filter = sampler.min_filter || (mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
	      var wrap_s = sampler.wrap_s || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);
	      var wrap_t = sampler.wrap_t || (power_of_two ? gl.REPEAT : gl.CLAMP_TO_EDGE);
	
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.mag_filter || gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t);
	    }
	  }, {
	    key: '_getProgramKey',
	    value: function _getProgramKey(name, defines) {
	      var key = name + ':';
	
	      for (var define in defines) {
	        key += define + '=' + defines[define] + ',';
	      }
	
	      return key;
	    }
	  }, {
	    key: '_getMaterialProgram',
	    value: function _getMaterialProgram(material, render_primitive) {
	      var _this6 = this;
	
	      var material_name = material.material_name;
	      var vertex_source = material.vertex_source;
	      var fragment_source = material.fragment_source;
	
	      // These should always be defined for every material
	      if (material_name == null) {
	        throw new Error("Material does not have a name");
	      }
	      if (vertex_source == null) {
	        throw new Error('Material "' + material_name + '" does not have a vertex source');
	      }
	      if (fragment_source == null) {
	        throw new Error('Material "' + material_name + '" does not have a fragment source');
	      }
	
	      var defines = material.getProgramDefines(render_primitive);
	      var key = this._getProgramKey(material_name, defines);
	
	      if (key in this._program_cache) {
	        return this._program_cache[key];
	      } else {
	        var multiview = false; // Handle this dynamically later
	        var full_vertex_source = vertex_source;
	        full_vertex_source += multiview ? VERTEX_SHADER_MULTI_ENTRY : VERTEX_SHADER_SINGLE_ENTRY;
	
	        var precision_match = fragment_source.match(PRECISION_REGEX);
	        var frag_precision_header = precision_match ? '' : 'precision ' + this._default_frag_precision + ' float;\n';
	
	        var full_fragment_source = frag_precision_header + fragment_source;
	        full_fragment_source += FRAGMENT_SHADER_ENTRY;
	
	        var program = new _program.Program(this._gl, full_vertex_source, full_fragment_source, ATTRIB, defines);
	        this._program_cache[key] = program;
	
	        program.onNextUse(function (program) {
	          // Bind the samplers to the right texture index. This is constant for
	          // the lifetime of the program.
	          for (var i = 0; i < material._samplers.length; ++i) {
	            var sampler = material._samplers[i];
	            var uniform = program.uniform[sampler._uniform_name];
	            if (uniform) _this6._gl.uniform1i(uniform, i);
	          }
	        });
	
	        return program;
	      }
	    }
	  }, {
	    key: '_bindPrimitive',
	    value: function _bindPrimitive(primitive, attrib_mask) {
	      var gl = this._gl;
	
	      // If the active attributes have changed then update the active set.
	      if (attrib_mask != primitive._attribute_mask) {
	        for (var attrib in ATTRIB) {
	          if (primitive._attribute_mask & ATTRIB_MASK[attrib]) {
	            gl.enableVertexAttribArray(ATTRIB[attrib]);
	          } else {
	            gl.disableVertexAttribArray(ATTRIB[attrib]);
	          }
	        }
	      }
	
	      // Bind the primitive attributes and indices.
	      var _iteratorNormalCompletion12 = true;
	      var _didIteratorError12 = false;
	      var _iteratorError12 = undefined;
	
	      try {
	        for (var _iterator12 = primitive._attribute_buffers[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	          var attribute_buffer = _step12.value;
	
	          gl.bindBuffer(gl.ARRAY_BUFFER, attribute_buffer._buffer._buffer);
	          var _iteratorNormalCompletion13 = true;
	          var _didIteratorError13 = false;
	          var _iteratorError13 = undefined;
	
	          try {
	            for (var _iterator13 = attribute_buffer._attributes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	              var _attrib = _step13.value;
	
	              gl.vertexAttribPointer(_attrib._attrib_index, _attrib._component_count, _attrib._component_type, _attrib._normalized, _attrib._stride, _attrib._byte_offset);
	            }
	          } catch (err) {
	            _didIteratorError13 = true;
	            _iteratorError13 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion13 && _iterator13.return) {
	                _iterator13.return();
	              }
	            } finally {
	              if (_didIteratorError13) {
	                throw _iteratorError13;
	              }
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError12 = true;
	        _iteratorError12 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion12 && _iterator12.return) {
	            _iterator12.return();
	          }
	        } finally {
	          if (_didIteratorError12) {
	            throw _iteratorError12;
	          }
	        }
	      }
	
	      if (primitive._index_buffer) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive._index_buffer._buffer);
	      } else {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	      }
	    }
	  }, {
	    key: '_bindMaterialState',
	    value: function _bindMaterialState(material) {
	      var prev_material = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	      var gl = this._gl;
	
	      var state = material._state;
	      var prev_state = prev_material ? prev_material._state : ~state;
	
	      // Return early if both materials use identical state
	      if (state == prev_state) return;
	
	      // Any caps bits changed?
	      if (material._capsDiff(prev_state)) {
	        setCap(gl, gl.CULL_FACE, _material.CAP.CULL_FACE, prev_state, state);
	        setCap(gl, gl.BLEND, _material.CAP.BLEND, prev_state, state);
	        setCap(gl, gl.DEPTH_TEST, _material.CAP.DEPTH_TEST, prev_state, state);
	        setCap(gl, gl.STENCIL_TEST, _material.CAP.STENCIL_TEST, prev_state, state);
	
	        var color_mask_change = (state & _material.CAP.COLOR_MASK) - (prev_state & _material.CAP.COLOR_MASK);
	        if (color_mask_change) {
	          var mask = color_mask_change > 1;
	          this._color_mask_needs_reset = !mask;
	          gl.colorMask(mask, mask, mask, mask);
	        }
	
	        var depth_mask_change = (state & _material.CAP.DEPTH_MASK) - (prev_state & _material.CAP.DEPTH_MASK);
	        if (depth_mask_change) {
	          this._depth_mask_needs_reset = !(depth_mask_change > 1);
	          gl.depthMask(depth_mask_change > 1);
	        }
	
	        var stencil_mask_change = (state & _material.CAP.STENCIL_MASK) - (prev_state & _material.CAP.STENCIL_MASK);
	        if (stencil_mask_change) {
	          gl.stencilMask(stencil_mask_change > 1);
	        }
	      }
	
	      // Blending enabled and blend func changed?
	      if (material._blendDiff(prev_state)) {
	        gl.blendFunc(material.blend_func_src, material.blend_func_dst);
	      }
	
	      // Depth testing enabled and depth func changed?
	      if (material._depthFuncDiff(prev_state)) {
	        gl.depthFunc(material.depth_func);
	      }
	    }
	  }, {
	    key: 'gl',
	    get: function get() {
	      return this._gl;
	    }
	  }]);

	  return Renderer;
	}();

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.stateToBlendFunc = stateToBlendFunc;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var GL = WebGLRenderingContext; // For enums
	
	var CAP = exports.CAP = {
	  // Enable caps
	  CULL_FACE: 0x001,
	  BLEND: 0x002,
	  DEPTH_TEST: 0x004,
	  STENCIL_TEST: 0x008,
	  COLOR_MASK: 0x010,
	  DEPTH_MASK: 0x020,
	  STENCIL_MASK: 0x040
	};
	
	var MAT_STATE = exports.MAT_STATE = {
	  CAPS_RANGE: 0x000000FF,
	  BLEND_SRC_SHIFT: 8,
	  BLEND_SRC_RANGE: 0x00000F00,
	  BLEND_DST_SHIFT: 12,
	  BLEND_DST_RANGE: 0x0000F000,
	  BLEND_FUNC_RANGE: 0x0000FF00,
	  DEPTH_FUNC_SHIFT: 16,
	  DEPTH_FUNC_RANGE: 0x000F0000
	};
	
	var RENDER_ORDER = exports.RENDER_ORDER = {
	  // Render opaque objects first.
	  OPAQUE: 0,
	
	  // Render the sky after all opaque object to save fill rate.
	  SKY: 1,
	
	  // Render transparent objects next so that the opaqe objects show through.
	  TRANSPARENT: 2,
	
	  // Finally render purely additive effects like pointer rays so that they
	  // can render without depth mask.
	  ADDITIVE: 3,
	
	  // Render order will be picked based on the material properties.
	  DEFAULT: 4
	};
	
	function stateToBlendFunc(state, mask, shift) {
	  var value = (state & mask) >> shift;
	  switch (value) {
	    case 0:
	    case 1:
	      return value;
	    default:
	      return value - 2 + GL.SRC_COLOR;
	  }
	}
	
	var MaterialState = exports.MaterialState = function () {
	  function MaterialState() {
	    _classCallCheck(this, MaterialState);
	
	    this._state = CAP.CULL_FACE | CAP.DEPTH_TEST | CAP.COLOR_MASK | CAP.DEPTH_MASK;
	
	    // Use a fairly commonly desired blend func as the default.
	    this.blend_func_src = GL.SRC_ALPHA;
	    this.blend_func_dst = GL.ONE_MINUS_SRC_ALPHA;
	
	    this.depth_func = GL.LESS;
	  }
	
	  _createClass(MaterialState, [{
	    key: "cull_face",
	    get: function get() {
	      return !!(this._state & CAP.CULL_FACE);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.CULL_FACE;
	      } else {
	        this._state &= ~CAP.CULL_FACE;
	      }
	    }
	  }, {
	    key: "blend",
	    get: function get() {
	      return !!(this._state & CAP.BLEND);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.BLEND;
	      } else {
	        this._state &= ~CAP.BLEND;
	      }
	    }
	  }, {
	    key: "depth_test",
	    get: function get() {
	      return !!(this._state & CAP.DEPTH_TEST);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.DEPTH_TEST;
	      } else {
	        this._state &= ~CAP.DEPTH_TEST;
	      }
	    }
	  }, {
	    key: "stencil_test",
	    get: function get() {
	      return !!(this._state & CAP.STENCIL_TEST);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.STENCIL_TEST;
	      } else {
	        this._state &= ~CAP.STENCIL_TEST;
	      }
	    }
	  }, {
	    key: "color_mask",
	    get: function get() {
	      return !!(this._state & CAP.COLOR_MASK);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.COLOR_MASK;
	      } else {
	        this._state &= ~CAP.COLOR_MASK;
	      }
	    }
	  }, {
	    key: "depth_mask",
	    get: function get() {
	      return !!(this._state & CAP.DEPTH_MASK);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.DEPTH_MASK;
	      } else {
	        this._state &= ~CAP.DEPTH_MASK;
	      }
	    }
	  }, {
	    key: "depth_func",
	    get: function get() {
	      return ((this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT) + WebGLRenderingContext.NEVER;
	    },
	    set: function set(value) {
	      value = value - WebGLRenderingContext.NEVER;
	      this._state &= ~MAT_STATE.DEPTH_FUNC_RANGE;
	      this._state |= value << MAT_STATE.DEPTH_FUNC_SHIFT;
	    }
	  }, {
	    key: "stencil_mask",
	    get: function get() {
	      return !!(this._state & CAP.STENCIL_MASK);
	    },
	    set: function set(value) {
	      if (value) {
	        this._state |= CAP.STENCIL_MASK;
	      } else {
	        this._state &= ~CAP.STENCIL_MASK;
	      }
	    }
	  }, {
	    key: "blend_func_src",
	    get: function get() {
	      return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT);
	    },
	    set: function set(value) {
	      switch (value) {
	        case 0:
	        case 1:
	          break;
	        default:
	          value = value - WebGLRenderingContext.SRC_COLOR + 2;
	      }
	      this._state &= ~MAT_STATE.BLEND_SRC_RANGE;
	      this._state |= value << MAT_STATE.BLEND_SRC_SHIFT;
	    }
	  }, {
	    key: "blend_func_dst",
	    get: function get() {
	      return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT);
	    },
	    set: function set(value) {
	      switch (value) {
	        case 0:
	        case 1:
	          break;
	        default:
	          value = value - WebGLRenderingContext.SRC_COLOR + 2;
	      }
	      this._state &= ~MAT_STATE.BLEND_DST_RANGE;
	      this._state |= value << MAT_STATE.BLEND_DST_SHIFT;
	    }
	  }]);
	
	  return MaterialState;
	}();
	
	var MaterialSampler = function () {
	  function MaterialSampler(uniform_name) {
	    _classCallCheck(this, MaterialSampler);
	
	    this._uniform_name = uniform_name;
	    this._texture = null;
	  }
	
	  _createClass(MaterialSampler, [{
	    key: "texture",
	    get: function get() {
	      return this._texture;
	    },
	    set: function set(value) {
	      this._texture = value;
	    }
	  }]);
	
	  return MaterialSampler;
	}();
	
	var MaterialUniform = function () {
	  function MaterialUniform(uniform_name, default_value, length) {
	    _classCallCheck(this, MaterialUniform);
	
	    this._uniform_name = uniform_name;
	    this._value = default_value;
	    this._length = length;
	    if (!this._length) {
	      if (default_value instanceof Array) {
	        this._length = default_value.length;
	      } else {
	        this._length = 1;
	      }
	    }
	  }
	
	  _createClass(MaterialUniform, [{
	    key: "value",
	    get: function get() {
	      return this._value;
	    },
	    set: function set(value) {
	      this._value = value;
	    }
	  }]);
	
	  return MaterialUniform;
	}();
	
	var Material = exports.Material = function () {
	  function Material() {
	    _classCallCheck(this, Material);
	
	    this.state = new MaterialState();
	    this.render_order = RENDER_ORDER.DEFAULT;
	    this._samplers = [];
	    this._uniforms = [];
	  }
	
	  _createClass(Material, [{
	    key: "defineSampler",
	    value: function defineSampler(uniform_name) {
	      var sampler = new MaterialSampler(uniform_name);
	      this._samplers.push(sampler);
	      return sampler;
	    }
	  }, {
	    key: "defineUniform",
	    value: function defineUniform(uniform_name) {
	      var default_value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	      var uniform = new MaterialUniform(uniform_name, default_value, length);
	      this._uniforms.push(uniform);
	      return uniform;
	    }
	  }, {
	    key: "getProgramDefines",
	    value: function getProgramDefines(render_primitive) {
	      return {};
	    }
	  }, {
	    key: "material_name",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "vertex_source",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "fragment_source",
	    get: function get() {
	      return null;
	    }
	  }]);

	  return Material;
	}();

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var Program = exports.Program = function () {
	  function Program(gl, vert_src, frag_src, attrib_map, defines) {
	    _classCallCheck(this, Program);
	
	    this._gl = gl;
	    this.program = gl.createProgram();
	    this.attrib = null;
	    this.uniform = null;
	    this.defines = {};
	
	    this._first_use = true;
	    this._next_use_callbacks = [];
	
	    var defines_string = '';
	    if (defines) {
	      for (var define in defines) {
	        this.defines[define] = defines[define];
	        defines_string += '#define ' + define + ' ' + defines[define] + '\n';
	      }
	    }
	
	    this._vert_shader = gl.createShader(gl.VERTEX_SHADER);
	    gl.attachShader(this.program, this._vert_shader);
	    gl.shaderSource(this._vert_shader, defines_string + vert_src);
	    gl.compileShader(this._vert_shader);
	
	    this._frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.attachShader(this.program, this._frag_shader);
	    gl.shaderSource(this._frag_shader, defines_string + frag_src);
	    gl.compileShader(this._frag_shader);
	
	    if (attrib_map) {
	      this.attrib = {};
	      for (var attrib_name in attrib_map) {
	        gl.bindAttribLocation(this.program, attrib_map[attrib_name], attrib_name);
	        this.attrib[attrib_name] = attrib_map[attrib_name];
	      }
	    }
	
	    gl.linkProgram(this.program);
	  }
	
	  _createClass(Program, [{
	    key: 'onNextUse',
	    value: function onNextUse(callback) {
	      this._next_use_callbacks.push(callback);
	    }
	  }, {
	    key: 'use',
	    value: function use() {
	      var gl = this._gl;
	
	      // If this is the first time the program has been used do all the error checking and
	      // attrib/uniform querying needed.
	      if (this._first_use) {
	        this._first_use = false;
	        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
	          if (!gl.getShaderParameter(this._vert_shader, gl.COMPILE_STATUS)) {
	            console.error('Vertex shader compile error: ' + gl.getShaderInfoLog(this._vert_shader));
	          } else if (!gl.getShaderParameter(this._frag_shader, gl.COMPILE_STATUS)) {
	            console.error('Fragment shader compile error: ' + gl.getShaderInfoLog(this._frag_shader));
	          } else {
	            console.error('Program link error: ' + gl.getProgramInfoLog(this.program));
	          }
	          gl.deleteProgram(this.program);
	          this.program = null;
	        } else {
	          if (!this.attrib) {
	            this.attrib = {};
	            var attrib_count = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
	            for (var i = 0; i < attrib_count; i++) {
	              var attrib_info = gl.getActiveAttrib(this.program, i);
	              this.attrib[attrib_info.name] = gl.getAttribLocation(this.program, attrib_info.name);
	            }
	          }
	
	          this.uniform = {};
	          var uniform_count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
	          var uniform_name = '';
	          for (var _i = 0; _i < uniform_count; _i++) {
	            var uniform_info = gl.getActiveUniform(this.program, _i);
	            uniform_name = uniform_info.name.replace('[0]', '');
	            this.uniform[uniform_name] = gl.getUniformLocation(this.program, uniform_name);
	          }
	        }
	        gl.deleteShader(this._vert_shader);
	        gl.deleteShader(this._frag_shader);
	      }
	
	      gl.useProgram(this.program);
	
	      if (this._next_use_callbacks.length) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	          for (var _iterator = this._next_use_callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var callback = _step.value;
	
	            callback(this);
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	
	        this._next_use_callbacks = [];
	      }
	    }
	  }]);

	  return Program;
	}();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var GL = WebGLRenderingContext; // For enums
	
	var TextureSampler = exports.TextureSampler = function TextureSampler() {
	  _classCallCheck(this, TextureSampler);
	
	  this.min_filter = null;
	  this.mag_filter = null;
	  this.wrap_s = null;
	  this.wrap_t = null;
	};
	
	var Texture = exports.Texture = function () {
	  function Texture() {
	    _classCallCheck(this, Texture);
	
	    this.sampler = new TextureSampler();
	    this.mipmap = true;
	    //TODO: Anisotropy
	  }
	
	  _createClass(Texture, [{
	    key: 'format',
	    get: function get() {
	      return GL.RGBA;
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return 0;
	    }
	  }, {
	    key: 'height',
	    get: function get() {
	      return 0;
	    }
	  }, {
	    key: 'texture_key',
	    get: function get() {
	      return null;
	    }
	  }]);
	
	  return Texture;
	}();
	
	var ImageTexture = exports.ImageTexture = function (_Texture) {
	  _inherits(ImageTexture, _Texture);
	
	  function ImageTexture(img) {
	    _classCallCheck(this, ImageTexture);
	
	    var _this = _possibleConstructorReturn(this, (ImageTexture.__proto__ || Object.getPrototypeOf(ImageTexture)).call(this));
	
	    _this._img = img;
	
	    if (img.src && img.complete) {
	      if (img.naturalWidth) {
	        _this._promise = Promise.resolve(_this);
	      } else {
	        _this._promise = Promise.reject("Image provided had failed to load.");
	      }
	    } else {
	      _this._promise = new Promise(function (resolve, reject) {
	        img.addEventListener('load', function () {
	          return resolve(_this);
	        });
	        img.addEventListener('error', reject);
	      });
	    }
	    return _this;
	  }
	
	  _createClass(ImageTexture, [{
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      return this._promise;
	    }
	  }, {
	    key: 'format',
	    get: function get() {
	      // TODO: Can be RGB in some cases.
	      return GL.RGBA;
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return this._img.width;
	    }
	  }, {
	    key: 'height',
	    get: function get() {
	      return this._img.height;
	    }
	  }, {
	    key: 'texture_key',
	    get: function get() {
	      return this._img.src;
	    }
	  }, {
	    key: 'source',
	    get: function get() {
	      return this._img;
	    }
	  }]);
	
	  return ImageTexture;
	}(Texture);
	
	var UrlTexture = exports.UrlTexture = function (_ImageTexture) {
	  _inherits(UrlTexture, _ImageTexture);
	
	  function UrlTexture(url) {
	    _classCallCheck(this, UrlTexture);
	
	    var img = new Image();
	
	    var _this2 = _possibleConstructorReturn(this, (UrlTexture.__proto__ || Object.getPrototypeOf(UrlTexture)).call(this, img));
	
	    img.src = url;
	    return _this2;
	  }
	
	  return UrlTexture;
	}(ImageTexture);
	
	var BlobTexture = exports.BlobTexture = function (_ImageTexture2) {
	  _inherits(BlobTexture, _ImageTexture2);
	
	  function BlobTexture(blob) {
	    _classCallCheck(this, BlobTexture);
	
	    var img = new Image();
	
	    var _this3 = _possibleConstructorReturn(this, (BlobTexture.__proto__ || Object.getPrototypeOf(BlobTexture)).call(this, img));
	
	    img.src = window.URL.createObjectURL(blob);
	    return _this3;
	  }
	
	  return BlobTexture;
	}(ImageTexture);
	
	var VideoTexture = exports.VideoTexture = function (_Texture2) {
	  _inherits(VideoTexture, _Texture2);
	
	  function VideoTexture(video) {
	    _classCallCheck(this, VideoTexture);
	
	    var _this4 = _possibleConstructorReturn(this, (VideoTexture.__proto__ || Object.getPrototypeOf(VideoTexture)).call(this));
	
	    _this4._video = video;
	
	    if (video.readyState >= 2) {
	      _this4._promise = Promise.resolve(_this4);
	    } else if (video.error) {
	      _this4._promise = Promise.reject(video.error);
	    } else {
	      _this4._promise = new Promise(function (resolve, reject) {
	        video.addEventListener('loadeddata', function () {
	          return resolve(_this4);
	        });
	        video.addEventListener('error', reject);
	      });
	    }
	    return _this4;
	  }
	
	  _createClass(VideoTexture, [{
	    key: 'waitForComplete',
	    value: function waitForComplete() {
	      return this._promise;
	    }
	  }, {
	    key: 'format',
	    get: function get() {
	      // TODO: Can be RGB in some cases.
	      return GL.RGBA;
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return this._video.videoWidth;
	    }
	  }, {
	    key: 'height',
	    get: function get() {
	      return this._video.videoHeight;
	    }
	  }, {
	    key: 'texture_key',
	    get: function get() {
	      return this._video.src;
	    }
	  }, {
	    key: 'source',
	    get: function get() {
	      return this._video;
	    }
	  }]);
	
	  return VideoTexture;
	}(Texture);
	
	var next_data_texture_index = 0;
	
	var DataTexture = exports.DataTexture = function (_Texture3) {
	  _inherits(DataTexture, _Texture3);
	
	  function DataTexture(data, width, height) {
	    var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : GL.RGBA;
	    var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : GL.UNSIGNED_BYTE;
	
	    _classCallCheck(this, DataTexture);
	
	    var _this5 = _possibleConstructorReturn(this, (DataTexture.__proto__ || Object.getPrototypeOf(DataTexture)).call(this));
	
	    _this5._data = data;
	    _this5._width = width;
	    _this5._height = height;
	    _this5._format = format;
	    _this5._type = type;
	    _this5._key = 'DATA_' + next_data_texture_index;
	    next_data_texture_index++;
	    return _this5;
	  }
	
	  _createClass(DataTexture, [{
	    key: 'format',
	    get: function get() {
	      return this._format;
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return this._width;
	    }
	  }, {
	    key: 'height',
	    get: function get() {
	      return this._height;
	    }
	  }, {
	    key: 'texture_key',
	    get: function get() {
	      return this._key;
	    }
	  }]);
	
	  return DataTexture;
	}(Texture);
	
	var ColorTexture = exports.ColorTexture = function (_DataTexture) {
	  _inherits(ColorTexture, _DataTexture);
	
	  function ColorTexture(r, g, b, a) {
	    _classCallCheck(this, ColorTexture);
	
	    var color_data = new Uint8Array([r * 255.0, g * 255.0, b * 255.0, a * 255.0]);
	
	    var _this6 = _possibleConstructorReturn(this, (ColorTexture.__proto__ || Object.getPrototypeOf(ColorTexture)).call(this, color_data, 1, 1));
	
	    _this6.mipmap = false;
	    _this6._key = 'COLOR_' + color_data[0] + '_' + color_data[1] + '_' + color_data[2] + '_' + color_data[3];
	    return _this6;
	  }
	
	  return ColorTexture;
	}(DataTexture);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GeometryBuilderBase = exports.PrimitiveStream = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright 2018 The Immersive Web Community Group
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
	
	var _primitive = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var GL = WebGLRenderingContext; // For enums
	
	var temp_vec3 = vec3.create();
	
	var PrimitiveStream = exports.PrimitiveStream = function () {
	  function PrimitiveStream(options) {
	    _classCallCheck(this, PrimitiveStream);
	
	    this._vertices = [];
	    this._indices = [];
	
	    this._geometry_started = false;
	
	    this._vertex_offset = 0;
	    this._vertex_index = 0;
	    this._high_index = 0;
	
	    this._flip_winding = false;
	    this._invert_normals = false;
	    this._transform = null;
	    this._normal_transform = null;
	    this._min = null;
	    this._max = null;
	  }
	
	  _createClass(PrimitiveStream, [{
	    key: "startGeometry",
	    value: function startGeometry() {
	      if (this._geometry_started) {
	        throw new Error("Attempted to start a new geometry before the previous one was ended.");
	      }
	
	      this._geometry_started = true;
	      this._vertex_index = 0;
	      this._high_index = 0;
	    }
	  }, {
	    key: "endGeometry",
	    value: function endGeometry() {
	      if (!this._geometry_started) {
	        throw new Error("Attempted to end a geometry before one was started.");
	      }
	
	      if (this._high_index >= this._vertex_index) {
	        throw new Error("Geometry contains indices that are out of bounds. (Contains an index of " + this._high_index + " when the vertex count is " + this._vertex_index + ")");
	      }
	
	      this._geometry_started = false;
	      this._vertex_offset += this._vertex_index;
	
	      // TODO: Anything else need to be done to finish processing here?
	    }
	  }, {
	    key: "pushVertex",
	    value: function pushVertex(x, y, z, u, v, nx, ny, nz) {
	      if (!this._geometry_started) {
	        throw new Error("Cannot push vertices before calling startGeometry().");
	      }
	
	      // Transform the incoming vertex if we have a transformation matrix
	      if (this._transform) {
	        temp_vec3[0] = x;
	        temp_vec3[1] = y;
	        temp_vec3[2] = z;
	        vec3.transformMat4(temp_vec3, temp_vec3, this._transform);
	        x = temp_vec3[0];
	        y = temp_vec3[1];
	        z = temp_vec3[2];
	
	        temp_vec3[0] = nx;
	        temp_vec3[1] = ny;
	        temp_vec3[2] = nz;
	        vec3.transformMat3(temp_vec3, temp_vec3, this._normal_transform);
	        nx = temp_vec3[0];
	        ny = temp_vec3[1];
	        nz = temp_vec3[2];
	      }
	
	      if (this._invert_normals) {
	        nx *= -1.0;
	        ny *= -1.0;
	        nz *= -1.0;
	      }
	
	      this._vertices.push(x, y, z, u, v, nx, ny, nz);
	
	      if (this._min) {
	        this._min[0] = Math.min(this._min[0], x);
	        this._min[1] = Math.min(this._min[1], y);
	        this._min[2] = Math.min(this._min[2], z);
	        this._max[0] = Math.max(this._max[0], x);
	        this._max[1] = Math.max(this._max[1], y);
	        this._max[2] = Math.max(this._max[2], z);
	      } else {
	        this._min = vec3.fromValues(x, y, z);
	        this._max = vec3.fromValues(x, y, z);
	      }
	
	      return this._vertex_index++;
	    }
	  }, {
	    key: "pushTriangle",
	    value: function pushTriangle(idx_a, idx_b, idx_c) {
	      if (!this._geometry_started) {
	        throw new Error("Cannot push triangles before calling startGeometry().");
	      }
	
	      this._high_index = Math.max(this._high_index, idx_a, idx_b, idx_c);
	
	      idx_a += this._vertex_offset;
	      idx_b += this._vertex_offset;
	      idx_c += this._vertex_offset;
	
	      if (this._flip_winding) {
	        this._indices.push(idx_c, idx_b, idx_a);
	      } else {
	        this._indices.push(idx_a, idx_b, idx_c);
	      }
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      if (this._geometry_started) {
	        throw new Error("Cannot clear before ending the current geometry.");
	      }
	
	      this._vertices = [];
	      this._indices = [];
	      this._vertex_offset = 0;
	      this._min = null;
	      this._max = null;
	    }
	  }, {
	    key: "finishPrimitive",
	    value: function finishPrimitive(renderer) {
	      if (!this._vertex_offset) {
	        throw new Error("Attempted to call finishPrimitive() before creating any geometry.");
	      }
	
	      var vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(this._vertices));
	      var index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices));
	
	      var attribs = [new _primitive.PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 32, 0), new _primitive.PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 32, 12), new _primitive.PrimitiveAttribute("NORMAL", vertex_buffer, 3, GL.FLOAT, 32, 20)];
	
	      var primitive = new _primitive.Primitive(attribs, this._indices.length);
	      primitive.setIndexBuffer(index_buffer);
	      primitive.setBounds(this._min, this._max);
	
	      return primitive;
	    }
	  }, {
	    key: "flip_winding",
	    set: function set(value) {
	      if (this._geometry_started) {
	        throw new Error("Cannot change flip_winding before ending the current geometry.");
	      }
	      this._flip_winding = value;
	    },
	    get: function get() {
	      this._flip_winding;
	    }
	  }, {
	    key: "invert_normals",
	    set: function set(value) {
	      if (this._geometry_started) {
	        throw new Error("Cannot change invert_normals before ending the current geometry.");
	      }
	      this._invert_normals = value;
	    },
	    get: function get() {
	      this._invert_normals;
	    }
	  }, {
	    key: "transform",
	    set: function set(value) {
	      if (this._geometry_started) {
	        throw new Error("Cannot change transform before ending the current geometry.");
	      }
	      this._transform = value;
	      if (this._transform) {
	        if (!this._normal_transform) {
	          this._normal_transform = mat3.create();
	        }
	        mat3.fromMat4(this._normal_transform, this._transform);
	      }
	    },
	    get: function get() {
	      this._transform;
	    }
	  }, {
	    key: "next_vertex_index",
	    get: function get() {
	      return this._vertex_index;
	    }
	  }]);
	
	  return PrimitiveStream;
	}();
	
	var GeometryBuilderBase = exports.GeometryBuilderBase = function () {
	  function GeometryBuilderBase(primitive_stream) {
	    _classCallCheck(this, GeometryBuilderBase);
	
	    if (primitive_stream) {
	      this._stream = primitive_stream;
	    } else {
	      this._stream = new PrimitiveStream();
	    }
	  }
	
	  _createClass(GeometryBuilderBase, [{
	    key: "finishPrimitive",
	    value: function finishPrimitive(renderer) {
	      return this._stream.finishPrimitive(renderer);
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      this._stream.clear();
	    }
	  }, {
	    key: "primitive_stream",
	    set: function set(value) {
	      this._stream = value;
	    },
	    get: function get() {
	      return this._stream;
	    }
	  }]);

	  return GeometryBuilderBase;
	}();

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var PrimitiveAttribute = exports.PrimitiveAttribute = function PrimitiveAttribute(name, buffer, component_count, component_type, stride, byte_offset) {
	  _classCallCheck(this, PrimitiveAttribute);
	
	  this.name = name;
	  this.buffer = buffer;
	  this.component_count = component_count || 3;
	  this.component_type = component_type || 5126; // gl.FLOAT;
	  this.stride = stride || 0;
	  this.byte_offset = byte_offset || 0;
	  this.normalized = false;
	};
	
	var Primitive = exports.Primitive = function () {
	  function Primitive(attributes, element_count, mode) {
	    _classCallCheck(this, Primitive);
	
	    this.attributes = attributes || [];
	    this.element_count = element_count || 0;
	    this.mode = mode || 4; // gl.TRIANGLES;
	    this.index_buffer = null;
	    this.index_byte_offset = 0;
	    this.index_type = 0;
	    this._min = null;
	    this._max = null;
	  }
	
	  _createClass(Primitive, [{
	    key: "setIndexBuffer",
	    value: function setIndexBuffer(index_buffer, byte_offset, index_type) {
	      this.index_buffer = index_buffer;
	      this.index_byte_offset = byte_offset || 0;
	      this.index_type = index_type || 5123; // gl.UNSIGNED_SHORT;
	    }
	  }, {
	    key: "setBounds",
	    value: function setBounds(min, max) {
	      this._min = vec3.clone(min);
	      this._max = vec3.clone(max);
	    }
	  }]);

	  return Primitive;
	}();

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BoxBuilder = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _primitiveStream = __webpack_require__(7);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var BoxBuilder = exports.BoxBuilder = function (_GeometryBuilderBase) {
	  _inherits(BoxBuilder, _GeometryBuilderBase);
	
	  function BoxBuilder() {
	    _classCallCheck(this, BoxBuilder);
	
	    return _possibleConstructorReturn(this, (BoxBuilder.__proto__ || Object.getPrototypeOf(BoxBuilder)).apply(this, arguments));
	  }
	
	  _createClass(BoxBuilder, [{
	    key: 'pushBox',
	    value: function pushBox(min, max) {
	      var stream = this.primitive_stream;
	
	      var w = max[0] - min[0];
	      var h = max[1] - min[1];
	      var d = max[2] - min[2];
	
	      var wh = w * 0.5;
	      var hh = h * 0.5;
	      var dh = d * 0.5;
	
	      var cx = min[0] + wh;
	      var cy = min[1] + hh;
	      var cz = min[2] + dh;
	
	      stream.startGeometry();
	
	      // Bottom
	      var idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 1, idx + 2);
	      stream.pushTriangle(idx, idx + 2, idx + 3);
	
	      //                 X       Y       Z       U    V     NX    NY   NZ 
	      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, 0.0, -1.0, 0.0);
	      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 0.0, -1.0, 0.0);
	      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 1.0, 0.0, 0.0, -1.0, 0.0);
	      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 0.0, 0.0, 0.0, -1.0, 0.0);
	
	      // Top
	      idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 2, idx + 1);
	      stream.pushTriangle(idx, idx + 3, idx + 2);
	
	      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, 0.0, 1.0, 0.0);
	      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 0.0, 1.0, 0.0);
	      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 1.0, 1.0, 0.0, 1.0, 0.0);
	      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 0.0, 1.0, 0.0, 1.0, 0.0);
	
	      // Left
	      idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 2, idx + 1);
	      stream.pushTriangle(idx, idx + 3, idx + 2);
	
	      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, -1.0, 0.0, 0.0);
	      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, -1.0, 0.0, 0.0);
	      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 1.0, 0.0, -1.0, 0.0, 0.0);
	      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 1.0, 1.0, -1.0, 0.0, 0.0);
	
	      // Right
	      idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 1, idx + 2);
	      stream.pushTriangle(idx, idx + 2, idx + 3);
	
	      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 1.0, 0.0, 0.0);
	      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 1.0, 0.0, 0.0);
	      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 0.0, 0.0, 1.0, 0.0, 0.0);
	      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 0.0, 1.0, 1.0, 0.0, 0.0);
	
	      // Back
	      idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 2, idx + 1);
	      stream.pushTriangle(idx, idx + 3, idx + 2);
	
	      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 0.0, 0.0, -1.0);
	      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, 0.0, 0.0, -1.0);
	      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, 0.0, 0.0, -1.0);
	      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 0.0, 0.0, -1.0);
	
	      // Front
	      idx = stream.next_vertex_index;
	      stream.pushTriangle(idx, idx + 1, idx + 2);
	      stream.pushTriangle(idx, idx + 2, idx + 3);
	
	      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 0.0, 1.0, 0.0, 0.0, 1.0);
	      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 1.0, 1.0, 0.0, 0.0, 1.0);
	      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 1.0, 0.0, 0.0, 0.0, 1.0);
	      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 0.0, 0.0, 0.0, 0.0, 1.0);
	
	      stream.endGeometry();
	    }
	  }, {
	    key: 'pushCube',
	    value: function pushCube() {
	      var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
	      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
	
	      var hs = size * 0.5;
	      this.pushBox([center[0] - hs, center[1] - hs, center[2] - hs], [center[0] + hs, center[1] + hs, center[2] + hs]);
	    }
	  }]);

	  return BoxBuilder;
	}(_primitiveStream.GeometryBuilderBase);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.PbrMaterial = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _renderer = __webpack_require__(3);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var VERTEX_SOURCE = '\nattribute vec3 POSITION, NORMAL;\nattribute vec2 TEXCOORD_0, TEXCOORD_1;\n\nuniform vec3 CAMERA_POSITION;\nuniform vec3 LIGHT_DIRECTION;\n\nvarying vec3 vLight; // Vector from vertex to light.\nvarying vec3 vView; // Vector from vertex to camera.\nvarying vec2 vTex;\n\n#ifdef USE_NORMAL_MAP\nattribute vec4 TANGENT;\nvarying mat3 vTBN;\n#else\nvarying vec3 vNorm;\n#endif\n\n#ifdef USE_VERTEX_COLOR\nattribute vec4 COLOR_0;\nvarying vec4 vCol;\n#endif\n\nvec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n  vec3 n = normalize(vec3(model * vec4(NORMAL, 0.0)));\n#ifdef USE_NORMAL_MAP\n  vec3 t = normalize(vec3(model * vec4(TANGENT.xyz, 0.0)));\n  vec3 b = cross(n, t) * TANGENT.w;\n  vTBN = mat3(t, b, n);\n#else\n  vNorm = n;\n#endif\n\n#ifdef USE_VERTEX_COLOR\n  vCol = COLOR_0;\n#endif\n\n  vTex = TEXCOORD_0;\n  vec4 mPos = model * vec4(POSITION, 1.0);\n  vLight = -LIGHT_DIRECTION;\n  vView = CAMERA_POSITION - mPos.xyz;\n  return proj * view * mPos;\n}';
	
	// These equations are borrowed with love from this docs from Epic because I
	// just don't have anything novel to bring to the PBR scene.
	// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
	var EPIC_PBR_FUNCTIONS = '\nvec3 lambertDiffuse(vec3 cDiff) {\n  return cDiff / M_PI;\n}\n\nfloat specD(float a, float nDotH) {\n  float aSqr = a * a;\n  float f = ((nDotH * nDotH) * (aSqr - 1.0) + 1.0);\n  return aSqr / (M_PI * f * f);\n}\n\nfloat specG(float roughness, float nDotL, float nDotV) {\n  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;\n  float gl = nDotL / (nDotL * (1.0 - k) + k);\n  float gv = nDotV / (nDotV * (1.0 - k) + k);\n  return gl * gv;\n}\n\nvec3 specF(float vDotH, vec3 F0) {\n  float exponent = (-5.55473 * vDotH - 6.98316) * vDotH;\n  float base = 2.0;\n  return F0 + (1.0 - F0) * pow(base, exponent);\n}';
	
	var FRAGMENT_SOURCE = '\n#define M_PI 3.14159265\n\nuniform vec4 baseColorFactor;\n#ifdef USE_BASE_COLOR_MAP\nuniform sampler2D baseColorTex;\n#endif\n\nvarying vec3 vLight;\nvarying vec3 vView;\nvarying vec2 vTex;\n\n#ifdef USE_VERTEX_COLOR\nvarying vec4 vCol;\n#endif\n\n#ifdef USE_NORMAL_MAP\nuniform sampler2D normalTex;\nvarying mat3 vTBN;\n#else\nvarying vec3 vNorm;\n#endif\n\n#ifdef USE_METAL_ROUGH_MAP\nuniform sampler2D metallicRoughnessTex;\n#endif\nuniform vec2 metallicRoughnessFactor;\n\n#ifdef USE_OCCLUSION\nuniform sampler2D occlusionTex;\nuniform float occlusionStrength;\n#endif\n\n#ifdef USE_EMISSIVE_TEXTURE\nuniform sampler2D emissiveTex;\n#endif\nuniform vec3 emissiveFactor;\n\nuniform vec3 LIGHT_COLOR;\n\nconst vec3 dielectricSpec = vec3(0.04);\nconst vec3 black = vec3(0.0);\n\n' + EPIC_PBR_FUNCTIONS + '\n\nvec4 fragment_main() {\n#ifdef USE_BASE_COLOR_MAP\n  vec4 baseColor = texture2D(baseColorTex, vTex) * baseColorFactor;\n#else\n  vec4 baseColor = baseColorFactor;\n#endif\n\n#ifdef USE_VERTEX_COLOR\n  baseColor *= vCol;\n#endif\n\n#ifdef USE_NORMAL_MAP\n  vec3 n = texture2D(normalTex, vTex).rgb;\n  n = normalize(vTBN * (2.0 * n - 1.0));\n#else\n  vec3 n = normalize(vNorm);\n#endif\n\n#ifdef FULLY_ROUGH\n  float metallic = 0.0;\n#else\n  float metallic = metallicRoughnessFactor.x;\n#endif\n\n  float roughness = metallicRoughnessFactor.y;\n\n#ifdef USE_METAL_ROUGH_MAP\n  vec4 metallicRoughness = texture2D(metallicRoughnessTex, vTex);\n  metallic *= metallicRoughness.b;\n  roughness *= metallicRoughness.g;\n#endif\n  \n  vec3 l = normalize(vLight);\n  vec3 v = normalize(vView);\n  vec3 h = normalize(l+v);\n\n  float nDotL = clamp(dot(n, l), 0.001, 1.0);\n  float nDotV = abs(dot(n, v)) + 0.001;\n  float nDotH = max(dot(n, h), 0.0);\n  float vDotH = max(dot(v, h), 0.0);\n\n  // From GLTF Spec\n  vec3 cDiff = mix(baseColor.rgb * (1.0 - dielectricSpec.r), black, metallic); // Diffuse color\n  vec3 F0 = mix(dielectricSpec, baseColor.rgb, metallic); // Specular color\n  float a = roughness * roughness;\n\n#ifdef FULLY_ROUGH\n  vec3 specular = F0 * 0.45;\n#else\n  vec3 F = specF(vDotH, F0);\n  float D = specD(a, nDotH);\n  float G = specG(roughness, nDotL, nDotV);\n  vec3 specular = (D * F * G) / (4.0 * nDotL * nDotV);\n#endif\n  float halfLambert = dot(n, l) * 0.5 + 0.5;\n  halfLambert *= halfLambert;\n\n  vec3 color = (halfLambert * LIGHT_COLOR * lambertDiffuse(cDiff)) + specular;\n\n#ifdef USE_OCCLUSION\n  float occlusion = texture2D(occlusionTex, vTex).r;\n  color = mix(color, color * occlusion, occlusionStrength);\n#endif\n  \n  vec3 emissive = emissiveFactor;\n#ifdef USE_EMISSIVE_TEXTURE\n  emissive *= texture2D(emissiveTex, vTex).rgb;\n#endif\n  color += emissive;\n\n  // gamma correction\n  color = pow(color, vec3(1.0/2.2));\n\n  return vec4(color, baseColor.a);\n}';
	
	var PbrMaterial = exports.PbrMaterial = function (_Material) {
	  _inherits(PbrMaterial, _Material);
	
	  function PbrMaterial() {
	    _classCallCheck(this, PbrMaterial);
	
	    var _this = _possibleConstructorReturn(this, (PbrMaterial.__proto__ || Object.getPrototypeOf(PbrMaterial)).call(this));
	
	    _this.base_color = _this.defineSampler("baseColorTex");
	    _this.metallic_roughness = _this.defineSampler("metallicRoughnessTex");
	    _this.normal = _this.defineSampler("normalTex");
	    _this.occlusion = _this.defineSampler("occlusionTex");
	    _this.emissive = _this.defineSampler("emissiveTex");
	
	    _this.base_color_factor = _this.defineUniform("baseColorFactor", [1.0, 1.0, 1.0, 1.0]);
	    _this.metallic_roughness_factor = _this.defineUniform("metallicRoughnessFactor", [1.0, 1.0]);
	    _this.occlusion_strength = _this.defineUniform("occlusionStrength", 1.0);
	    _this.emissive_factor = _this.defineUniform("emissiveFactor", [0, 0, 0]);
	    return _this;
	  }
	
	  _createClass(PbrMaterial, [{
	    key: 'getProgramDefines',
	    value: function getProgramDefines(render_primitive) {
	      var program_defines = {};
	
	      if (render_primitive._attribute_mask & _renderer.ATTRIB_MASK.COLOR_0) {
	        program_defines['USE_VERTEX_COLOR'] = 1;
	      }
	
	      if (render_primitive._attribute_mask & _renderer.ATTRIB_MASK.TEXCOORD_0) {
	        if (this.base_color.texture) {
	          program_defines['USE_BASE_COLOR_MAP'] = 1;
	        }
	
	        if (this.normal.texture && render_primitive._attribute_mask & _renderer.ATTRIB_MASK.TANGENT) {
	          program_defines['USE_NORMAL_MAP'] = 1;
	        }
	
	        if (this.metallic_roughness.texture) {
	          program_defines['USE_METAL_ROUGH_MAP'] = 1;
	        }
	
	        if (this.occlusion.texture) {
	          program_defines['USE_OCCLUSION'] = 1;
	        }
	
	        if (this.emissive.texture) {
	          program_defines['USE_EMISSIVE_TEXTURE'] = 1;
	        }
	      }
	
	      if ((!this.metallic_roughness.texture || !(render_primitive._attribute_mask & _renderer.ATTRIB_MASK.TEXCOORD_0)) && this.metallic_roughness_factor.value[1] == 1.0) {
	        program_defines['FULLY_ROUGH'] = 1;
	      }
	
	      return program_defines;
	    }
	  }, {
	    key: 'material_name',
	    get: function get() {
	      return 'PBR';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return VERTEX_SOURCE;
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return FRAGMENT_SOURCE;
	    }
	  }]);

	  return PbrMaterial;
	}(_material.Material);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ButtonNode = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _primitiveStream = __webpack_require__(7);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var GL = WebGLRenderingContext; // For enums
	var BUTTON_SIZE = 0.1;
	var BUTTON_CORNER_RADIUS = 0.025;
	var BUTTON_CORNER_SEGMENTS = 8;
	var BUTTON_ICON_SIZE = 0.07;
	var BUTTON_LAYER_DISTANCE = 0.005;
	var BUTTON_COLOR = 0.75;
	var BUTTON_ALPHA = 0.85;
	var BUTTON_HOVER_COLOR = 0.9;
	var BUTTON_HOVER_ALPHA = 1.0;
	var BUTTON_HOVER_SCALE = 1.1;
	var BUTTON_HOVER_TRANSITION_TIME_MS = 200;
	
	var ButtonMaterial = function (_Material) {
	  _inherits(ButtonMaterial, _Material);
	
	  function ButtonMaterial() {
	    _classCallCheck(this, ButtonMaterial);
	
	    var _this = _possibleConstructorReturn(this, (ButtonMaterial.__proto__ || Object.getPrototypeOf(ButtonMaterial)).call(this));
	
	    _this.state.blend = true;
	    //this.state.blend_func_src = GL.SRC_ALPHA;
	    //this.state.blend_func_dst = GL.ONE;
	
	    _this.defineUniform("hoverAmount", 0);
	    return _this;
	  }
	
	  _createClass(ButtonMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'BUTTON_MATERIAL';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec3 POSITION;\n\n    uniform float hoverAmount;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      float scale = mix(1.0, ' + BUTTON_HOVER_SCALE + ', hoverAmount);\n      vec4 pos = vec4(POSITION.x * scale, POSITION.y * scale, POSITION.z * (scale + (hoverAmount * 0.2)), 1.0);\n      return proj * view * model * pos;\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    uniform float hoverAmount;\n\n    const vec4 default_color = vec4(' + BUTTON_COLOR + ', ' + BUTTON_COLOR + ', ' + BUTTON_COLOR + ', ' + BUTTON_ALPHA + ');\n    const vec4 hover_color = vec4(' + BUTTON_HOVER_COLOR + ', ' + BUTTON_HOVER_COLOR + ', ' + BUTTON_HOVER_COLOR + ', ' + BUTTON_HOVER_ALPHA + ');\n\n    vec4 fragment_main() {\n      return mix(default_color, hover_color, hoverAmount);\n    }';
	    }
	  }]);
	
	  return ButtonMaterial;
	}(_material.Material);
	
	var ButtonIconMaterial = function (_Material2) {
	  _inherits(ButtonIconMaterial, _Material2);
	
	  function ButtonIconMaterial() {
	    _classCallCheck(this, ButtonIconMaterial);
	
	    var _this2 = _possibleConstructorReturn(this, (ButtonIconMaterial.__proto__ || Object.getPrototypeOf(ButtonIconMaterial)).call(this));
	
	    _this2.state.blend = true;
	
	    _this2.defineUniform("hoverAmount", 0);
	    _this2.icon = _this2.defineSampler("icon");
	    return _this2;
	  }
	
	  _createClass(ButtonIconMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'BUTTON_ICON_MATERIAL';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n\n    uniform float hoverAmount;\n\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vTexCoord = TEXCOORD_0;\n      float scale = mix(1.0, ' + BUTTON_HOVER_SCALE + ', hoverAmount);\n      vec4 pos = vec4(POSITION.x * scale, POSITION.y * scale, POSITION.z * (scale + (hoverAmount * 0.2)), 1.0);\n      return proj * view * model * pos;\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    uniform sampler2D icon;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(icon, vTexCoord);\n    }';
	    }
	  }]);
	
	  return ButtonIconMaterial;
	}(_material.Material);
	
	var ButtonNode = exports.ButtonNode = function (_Node) {
	  _inherits(ButtonNode, _Node);
	
	  function ButtonNode(icon_texture, callback) {
	    _classCallCheck(this, ButtonNode);
	
	    // All buttons are selectable by default.
	    var _this3 = _possibleConstructorReturn(this, (ButtonNode.__proto__ || Object.getPrototypeOf(ButtonNode)).call(this));
	
	    _this3.selectable = true;
	
	    _this3._select_handler = callback;
	    _this3._icon_texture = icon_texture;
	    _this3._hovered = false;
	    _this3._hover_t = 0;
	    return _this3;
	  }
	
	  _createClass(ButtonNode, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      var stream = new _primitiveStream.PrimitiveStream();
	
	      var hd = BUTTON_LAYER_DISTANCE * 0.5;
	
	      // Build a rounded rect for the background.
	      var hs = BUTTON_SIZE * 0.5;
	      var ihs = hs - BUTTON_CORNER_RADIUS;
	      stream.startGeometry();
	
	      // Rounded corners and sides
	      var segments = BUTTON_CORNER_SEGMENTS * 4;
	      for (var i = 0; i < segments; ++i) {
	        var rad = i * (Math.PI * 2.0 / segments);
	        var x = Math.cos(rad) * BUTTON_CORNER_RADIUS;
	        var y = Math.sin(rad) * BUTTON_CORNER_RADIUS;
	        var section = Math.floor(i / BUTTON_CORNER_SEGMENTS);
	        switch (section) {
	          case 0:
	            x += ihs;
	            y += ihs;
	            break;
	          case 1:
	            x -= ihs;
	            y += ihs;
	            break;
	          case 2:
	            x -= ihs;
	            y -= ihs;
	            break;
	          case 3:
	            x += ihs;
	            y -= ihs;
	            break;
	        }
	
	        stream.pushVertex(x, y, -hd, 0, 0, 0, 0, 1);
	
	        if (i > 1) {
	          stream.pushTriangle(0, i - 1, i);
	        }
	      }
	
	      stream.endGeometry();
	
	      var button_primitive = stream.finishPrimitive(renderer);
	      this._button_render_primitive = renderer.createRenderPrimitive(button_primitive, new ButtonMaterial());
	      this.addRenderPrimitive(this._button_render_primitive);
	
	      // Build a simple textured quad for the foreground.
	      hs = BUTTON_ICON_SIZE * 0.5;
	      stream.clear();
	      stream.startGeometry();
	
	      stream.pushVertex(-hs, hs, hd, 0, 0, 0, 0, 1);
	      stream.pushVertex(-hs, -hs, hd, 0, 1, 0, 0, 1);
	      stream.pushVertex(hs, -hs, hd, 1, 1, 0, 0, 1);
	      stream.pushVertex(hs, hs, hd, 1, 0, 0, 0, 1);
	
	      stream.pushTriangle(0, 1, 2);
	      stream.pushTriangle(0, 2, 3);
	
	      stream.endGeometry();
	
	      var icon_primitive = stream.finishPrimitive(renderer);
	      var icon_material = new ButtonIconMaterial();
	      icon_material.icon.texture = this._icon_texture;
	      this._icon_render_primitive = renderer.createRenderPrimitive(icon_primitive, icon_material);
	      this.addRenderPrimitive(this._icon_render_primitive);
	    }
	  }, {
	    key: 'onHoverStart',
	    value: function onHoverStart() {
	      this._hovered = true;
	    }
	  }, {
	    key: 'onHoverEnd',
	    value: function onHoverEnd() {
	      this._hovered = false;
	    }
	  }, {
	    key: '_updateHoverState',
	    value: function _updateHoverState() {
	      var t = this._hover_t / BUTTON_HOVER_TRANSITION_TIME_MS;
	      // Cubic Ease In/Out
	      // TODO: Get a better animation system
	      var hover_amount = t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	      this._button_render_primitive.uniforms.hoverAmount.value = hover_amount;
	      this._icon_render_primitive.uniforms.hoverAmount.value = hover_amount;
	    }
	  }, {
	    key: 'onUpdate',
	    value: function onUpdate(timestamp, frame_delta) {
	      if (this._hovered && this._hover_t < BUTTON_HOVER_TRANSITION_TIME_MS) {
	        this._hover_t = Math.min(BUTTON_HOVER_TRANSITION_TIME_MS, this._hover_t + frame_delta);
	        this._updateHoverState();
	      } else if (!this._hovered && this._hover_t > 0) {
	        this._hover_t = Math.max(0.0, this._hover_t - frame_delta);
	        this._updateHoverState();
	      }
	      // TODO: Animate hover state
	    }
	  }, {
	    key: 'icon_texture',
	    get: function get() {
	      return this._icon_texture;
	    },
	    set: function set(value) {
	      if (this._icon_texture == value) return;
	
	      this._icon_texture = value;
	      this._icon_render_primitive.samplers.icon.texture = value;
	    }
	  }]);

	  return ButtonNode;
	}(_node.Node);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.CubeSea = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _primitive = __webpack_require__(8);
	
	var _node = __webpack_require__(1);
	
	var _texture = __webpack_require__(6);
	
	var _boxBuilder = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var CubeSeaMaterial = function (_Material) {
	  _inherits(CubeSeaMaterial, _Material);
	
	  function CubeSeaMaterial() {
	    var heavy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	    _classCallCheck(this, CubeSeaMaterial);
	
	    var _this = _possibleConstructorReturn(this, (CubeSeaMaterial.__proto__ || Object.getPrototypeOf(CubeSeaMaterial)).call(this));
	
	    _this.heavy = heavy;
	
	    _this.base_color = _this.defineSampler("baseColor");
	    return _this;
	  }
	
	  _createClass(CubeSeaMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'CUBE_SEA';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    attribute vec3 NORMAL;\n\n    varying vec2 vTexCoord;\n    varying vec3 vLight;\n\n    const vec3 lightDir = vec3(0.75, 0.5, 1.0);\n    const vec3 ambientColor = vec3(0.5, 0.5, 0.5);\n    const vec3 lightColor = vec3(0.75, 0.75, 0.75);\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec3 normalRotated = vec3(model * vec4(NORMAL, 0.0));\n      float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);\n      vLight = ambientColor + (lightColor * lightFactor);\n      vTexCoord = TEXCOORD_0;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      if (!this.heavy) {
	        return '\n      precision mediump float;\n      uniform sampler2D baseColor;\n      varying vec2 vTexCoord;\n      varying vec3 vLight;\n\n      vec4 fragment_main() {\n        return vec4(vLight, 1.0) * texture2D(baseColor, vTexCoord);\n      }';
	      } else {
	        // Used when we want to stress the GPU a bit more.
	        // Stolen with love from https://www.clicktorelease.com/code/codevember-2016/4/
	        return '\n      precision mediump float;\n\n      uniform sampler2D diffuse;\n      varying vec2 vTexCoord;\n      varying vec3 vLight;\n\n      vec2 dimensions = vec2(64, 64);\n      float seed = 0.42;\n\n      vec2 hash( vec2 p ) {\n        p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));\n        return fract(sin(p)*18.5453);\n      }\n\n      vec3 hash3( vec2 p ) {\n          vec3 q = vec3( dot(p,vec2(127.1,311.7)),\n                 dot(p,vec2(269.5,183.3)),\n                 dot(p,vec2(419.2,371.9)) );\n        return fract(sin(q)*43758.5453);\n      }\n\n      float iqnoise( in vec2 x, float u, float v ) {\n        vec2 p = floor(x);\n        vec2 f = fract(x);\n        float k = 1.0+63.0*pow(1.0-v,4.0);\n        float va = 0.0;\n        float wt = 0.0;\n        for( int j=-2; j<=2; j++ )\n          for( int i=-2; i<=2; i++ ) {\n            vec2 g = vec2( float(i),float(j) );\n            vec3 o = hash3( p + g )*vec3(u,u,1.0);\n            vec2 r = g - f + o.xy;\n            float d = dot(r,r);\n            float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\n            va += o.z*ww;\n            wt += ww;\n          }\n        return va/wt;\n      }\n\n      // return distance, and cell id\n      vec2 voronoi( in vec2 x ) {\n        vec2 n = floor( x );\n        vec2 f = fract( x );\n        vec3 m = vec3( 8.0 );\n        for( int j=-1; j<=1; j++ )\n          for( int i=-1; i<=1; i++ ) {\n            vec2  g = vec2( float(i), float(j) );\n            vec2  o = hash( n + g );\n            vec2  r = g - f + (0.5+0.5*sin(seed+6.2831*o));\n            float d = dot( r, r );\n            if( d<m.x )\n              m = vec3( d, o );\n          }\n        return vec2( sqrt(m.x), m.y+m.z );\n      }\n\n      vec4 fragment_main() {\n        vec2 uv = ( vTexCoord );\n        uv *= vec2( 10., 10. );\n        uv += seed;\n        vec2 p = 0.5 - 0.5*sin( 0.*vec2(1.01,1.71) );\n\n        vec2 c = voronoi( uv );\n        vec3 col = vec3( c.y / 2. );\n\n        float f = iqnoise( 1. * uv + c.y, p.x, p.y );\n        col *= 1.0 + .25 * vec3( f );\n\n        return vec4(vLight, 1.0) * texture2D(diffuse, vTexCoord) * vec4( col, 1. );\n      }';
	      }
	    }
	  }]);
	
	  return CubeSeaMaterial;
	}(_material.Material);
	
	var CubeSea = exports.CubeSea = function (_Node) {
	  _inherits(CubeSea, _Node);
	
	  function CubeSea() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	    _classCallCheck(this, CubeSea);
	
	    // Test variables
	    // If true, use a very heavyweight shader to stress the GPU.
	    var _this2 = _possibleConstructorReturn(this, (CubeSea.__proto__ || Object.getPrototypeOf(CubeSea)).call(this));
	
	    _this2.heavy_gpu = !!options.heavy_gpu;
	
	    // Number and size of the static cubes. Warning, large values
	    // don't render right due to overflow of the int16 indices.
	    _this2.cube_count = options.cube_count || (_this2.heavy_gpu ? 12 : 10);
	    _this2.cube_scale = options.cube_scale || 1.0;
	
	    // Draw only half the world cubes. Helps test variable render cost
	    // when combined with heavyGpu.
	    _this2.half_only = !!options.half_only;
	
	    // Automatically spin the world cubes. Intended for automated testing,
	    // not recommended for viewing in a headset.
	    _this2.auto_rotate = !!options.auto_rotate;
	
	    _this2._texture = new _texture.UrlTexture(options.image_url || 'media/textures/cube-sea.png');
	
	    _this2._material = new CubeSeaMaterial(_this2.heavy_gpu);
	    _this2._material.base_color.texture = _this2._texture;
	
	    _this2._render_primitive = null;
	    return _this2;
	  }
	
	  _createClass(CubeSea, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      this._render_primitive = null;
	
	      var box_builder = new _boxBuilder.BoxBuilder();
	
	      // Build the spinning "hero" cubes
	      box_builder.pushCube([0, 0.25, -0.8], 0.1);
	      box_builder.pushCube([0.8, 0.25, 0], 0.1);
	      box_builder.pushCube([0, 0.25, 0.8], 0.1);
	      box_builder.pushCube([-0.8, 0.25, 0], 0.1);
	
	      var hero_primitive = box_builder.finishPrimitive(renderer);
	
	      this.hero_node = renderer.createMesh(hero_primitive, this._material);
	
	      this.rebuildCubes(box_builder);
	
	      this.cube_sea_node = new _node.Node();
	      this.cube_sea_node.addRenderPrimitive(this._render_primitive);
	
	      this.addNode(this.cube_sea_node);
	      this.addNode(this.hero_node);
	
	      return this.waitForComplete();
	    }
	  }, {
	    key: 'rebuildCubes',
	    value: function rebuildCubes(box_builder) {
	      if (!this._renderer) return;
	
	      if (!box_builder) box_builder = new _boxBuilder.BoxBuilder();else box_builder.clear();
	
	      var size = 0.4 * this.cube_scale;
	
	      // Build the cube sea
	      var half_grid = this.cube_count * 0.5;
	      for (var x = 0; x < this.cube_count; ++x) {
	        for (var y = 0; y < this.cube_count; ++y) {
	          for (var z = 0; z < this.cube_count; ++z) {
	            var pos = [x - half_grid, y - half_grid, z - half_grid];
	            // Only draw cubes on one side. Useful for testing variable render
	            // cost that depends on view direction.
	            if (this.half_only && pos[0] < 0) continue;
	
	            // Don't place a cube in the center of the grid.
	            if (pos[0] == 0 && pos[1] == 0 && pos[2] == 0) continue;
	
	            box_builder.pushCube(pos, size);
	          }
	        }
	      }
	
	      if (this.cube_count > 12) {
	        // Each cube has 6 sides with 2 triangles and 3 indices per triangle, so
	        // the total number of indices needed is cube_count^3 * 36. This exceeds
	        // the short index range past 12 cubes.
	        box_builder.index_type = 5125; // gl.UNSIGNED_INT
	      }
	      var cube_sea_primitive = box_builder.finishPrimitive(this._renderer);
	
	      if (!this._render_primitive) {
	        this._render_primitive = this._renderer.createRenderPrimitive(cube_sea_primitive, this._material);
	      } else {
	        this._render_primitive.setPrimitive(cube_sea_primitive);
	      }
	    }
	  }, {
	    key: 'onUpdate',
	    value: function onUpdate(timestamp, frame_delta) {
	      if (this.auto_rotate) {
	        mat4.fromRotation(this.cube_sea_node.matrix, timestamp / 500, [0, -1, 0]);
	      }
	      mat4.fromRotation(this.hero_node.matrix, timestamp / 2000, [0, 1, 0]);
	    }
	  }]);

	  return CubeSea;
	}(_node.Node);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.VideoNode = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _primitive = __webpack_require__(8);
	
	var _node = __webpack_require__(1);
	
	var _texture = __webpack_require__(6);
	
	var _buttonNode = __webpack_require__(11);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	/*
	Node for displaying 2D or stereo videos on a quad.
	*/
	
	var GL = WebGLRenderingContext; // For enums
	
	var VideoMaterial = function (_Material) {
	  _inherits(VideoMaterial, _Material);
	
	  function VideoMaterial() {
	    _classCallCheck(this, VideoMaterial);
	
	    var _this = _possibleConstructorReturn(this, (VideoMaterial.__proto__ || Object.getPrototypeOf(VideoMaterial)).call(this));
	
	    _this.image = _this.defineSampler("diffuse");
	
	    _this.tex_coord_scale_offset = _this.defineUniform("texCoordScaleOffset", [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0], 4);
	    return _this;
	  }
	
	  _createClass(VideoMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'VIDEO_PLAYER';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    uniform int EYE_INDEX;\n    uniform vec4 texCoordScaleOffset[2];\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];\n      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;\n      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);\n      return out_vec;\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(diffuse, vTexCoord);\n    }';
	    }
	  }]);
	
	  return VideoMaterial;
	}(_material.Material);
	
	var VideoNode = exports.VideoNode = function (_Node) {
	  _inherits(VideoNode, _Node);
	
	  function VideoNode(options) {
	    _classCallCheck(this, VideoNode);
	
	    var _this2 = _possibleConstructorReturn(this, (VideoNode.__proto__ || Object.getPrototypeOf(VideoNode)).call(this));
	
	    _this2._video = options.video;
	    _this2._display_mode = options.display_mode || "mono";
	
	    _this2._video_texture = new _texture.VideoTexture(_this2._video);
	    return _this2;
	  }
	
	  _createClass(VideoNode, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      var vertices = [-1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, -1.0, -1.0, 0.0, 0.0, 1.0];
	      var indices = [0, 2, 1, 0, 3, 2];
	
	      var vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
	      var index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
	
	      var attribs = [new _primitive.PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 20, 0), new _primitive.PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 20, 12)];
	
	      var primitive = new _primitive.Primitive(attribs, indices.length);
	      primitive.setIndexBuffer(index_buffer);
	      primitive.setBounds([-1.0, -1.0, 0.0], [1.0, 1.0, 0.015]);
	
	      var material = new VideoMaterial();
	      material.image.texture = this._video_texture;
	
	      switch (this._display_mode) {
	        case "mono":
	          material.tex_coord_scale_offset.value = [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0];
	          break;
	        case "stereoTopBottom":
	          material.tex_coord_scale_offset.value = [1.0, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 0.5];
	          break;
	        case "stereoLeftRight":
	          material.tex_coord_scale_offset.value = [0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.5, 0.0];
	          break;
	      }
	
	      var render_primitive = renderer.createRenderPrimitive(primitive, material);
	      this.addRenderPrimitive(render_primitive);
	    }
	  }, {
	    key: 'aspectRatio',
	    get: function get() {
	      var width = this._video.videoWidth;
	      var height = this._video.videoHeight;
	
	      switch (this._display_mode) {
	        case 'stereoTopBottom':
	          height *= 0.5;break;
	        case 'stereoLeftRight':
	          width *= 0.5;break;
	      }
	
	      if (!height || !width) {
	        return 1;
	      }
	
	      return width / height;
	    }
	  }]);

	  return VideoNode;
	}(_node.Node);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Scene = exports.WebXRView = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _renderer = __webpack_require__(3);
	
	var _boundsRenderer = __webpack_require__(15);
	
	var _inputRenderer = __webpack_require__(16);
	
	var _skybox = __webpack_require__(17);
	
	var _statsViewer = __webpack_require__(18);
	
	var _program = __webpack_require__(5);
	
	var _node = __webpack_require__(1);
	
	var _gltf = __webpack_require__(20);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var WebXRView = exports.WebXRView = function (_RenderView) {
	  _inherits(WebXRView, _RenderView);
	
	  function WebXRView(view, pose, layer) {
	    _classCallCheck(this, WebXRView);
	
	    return _possibleConstructorReturn(this, (WebXRView.__proto__ || Object.getPrototypeOf(WebXRView)).call(this, view ? view.projectionMatrix : null, pose && view ? pose.getViewMatrix(view) : null, layer && view ? layer.getViewport(view) : null, view ? view.eye : 'left'));
	  }
	
	  return WebXRView;
	}(_renderer.RenderView);
	
	var Scene = exports.Scene = function (_Node) {
	  _inherits(Scene, _Node);
	
	  function Scene() {
	    _classCallCheck(this, Scene);
	
	    var _this2 = _possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).call(this));
	
	    _this2._timestamp = -1;
	    _this2._frame_delta = 0;
	    _this2._stats_standing = false;
	    _this2._stats = null;
	    _this2._stats_enabled = false;
	    _this2.enableStats(true); // Ensure the stats are added correctly by default.
	    _this2._stage_bounds = null;
	    _this2._bounds_renderer = null;
	
	    _this2._input_renderer = null;
	    _this2._reset_input_end_frame = true;
	
	    _this2._skybox = null;
	    _this2._gltf2_loader = null;
	
	    _this2._last_timestamp = 0;
	
	    _this2._hover_frame = 0;
	    _this2._hovered_nodes = [];
	    return _this2;
	  }
	
	  _createClass(Scene, [{
	    key: 'setRenderer',
	    value: function setRenderer(renderer) {
	      // Set up a non-black clear color so that we can see if something renders
	      // wrong.
	      renderer.gl.clearColor(0.1, 0.2, 0.3, 1.0);
	
	      this._gltf2_loader = new _gltf.GLTF2Loader(renderer);
	
	      this._setRenderer(renderer);
	    }
	  }, {
	    key: 'setSkybox',
	    value: function setSkybox(image_url) {
	      if (this._skybox) {
	        this.removeNode(this._skybox);
	        this._skybox = null;
	      }
	      if (image_url) {
	        this._skybox = new _skybox.Skybox(image_url);
	        this.addNode(this._skybox);
	
	        if (this._renderer) this._skybox.setRenderer(this._renderer);
	      }
	    }
	  }, {
	    key: 'loseRenderer',
	    value: function loseRenderer() {
	      if (this._renderer) {
	        this._stats = null;
	        this.texture_loader = null;
	        this._renderer = null;
	        this._input_renderer = null;
	      }
	    }
	  }, {
	    key: 'updateInputSources',
	
	
	    // Helper function that automatically adds the appropriate visual elements for
	    // all input sources.
	    value: function updateInputSources(frame, frame_of_ref) {
	      // FIXME: Check for the existence of the API first. This check should be
	      // removed once the input API is part of the official spec.
	      if (!frame.session.getInputSources) return;
	
	      var input_sources = frame.session.getInputSources();
	
	      var new_hovered_nodes = [];
	      var last_hover_frame = this._hover_frame;
	      this._hover_frame++;
	
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;
	
	      try {
	        for (var _iterator = input_sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var input_source = _step.value;
	
	          var input_pose = frame.getInputPose(input_source, frame_of_ref);
	
	          if (!input_pose) {
	            continue;
	          }
	
	          // Any time that we have a grip matrix, we'll render a controller.
	          if (input_pose.gripMatrix) {
	            this.inputRenderer.addController(input_pose.gripMatrix);
	          }
	
	          if (input_pose.pointerMatrix) {
	            if (input_source.pointerOrigin == "hand") {
	              // If we have a pointer matrix and the pointer origin is the users
	              // hand (as opposed to their head or the screen) use it to render
	              // a ray coming out of the input device to indicate the pointer
	              // direction.
	              this.inputRenderer.addLaserPointer(input_pose.pointerMatrix);
	            }
	
	            // If we have a pointer matrix we can also use it to render a cursor
	            // for both handheld and gaze-based input sources.
	
	            // Check and see if the pointer is pointing at any selectable objects.
	            var hit_result = this.hitTest(input_pose.pointerMatrix);
	
	            if (hit_result) {
	              // Render a cursor at the intersection point.
	              this.inputRenderer.addCursor(hit_result.intersection);
	
	              if (hit_result.node._hover_frame_id != last_hover_frame) {
	                hit_result.node.onHoverStart();
	              }
	              hit_result.node._hover_frame_id = this._hover_frame;
	              new_hovered_nodes.push(hit_result.node);
	            } else {
	              // Statically render the cursor 1 meters down the ray since we didn't
	              // hit anything selectable.
	              var cursor_pos = vec3.fromValues(0, 0, -1.0);
	              vec3.transformMat4(cursor_pos, cursor_pos, input_pose.pointerMatrix);
	              this.inputRenderer.addCursor(cursor_pos);
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = this._hovered_nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var hover_node = _step2.value;
	
	          if (hover_node._hover_frame_id != this._hover_frame) {
	            hover_node.onHoverEnd();
	          }
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      this._hovered_nodes = new_hovered_nodes;
	    }
	  }, {
	    key: 'handleSelect',
	    value: function handleSelect(input_source, frame, frame_of_ref) {
	      var input_pose = frame.getInputPose(input_source, frame_of_ref);
	
	      if (!input_pose) {
	        return;
	      }
	
	      this.handleSelectPointer(input_pose.pointerMatrix);
	    }
	  }, {
	    key: 'handleSelectPointer',
	    value: function handleSelectPointer(pointer_matrix) {
	      if (pointer_matrix) {
	        // Check and see if the pointer is pointing at any selectable objects.
	        var hit_result = this.hitTest(pointer_matrix);
	
	        if (hit_result) {
	          // Render a cursor at the intersection point.
	          hit_result.node.handleSelect();
	        }
	      }
	    }
	  }, {
	    key: 'enableStats',
	    value: function enableStats(enable) {
	      if (enable == this._stats_enabled) return;
	
	      this._stats_enabled = enable;
	
	      if (enable) {
	        this._stats = new _statsViewer.StatsViewer();
	        this._stats.selectable = true;
	        this.addNode(this._stats);
	
	        if (this._stats_standing) {
	          this._stats.translation = [0, 1.4, -0.75];
	        } else {
	          this._stats.translation = [0, -0.3, -0.5];
	        }
	        this._stats.scale = [0.3, 0.3, 0.3];
	        quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
	      } else if (!enable) {
	        if (this._stats) {
	          this.removeNode(this._stats);
	          this._stats = null;
	        }
	      }
	    }
	  }, {
	    key: 'standingStats',
	    value: function standingStats(enable) {
	      this._stats_standing = enable;
	      if (this._stats) {
	        if (this._stats_standing) {
	          this._stats.translation = [0, 1.4, -0.75];
	        } else {
	          this._stats.translation = [0, -0.3, -0.5];
	        }
	        this._stats.scale = [0.3, 0.3, 0.3];
	        quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
	      }
	    }
	  }, {
	    key: 'setBounds',
	    value: function setBounds(stage_bounds) {
	      this._stage_bounds = stage_bounds;
	      if (stage_bounds && !this._bounds_renderer) {
	        this._bounds_renderer = new _boundsRenderer.BoundsRenderer();
	        this.addNode(this._bounds_renderer);
	      }
	      if (this._bounds_renderer) {
	        this._bounds_renderer.stage_bounds = stage_bounds;
	      }
	    }
	  }, {
	    key: 'draw',
	    value: function draw(projection_mat, view_mat, eye) {
	      var view = new _renderer.RenderView();
	      view.projection_matrix = projection_mat;
	      view.view_matrix = view_mat;
	      if (eye) {
	        view.eye = eye;
	      }
	
	      this.drawViewArray([view]);
	    }
	
	    /** Draws the scene into the base layer of the XRFrame's session */
	
	  }, {
	    key: 'drawXRFrame',
	    value: function drawXRFrame(xr_frame, pose) {
	      if (!this._renderer || !pose) {
	        return;
	      }
	
	      var gl = this._renderer.gl;
	      var session = xr_frame.session;
	      // Assumed to be a XRWebGLLayer for now.
	      var layer = session.baseLayer;
	
	      if (!gl) {
	        return;
	      }
	
	      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	      var views = [];
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;
	
	      try {
	        for (var _iterator3 = xr_frame.views[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var view = _step3.value;
	
	          views.push(new WebXRView(view, pose, layer));
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	
	      this.drawViewArray(views);
	    }
	  }, {
	    key: 'drawViewArray',
	    value: function drawViewArray(views) {
	      // Don't draw when we don't have a valid context
	      if (!this._renderer) return;
	
	      this._renderer.drawViews(views, this);
	    }
	  }, {
	    key: 'startFrame',
	    value: function startFrame() {
	      var prev_timestamp = this._timestamp;
	      this._timestamp = performance.now();
	      if (this._stats) {
	        this._stats.begin();
	      }
	
	      if (prev_timestamp >= 0) {
	        this._frame_delta = this._timestamp - prev_timestamp;
	      } else {
	        this._frame_delta = 0;
	      }
	
	      this._update(this._timestamp, this._frame_delta);
	
	      return this._frame_delta;
	    }
	  }, {
	    key: 'endFrame',
	    value: function endFrame() {
	      if (this._input_renderer && this._reset_input_end_frame) {
	        this._input_renderer.reset();
	      }
	
	      if (this._stats) {
	        this._stats.end();
	      }
	    }
	
	    // Override to load scene resources on construction or context restore.
	
	  }, {
	    key: 'onLoadScene',
	    value: function onLoadScene(renderer) {
	      return Promise.resolve();
	    }
	  }, {
	    key: 'gltf2Loader',
	    get: function get() {
	      return this._gltf2_loader;
	    }
	  }, {
	    key: 'inputRenderer',
	    get: function get() {
	      if (!this._input_renderer) {
	        this._input_renderer = new _inputRenderer.InputRenderer();
	        this.addNode(this._input_renderer);
	      }
	      return this._input_renderer;
	    }
	  }]);

	  return Scene;
	}(_node.Node);

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BoundsRenderer = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _primitive = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	/*
	This file renders a passed in XRStageBounds object and attempts
	to render geometry on the floor to indicate where the bounds is.
	XRStageBounds' `geometry` is a series of XRStageBoundsPoints (in
	clockwise-order) with `x` and `z` properties for each.
	*/
	
	var GL = WebGLRenderingContext; // For enums
	
	var BoundsMaterial = function (_Material) {
	  _inherits(BoundsMaterial, _Material);
	
	  function BoundsMaterial() {
	    _classCallCheck(this, BoundsMaterial);
	
	    var _this = _possibleConstructorReturn(this, (BoundsMaterial.__proto__ || Object.getPrototypeOf(BoundsMaterial)).call(this));
	
	    _this.state.blend = true;
	    _this.state.blend_func_src = GL.SRC_ALPHA;
	    _this.state.blend_func_dst = GL.ONE;
	    _this.state.depth_test = false;
	    return _this;
	  }
	
	  _createClass(BoundsMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'BOUNDS_RENDERER';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec2 POSITION;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    precision mediump float;\n\n    vec4 fragment_main() {\n      return vec4(0.0, 1.0, 0.0, 0.3);\n    }';
	    }
	  }]);
	
	  return BoundsMaterial;
	}(_material.Material);
	
	var BoundsRenderer = exports.BoundsRenderer = function (_Node) {
	  _inherits(BoundsRenderer, _Node);
	
	  function BoundsRenderer() {
	    _classCallCheck(this, BoundsRenderer);
	
	    var _this2 = _possibleConstructorReturn(this, (BoundsRenderer.__proto__ || Object.getPrototypeOf(BoundsRenderer)).call(this));
	
	    _this2._stage_bounds = null;
	    return _this2;
	  }
	
	  _createClass(BoundsRenderer, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      this.stage_bounds = this._stage_bounds;
	    }
	  }, {
	    key: 'stage_bounds',
	    get: function get() {
	      return this._stage_bounds;
	    },
	    set: function set(stage_bounds) {
	      if (this._stage_bounds) {
	        this.clearRenderPrimitives();
	      }
	      this._stage_bounds = stage_bounds;
	      if (!stage_bounds || stage_bounds.length === 0 || !this._renderer) {
	        return;
	      }
	
	      var verts = [];
	      var indices = [];
	
	      // Tessellate the bounding points from XRStageBounds and connect
	      // each point to a neighbor and 0,0,0.
	      var point_count = stage_bounds.geometry.length;
	      for (var i = 0; i < point_count; i++) {
	        var point = stage_bounds.geometry[i];
	        verts.push(point.x, 0, point.z);
	        indices.push(i, i === 0 ? point_count - 1 : i - 1, point_count);
	      }
	      // Center point
	      verts.push(0, 0, 0);
	
	      var vertex_buffer = this._renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(verts));
	      var index_buffer = this._renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
	
	      var attribs = [new _primitive.PrimitiveAttribute("POSITION", vertex_buffer, 3, gl.FLOAT, 12, 0)];
	
	      var primitive = new _primitive.Primitive(attribs, indices.length);
	      primitive.setIndexBuffer(index_buffer);
	
	      var render_primitive = this._renderer.createRenderPrimitive(primitive, new BoundsMaterial());
	      this.addRenderPrimitive(render_primitive);
	    }
	  }]);

	  return BoundsRenderer;
	}(_node.Node);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.InputRenderer = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _primitive = __webpack_require__(8);
	
	var _texture = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var GL = WebGLRenderingContext; // For enums
	
	// Laser texture data, 48x1 RGBA (not premultiplied alpha). This represents a
	// "cross section" of the laser beam with a bright core and a feathered edge.
	// Borrowed from Chromium source code.
	var LASER_TEXTURE_DATA = new Uint8Array([0xff, 0xff, 0xff, 0x01, 0xff, 0xff, 0xff, 0x02, 0xbf, 0xbf, 0xbf, 0x04, 0xcc, 0xcc, 0xcc, 0x05, 0xdb, 0xdb, 0xdb, 0x07, 0xcc, 0xcc, 0xcc, 0x0a, 0xd8, 0xd8, 0xd8, 0x0d, 0xd2, 0xd2, 0xd2, 0x11, 0xce, 0xce, 0xce, 0x15, 0xce, 0xce, 0xce, 0x1a, 0xce, 0xce, 0xce, 0x1f, 0xcd, 0xcd, 0xcd, 0x24, 0xc8, 0xc8, 0xc8, 0x2a, 0xc9, 0xc9, 0xc9, 0x2f, 0xc9, 0xc9, 0xc9, 0x34, 0xc9, 0xc9, 0xc9, 0x39, 0xc9, 0xc9, 0xc9, 0x3d, 0xc8, 0xc8, 0xc8, 0x41, 0xcb, 0xcb, 0xcb, 0x44, 0xee, 0xee, 0xee, 0x87, 0xfa, 0xfa, 0xfa, 0xc8, 0xf9, 0xf9, 0xf9, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xfa, 0xfa, 0xfa, 0xc9, 0xfa, 0xfa, 0xfa, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xfa, 0xfa, 0xfa, 0xc8, 0xee, 0xee, 0xee, 0x87, 0xcb, 0xcb, 0xcb, 0x44, 0xc8, 0xc8, 0xc8, 0x41, 0xc9, 0xc9, 0xc9, 0x3d, 0xc9, 0xc9, 0xc9, 0x39, 0xc9, 0xc9, 0xc9, 0x34, 0xc9, 0xc9, 0xc9, 0x2f, 0xc8, 0xc8, 0xc8, 0x2a, 0xcd, 0xcd, 0xcd, 0x24, 0xce, 0xce, 0xce, 0x1f, 0xce, 0xce, 0xce, 0x1a, 0xce, 0xce, 0xce, 0x15, 0xd2, 0xd2, 0xd2, 0x11, 0xd8, 0xd8, 0xd8, 0x0d, 0xcc, 0xcc, 0xcc, 0x0a, 0xdb, 0xdb, 0xdb, 0x07, 0xcc, 0xcc, 0xcc, 0x05, 0xbf, 0xbf, 0xbf, 0x04, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff, 0x01]);
	
	var LASER_LENGTH = 1.0;
	var LASER_DIAMETER = 0.01;
	var LASER_FADE_END = 0.535;
	var LASER_FADE_POINT = 0.5335;
	var LASER_DEFAULT_COLOR = [1.0, 1.0, 1.0, 0.25];
	
	var CURSOR_RADIUS = 0.004;
	var CURSOR_SHADOW_RADIUS = 0.007;
	var CURSOR_SHADOW_INNER_LUMINANCE = 0.5;
	var CURSOR_SHADOW_OUTER_LUMINANCE = 0.0;
	var CURSOR_SHADOW_INNER_OPACITY = 0.75;
	var CURSOR_SHADOW_OUTER_OPACITY = 0.0;
	var CURSOR_OPACITY = 0.9;
	var CURSOR_SEGMENTS = 16;
	var CURSOR_DEFAULT_COLOR = [1.0, 1.0, 1.0, 1.0];
	var CURSOR_DEFAULT_HIDDEN_COLOR = [0.5, 0.5, 0.5, 0.25];
	
	var DEFAULT_RESET_OPTIONS = {
	  controllers: true,
	  lasers: true,
	  cursors: true
	};
	
	var LaserMaterial = function (_Material) {
	  _inherits(LaserMaterial, _Material);
	
	  function LaserMaterial() {
	    _classCallCheck(this, LaserMaterial);
	
	    var _this = _possibleConstructorReturn(this, (LaserMaterial.__proto__ || Object.getPrototypeOf(LaserMaterial)).call(this));
	
	    _this.render_order = _material.RENDER_ORDER.ADDITIVE;
	    _this.state.cull_face = false;
	    _this.state.blend = true;
	    _this.state.blend_func_src = GL.ONE;
	    _this.state.blend_func_dst = GL.ONE;
	    _this.state.depth_mask = false;
	
	    _this.laser = _this.defineSampler("diffuse");
	    _this.laser.texture = new _texture.DataTexture(LASER_TEXTURE_DATA, 48, 1);
	    _this.laser_color = _this.defineUniform("laserColor", LASER_DEFAULT_COLOR);
	    return _this;
	  }
	
	  _createClass(LaserMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'INPUT_LASER';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vTexCoord = TEXCOORD_0;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    precision mediump float;\n\n    uniform vec4 laserColor;\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    const float fade_point = ' + LASER_FADE_POINT + ';\n    const float fade_end = ' + LASER_FADE_END + ';\n\n    vec4 fragment_main() {\n      vec2 uv = vTexCoord;\n      float front_fade_factor = 1.0 - clamp(1.0 - (uv.y - fade_point) / (1.0 - fade_point), 0.0, 1.0);\n      float back_fade_factor = clamp((uv.y - fade_point) / (fade_end - fade_point), 0.0, 1.0);\n      vec4 color = laserColor * texture2D(diffuse, vTexCoord);\n      float opacity = color.a * front_fade_factor * back_fade_factor;\n      return vec4(color.rgb * opacity, opacity);\n    }';
	    }
	  }]);
	
	  return LaserMaterial;
	}(_material.Material);
	
	var CURSOR_VERTEX_SHADER = '\nattribute vec4 POSITION;\n\nvarying float vLuminance;\nvarying float vOpacity;\n\nvec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n  vLuminance = POSITION.z;\n  vOpacity = POSITION.w;\n\n  // Billboarded, constant size vertex transform.\n  vec4 screenPos = proj * view * model * vec4(0.0, 0.0, 0.0, 1.0);\n  screenPos /= screenPos.w;\n  screenPos.xy += POSITION.xy;\n  return screenPos;\n}';
	
	var CURSOR_FRAGMENT_SHADER = '\nprecision mediump float;\n\nuniform vec4 cursorColor;\nvarying float vLuminance;\nvarying float vOpacity;\n\nvec4 fragment_main() {\n  vec3 color = cursorColor.rgb * vLuminance;\n  float opacity = cursorColor.a * vOpacity;\n  return vec4(color * opacity, opacity);\n}';
	
	// Cursors are drawn as billboards that always face the camera and are rendered
	// as a fixed size no matter how far away they are.
	
	var CursorMaterial = function (_Material2) {
	  _inherits(CursorMaterial, _Material2);
	
	  function CursorMaterial() {
	    _classCallCheck(this, CursorMaterial);
	
	    var _this2 = _possibleConstructorReturn(this, (CursorMaterial.__proto__ || Object.getPrototypeOf(CursorMaterial)).call(this));
	
	    _this2.render_order = _material.RENDER_ORDER.ADDITIVE;
	    _this2.state.cull_face = false;
	    _this2.state.blend = true;
	    _this2.state.blend_func_src = GL.ONE;
	    _this2.state.depth_mask = false;
	
	    _this2.cursor_color = _this2.defineUniform("cursorColor", CURSOR_DEFAULT_COLOR);
	    return _this2;
	  }
	
	  _createClass(CursorMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'INPUT_CURSOR';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return CURSOR_VERTEX_SHADER;
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return CURSOR_FRAGMENT_SHADER;
	    }
	  }]);
	
	  return CursorMaterial;
	}(_material.Material);
	
	var CursorHiddenMaterial = function (_Material3) {
	  _inherits(CursorHiddenMaterial, _Material3);
	
	  function CursorHiddenMaterial() {
	    _classCallCheck(this, CursorHiddenMaterial);
	
	    var _this3 = _possibleConstructorReturn(this, (CursorHiddenMaterial.__proto__ || Object.getPrototypeOf(CursorHiddenMaterial)).call(this));
	
	    _this3.render_order = _material.RENDER_ORDER.ADDITIVE;
	    _this3.state.cull_face = false;
	    _this3.state.blend = true;
	    _this3.state.blend_func_src = GL.ONE;
	    _this3.state.depth_func = GL.GEQUAL;
	    _this3.state.depth_mask = false;
	
	    _this3.cursor_color = _this3.defineUniform("cursorColor", CURSOR_DEFAULT_HIDDEN_COLOR);
	    return _this3;
	  }
	
	  // TODO: Rename to "program_name"
	
	
	  _createClass(CursorHiddenMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'INPUT_CURSOR_2';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return CURSOR_VERTEX_SHADER;
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return CURSOR_FRAGMENT_SHADER;
	    }
	  }]);
	
	  return CursorHiddenMaterial;
	}(_material.Material);
	
	var InputRenderer = exports.InputRenderer = function (_Node) {
	  _inherits(InputRenderer, _Node);
	
	  function InputRenderer() {
	    _classCallCheck(this, InputRenderer);
	
	    var _this4 = _possibleConstructorReturn(this, (InputRenderer.__proto__ || Object.getPrototypeOf(InputRenderer)).call(this));
	
	    _this4._max_input_elements = 32;
	
	    _this4._controllers = [];
	    _this4._controller_node = null;
	    _this4._controller_node_handedness = null;
	    _this4._lasers = null;
	    _this4._cursors = null;
	
	    _this4._active_controllers = 0;
	    _this4._active_lasers = 0;
	    _this4._active_cursors = 0;
	    return _this4;
	  }
	
	  _createClass(InputRenderer, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      this._controllers = [];
	      this._controller_node = null;
	      this._controller_node_handedness = null;
	      this._lasers = null;
	      this._cursors = null;
	
	      this._active_controllers = 0;
	      this._active_lasers = 0;
	      this._active_cursors = 0;
	    }
	  }, {
	    key: 'setControllerMesh',
	    value: function setControllerMesh(controller_node) {
	      var handedness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'right';
	
	      this._controller_node = controller_node;
	      this._controller_node_handedness = handedness;
	    }
	  }, {
	    key: 'addController',
	    value: function addController(grip_matrix) {
	      if (!this._controller_node) {
	        return;
	      }
	
	      var controller = null;
	      if (this._active_controllers < this._controllers.length) {
	        controller = this._controllers[this._active_controllers];
	      } else {
	        controller = this._controller_node.clone();
	        this.addNode(controller);
	        this._controllers.push(controller);
	      }
	      this._active_controllers = (this._active_controllers + 1) % this._max_input_elements;
	
	      controller.matrix = grip_matrix;
	      controller.visible = true;
	    }
	  }, {
	    key: 'addLaserPointer',
	    value: function addLaserPointer(pointer_matrix) {
	      // Create the laser pointer mesh if needed.
	      if (!this._lasers && this._renderer) {
	        this._lasers = [this._createLaserMesh()];
	        this.addNode(this._lasers[0]);
	      }
	
	      var laser = null;
	      if (this._active_lasers < this._lasers.length) {
	        laser = this._lasers[this._active_lasers];
	      } else {
	        laser = this._lasers[0].clone();
	        this.addNode(laser);
	        this._lasers.push(laser);
	      }
	      this._active_lasers = (this._active_lasers + 1) % this._max_input_elements;
	
	      laser.matrix = pointer_matrix;
	      laser.visible = true;
	    }
	  }, {
	    key: 'addCursor',
	    value: function addCursor(cursor_pos) {
	      // Create the cursor mesh if needed.
	      if (!this._cursors && this._renderer) {
	        this._cursors = [this._createCursorMesh()];
	        this.addNode(this._cursors[0]);
	      }
	
	      var cursor = null;
	      if (this._active_cursors < this._cursors.length) {
	        cursor = this._cursors[this._active_cursors];
	      } else {
	        cursor = this._cursors[0].clone();
	        this.addNode(cursor);
	        this._cursors.push(cursor);
	      }
	      this._active_cursors = (this._active_cursors + 1) % this._max_input_elements;
	
	      cursor.translation = cursor_pos;
	      cursor.visible = true;
	    }
	  }, {
	    key: 'reset',
	    value: function reset(options) {
	      if (!options) {
	        options = DEFAULT_RESET_OPTIONS;
	      }
	      if (this._controllers && options.controllers) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	          for (var _iterator = this._controllers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var controller = _step.value;
	
	            controller.visible = false;
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	
	        this._active_controllers = 0;
	      }
	      if (this._lasers && options.lasers) {
	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;
	
	        try {
	          for (var _iterator2 = this._lasers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var laser = _step2.value;
	
	            laser.visible = false;
	          }
	        } catch (err) {
	          _didIteratorError2 = true;
	          _iteratorError2 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	              _iterator2.return();
	            }
	          } finally {
	            if (_didIteratorError2) {
	              throw _iteratorError2;
	            }
	          }
	        }
	
	        this._active_lasers = 0;
	      }
	      if (this._cursors && options.cursors) {
	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;
	
	        try {
	          for (var _iterator3 = this._cursors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var cursor = _step3.value;
	
	            cursor.visible = false;
	          }
	        } catch (err) {
	          _didIteratorError3 = true;
	          _iteratorError3 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	              _iterator3.return();
	            }
	          } finally {
	            if (_didIteratorError3) {
	              throw _iteratorError3;
	            }
	          }
	        }
	
	        this._active_cursors = 0;
	      }
	    }
	  }, {
	    key: '_createLaserMesh',
	    value: function _createLaserMesh() {
	      var gl = this._renderer._gl;
	
	      var lr = LASER_DIAMETER * 0.5;
	      var ll = LASER_LENGTH;
	
	      // Laser is rendered as cross-shaped beam
	      var laser_verts = [
	      //X    Y     Z     U    V
	      0.0, lr, 0.0, 0.0, 1.0, 0.0, lr, -ll, 0.0, 0.0, 0.0, -lr, 0.0, 1.0, 1.0, 0.0, -lr, -ll, 1.0, 0.0, lr, 0.0, 0.0, 0.0, 1.0, lr, 0.0, -ll, 0.0, 0.0, -lr, 0.0, 0.0, 1.0, 1.0, -lr, 0.0, -ll, 1.0, 0.0, 0.0, -lr, 0.0, 0.0, 1.0, 0.0, -lr, -ll, 0.0, 0.0, 0.0, lr, 0.0, 1.0, 1.0, 0.0, lr, -ll, 1.0, 0.0, -lr, 0.0, 0.0, 0.0, 1.0, -lr, 0.0, -ll, 0.0, 0.0, lr, 0.0, 0.0, 1.0, 1.0, lr, 0.0, -ll, 1.0, 0.0];
	      var laser_indices = [0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13, 14, 13, 15, 14];
	
	      var laser_vertex_buffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(laser_verts));
	      var laser_index_buffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(laser_indices));
	
	      var laser_index_count = laser_indices.length;
	
	      var laser_attribs = [new _primitive.PrimitiveAttribute("POSITION", laser_vertex_buffer, 3, gl.FLOAT, 20, 0), new _primitive.PrimitiveAttribute("TEXCOORD_0", laser_vertex_buffer, 2, gl.FLOAT, 20, 12)];
	
	      var laser_primitive = new _primitive.Primitive(laser_attribs, laser_index_count);
	      laser_primitive.setIndexBuffer(laser_index_buffer);
	
	      var laser_material = new LaserMaterial();
	
	      var laser_render_primitive = this._renderer.createRenderPrimitive(laser_primitive, laser_material);
	      var mesh_node = new _node.Node();
	      mesh_node.addRenderPrimitive(laser_render_primitive);
	      return mesh_node;
	    }
	  }, {
	    key: '_createCursorMesh',
	    value: function _createCursorMesh() {
	      var gl = this._renderer._gl;
	
	      var cr = CURSOR_RADIUS;
	
	      // Cursor is a circular white dot with a dark "shadow" skirt around the edge
	      // that fades from black to transparent as it moves out from the center.
	      // Cursor verts are packed as [X, Y, Luminance, Opacity]
	      var cursor_verts = [];
	      var cursor_indices = [];
	
	      var seg_rad = 2.0 * Math.PI / CURSOR_SEGMENTS;
	
	      // Cursor center
	      for (var i = 0; i < CURSOR_SEGMENTS; ++i) {
	        var rad = i * seg_rad;
	        var x = Math.cos(rad);
	        var y = Math.sin(rad);
	        cursor_verts.push(x * CURSOR_RADIUS, y * CURSOR_RADIUS, 1.0, CURSOR_OPACITY);
	
	        if (i > 1) {
	          cursor_indices.push(0, i - 1, i);
	        }
	      }
	
	      var index_offset = CURSOR_SEGMENTS;
	
	      // Cursor Skirt
	      for (var _i = 0; _i < CURSOR_SEGMENTS; ++_i) {
	        var _rad = _i * seg_rad;
	        var _x2 = Math.cos(_rad);
	        var _y = Math.sin(_rad);
	        cursor_verts.push(_x2 * CURSOR_RADIUS, _y * CURSOR_RADIUS, CURSOR_SHADOW_INNER_LUMINANCE, CURSOR_SHADOW_INNER_OPACITY);
	        cursor_verts.push(_x2 * CURSOR_SHADOW_RADIUS, _y * CURSOR_SHADOW_RADIUS, CURSOR_SHADOW_OUTER_LUMINANCE, CURSOR_SHADOW_OUTER_OPACITY);
	
	        if (_i > 0) {
	          var _idx = index_offset + _i * 2;
	          cursor_indices.push(_idx - 2, _idx - 1, _idx);
	          cursor_indices.push(_idx - 1, _idx + 1, _idx);
	        }
	      }
	
	      var idx = index_offset + CURSOR_SEGMENTS * 2;
	      cursor_indices.push(idx - 2, idx - 1, index_offset);
	      cursor_indices.push(idx - 1, index_offset + 1, index_offset);
	
	      var cursor_vertex_buffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(cursor_verts));
	      var cursor_index_buffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cursor_indices));
	
	      var cursor_index_count = cursor_indices.length;
	
	      var cursor_attribs = [new _primitive.PrimitiveAttribute("POSITION", cursor_vertex_buffer, 4, gl.FLOAT, 16, 0)];
	
	      var cursor_primitive = new _primitive.Primitive(cursor_attribs, cursor_index_count);
	      cursor_primitive.setIndexBuffer(cursor_index_buffer);
	
	      var cursor_material = new CursorMaterial();
	      var cursor_hidden_material = new CursorHiddenMaterial();
	
	      // Cursor renders two parts: The bright opaque cursor for areas where it's
	      // not obscured and a more transparent, darker version for areas where it's
	      // behind another object.
	      var cursor_render_primitive = this._renderer.createRenderPrimitive(cursor_primitive, cursor_material);
	      var cursor_hidden_render_primitive = this._renderer.createRenderPrimitive(cursor_primitive, cursor_hidden_material);
	      var mesh_node = new _node.Node();
	      mesh_node.addRenderPrimitive(cursor_render_primitive);
	      mesh_node.addRenderPrimitive(cursor_hidden_render_primitive);
	      return mesh_node;
	    }
	  }]);

	  return InputRenderer;
	}(_node.Node);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Skybox = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _primitive = __webpack_require__(8);
	
	var _node = __webpack_require__(1);
	
	var _texture = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	/*
	Node for displaying 360 equirect images as a skybox.
	*/
	
	var GL = WebGLRenderingContext; // For enums
	
	var SkyboxMaterial = function (_Material) {
	  _inherits(SkyboxMaterial, _Material);
	
	  function SkyboxMaterial() {
	    _classCallCheck(this, SkyboxMaterial);
	
	    var _this = _possibleConstructorReturn(this, (SkyboxMaterial.__proto__ || Object.getPrototypeOf(SkyboxMaterial)).call(this));
	
	    _this.render_order = _material.RENDER_ORDER.SKY;
	    _this.state.depth_func = GL.LEQUAL;
	    _this.state.depth_mask = false;
	
	    _this.image = _this.defineSampler("diffuse");
	
	    _this.tex_coord_scale_offset = _this.defineUniform("texCoordScaleOffset", [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0], 4);
	    return _this;
	  }
	
	  _createClass(SkyboxMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'SKYBOX';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    uniform int EYE_INDEX;\n    uniform vec4 texCoordScaleOffset[2];\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];\n      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;\n      // Drop the translation portion of the view matrix\n      view[3].xyz = vec3(0.0, 0.0, 0.0);\n      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);\n\n      // Returning the W component for both Z and W forces the geometry depth to\n      // the far plane. When combined with a depth func of LEQUAL this makes the\n      // sky write to any depth fragment that has not been written to yet.\n      return out_vec.xyww;\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(diffuse, vTexCoord);\n    }';
	    }
	  }]);
	
	  return SkyboxMaterial;
	}(_material.Material);
	
	var Skybox = exports.Skybox = function (_Node) {
	  _inherits(Skybox, _Node);
	
	  function Skybox(options) {
	    _classCallCheck(this, Skybox);
	
	    var _this2 = _possibleConstructorReturn(this, (Skybox.__proto__ || Object.getPrototypeOf(Skybox)).call(this));
	
	    _this2._image_url = options.image_url;
	    _this2._display_mode = options.display_mode || "mono";
	    _this2._rotation_y = options.rotation_y || 0;
	    return _this2;
	  }
	
	  _createClass(Skybox, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      var vertices = [];
	      var indices = [];
	
	      var lat_segments = 40;
	      var lon_segments = 40;
	
	      // Create the vertices/indices
	      for (var i = 0; i <= lat_segments; ++i) {
	        var theta = i * Math.PI / lat_segments;
	        var sin_theta = Math.sin(theta);
	        var cos_theta = Math.cos(theta);
	
	        var idx_offset_a = i * (lon_segments + 1);
	        var idx_offset_b = (i + 1) * (lon_segments + 1);
	
	        for (var j = 0; j <= lon_segments; ++j) {
	          var phi = j * 2 * Math.PI / lon_segments + this._rotation_y;
	          var x = Math.sin(phi) * sin_theta;
	          var y = cos_theta;
	          var z = -Math.cos(phi) * sin_theta;
	          var u = j / lon_segments;
	          var v = i / lat_segments;
	
	          // Vertex shader will force the geometry to the far plane, so the
	          // radius of the sphere is immaterial.
	          vertices.push(x, y, z, u, v);
	
	          if (i < lat_segments && j < lon_segments) {
	            var idx_a = idx_offset_a + j;
	            var idx_b = idx_offset_b + j;
	
	            indices.push(idx_a, idx_b, idx_a + 1, idx_b, idx_b + 1, idx_a + 1);
	          }
	        }
	      }
	
	      var vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
	      var index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
	
	      var attribs = [new _primitive.PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 20, 0), new _primitive.PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 20, 12)];
	
	      var primitive = new _primitive.Primitive(attribs, indices.length);
	      primitive.setIndexBuffer(index_buffer);
	
	      var material = new SkyboxMaterial();
	      material.image.texture = new _texture.UrlTexture(this._image_url);
	
	      switch (this._display_mode) {
	        case "mono":
	          material.tex_coord_scale_offset.value = [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0];
	          break;
	        case "stereoTopBottom":
	          material.tex_coord_scale_offset.value = [1.0, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 0.5];
	          break;
	        case "stereoLeftRight":
	          material.tex_coord_scale_offset.value = [0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.5, 0.0];
	          break;
	      }
	
	      var render_primitive = renderer.createRenderPrimitive(primitive, material);
	      this.addRenderPrimitive(render_primitive);
	    }
	  }]);

	  return Skybox;
	}(_node.Node);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.StatsViewer = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _primitive = __webpack_require__(8);
	
	var _sevenSegmentText = __webpack_require__(19);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	/*
	Heavily inspired by Mr. Doobs stats.js, this FPS counter is rendered completely
	with WebGL, allowing it to be shown in cases where overlaid HTML elements aren't
	usable (like WebXR), or if you want the FPS counter to be rendered as part of
	your scene.
	*/
	
	var SEGMENTS = 30;
	var MAX_FPS = 90;
	
	var StatsMaterial = function (_Material) {
	  _inherits(StatsMaterial, _Material);
	
	  function StatsMaterial() {
	    _classCallCheck(this, StatsMaterial);
	
	    return _possibleConstructorReturn(this, (StatsMaterial.__proto__ || Object.getPrototypeOf(StatsMaterial)).apply(this, arguments));
	  }
	
	  _createClass(StatsMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'STATS_VIEWER';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec3 POSITION;\n    attribute vec3 COLOR_0;\n    varying vec4 vColor;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vColor = vec4(COLOR_0, 1.0);\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    precision mediump float;\n    varying vec4 vColor;\n\n    vec4 fragment_main() {\n      return vColor;\n    }';
	    }
	  }]);
	
	  return StatsMaterial;
	}(_material.Material);
	
	function segmentToX(i) {
	  return 0.9 / SEGMENTS * i - 0.45;
	}
	
	function fpsToY(value) {
	  return Math.min(value, MAX_FPS) * (0.7 / MAX_FPS) - 0.45;
	}
	
	function fpsToRGB(value) {
	  return {
	    r: Math.max(0.0, Math.min(1.0, 1.0 - value / 60)),
	    g: Math.max(0.0, Math.min(1.0, (value - 15) / (MAX_FPS - 15))),
	    b: Math.max(0.0, Math.min(1.0, (value - 15) / (MAX_FPS - 15)))
	  };
	}
	
	var now = window.performance && performance.now ? performance.now.bind(performance) : Date.now;
	
	var StatsViewer = exports.StatsViewer = function (_Node) {
	  _inherits(StatsViewer, _Node);
	
	  function StatsViewer() {
	    _classCallCheck(this, StatsViewer);
	
	    var _this2 = _possibleConstructorReturn(this, (StatsViewer.__proto__ || Object.getPrototypeOf(StatsViewer)).call(this));
	
	    _this2._performance_monitoring = false;
	
	    _this2._start_time = now();
	    _this2._prev_frame_time = _this2._start_time;
	    _this2._prev_graph_update_time = _this2._start_time;
	    _this2._frames = 0;
	    _this2._fps_average = 0;
	    _this2._fps_min = 0;
	    _this2._fps_step = _this2._performance_monitoring ? 1000 : 250;
	    _this2._last_segment = 0;
	
	    _this2._fps_vertex_buffer = null;
	    _this2._fps_render_primitive = null;
	    _this2._fps_node = null;
	
	    _this2._seven_segment_node = new _sevenSegmentText.SevenSegmentText();
	    // Hard coded because it doesn't change:
	    // Scale by 0.075 in X and Y
	    // Translate into upper left corner w/ z = 0.02
	    _this2._seven_segment_node.matrix = new Float32Array([0.075, 0, 0, 0, 0, 0.075, 0, 0, 0, 0, 1, 0, -0.3625, 0.3625, 0.02, 1]);
	    return _this2;
	  }
	
	  _createClass(StatsViewer, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      this.clearNodes();
	
	      var gl = renderer.gl;
	
	      var fps_verts = [];
	      var fps_indices = [];
	
	      // Graph geometry
	      for (var i = 0; i < SEGMENTS; ++i) {
	        // Bar top
	        fps_verts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
	        fps_verts.push(segmentToX(i + 1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
	
	        // Bar bottom
	        fps_verts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
	        fps_verts.push(segmentToX(i + 1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
	
	        var idx = i * 4;
	        fps_indices.push(idx, idx + 3, idx + 1, idx + 3, idx, idx + 2);
	      }
	
	      function addBGSquare(left, bottom, right, top, z, r, g, b) {
	        var idx = fps_verts.length / 6;
	
	        fps_verts.push(left, bottom, z, r, g, b);
	        fps_verts.push(right, top, z, r, g, b);
	        fps_verts.push(left, top, z, r, g, b);
	        fps_verts.push(right, bottom, z, r, g, b);
	
	        fps_indices.push(idx, idx + 1, idx + 2, idx, idx + 3, idx + 1);
	      };
	
	      // Panel Background
	      addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);
	
	      // FPS Background
	      addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);
	
	      // 30 FPS line
	      addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);
	
	      // 60 FPS line
	      addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);
	
	      this._fps_vertex_buffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(fps_verts), gl.DYNAMIC_DRAW);
	      var fps_index_buffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fps_indices));
	
	      var fps_attribs = [new _primitive.PrimitiveAttribute("POSITION", this._fps_vertex_buffer, 3, gl.FLOAT, 24, 0), new _primitive.PrimitiveAttribute("COLOR_0", this._fps_vertex_buffer, 3, gl.FLOAT, 24, 12)];
	
	      var fps_primitive = new _primitive.Primitive(fps_attribs, fps_indices.length);
	      fps_primitive.setIndexBuffer(fps_index_buffer);
	      fps_primitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);
	
	      this._fps_render_primitive = renderer.createRenderPrimitive(fps_primitive, new StatsMaterial());
	      this._fps_node = new _node.Node();
	      this._fps_node.addRenderPrimitive(this._fps_render_primitive);
	
	      this.addNode(this._fps_node);
	      this.addNode(this._seven_segment_node);
	    }
	  }, {
	    key: 'begin',
	    value: function begin() {
	      this._start_time = now();
	    }
	  }, {
	    key: 'end',
	    value: function end() {
	      var time = now();
	
	      var frame_fps = 1000 / (time - this._prev_frame_time);
	      this._prev_frame_time = time;
	      this._fps_min = this._frames ? Math.min(this._fps_min, frame_fps) : frame_fps;
	      this._frames++;
	
	      if (time > this._prev_graph_update_time + this._fps_step) {
	        var interval_time = time - this._prev_graph_update_time;
	        this._fps_average = Math.round(1000 / (interval_time / this._frames));
	
	        // Draw both average and minimum FPS for this period
	        // so that dropped frames are more clearly visible.
	        this._updateGraph(this._fps_min, this._fps_average);
	        if (this.enable_performance_monitoring) {
	          console.log('Average FPS: ' + this._fps_average + ' Min FPS: ' + this._fps_min);
	        }
	
	        this._prev_graph_update_time = time;
	        this._frames = 0;
	        this._fps_min = 0;
	      }
	    }
	  }, {
	    key: '_updateGraph',
	    value: function _updateGraph(value_low, value_high) {
	      var color = fpsToRGB(value_low);
	      // Draw a range from the low to high value. Artificially widen the
	      // range a bit to ensure that near-equal values still remain
	      // visible - the logic here should match that used by the
	      // "60 FPS line" setup below. Hitting 60fps consistently will
	      // keep the top half of the 60fps background line visible.
	      var y0 = fpsToY(value_low - 1);
	      var y1 = fpsToY(value_high + 1);
	
	      // Update the current segment with the new FPS value
	      var updateVerts = [segmentToX(this._last_segment), y1, 0.02, color.r, color.g, color.b, segmentToX(this._last_segment + 1), y1, 0.02, color.r, color.g, color.b, segmentToX(this._last_segment), y0, 0.02, color.r, color.g, color.b, segmentToX(this._last_segment + 1), y0, 0.02, color.r, color.g, color.b];
	
	      // Re-shape the next segment into the green "progress" line
	      color.r = 0.2;
	      color.g = 1.0;
	      color.b = 0.2;
	
	      if (this._last_segment == SEGMENTS - 1) {
	        // If we're updating the last segment we need to do two bufferSubDatas
	        // to update the segment and turn the first segment into the progress line.
	        this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), this._last_segment * 24 * 4);
	        updateVerts = [segmentToX(0), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(0), fpsToY(0), 0.02, color.r, color.g, color.b, segmentToX(.25), fpsToY(0), 0.02, color.r, color.g, color.b];
	        this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), 0);
	      } else {
	        updateVerts.push(segmentToX(this._last_segment + 1), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(this._last_segment + 1.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(this._last_segment + 1), fpsToY(0), 0.02, color.r, color.g, color.b, segmentToX(this._last_segment + 1.25), fpsToY(0), 0.02, color.r, color.g, color.b);
	        this._renderer.updateRenderBuffer(this._fps_vertex_buffer, new Float32Array(updateVerts), this._last_segment * 24 * 4);
	      }
	
	      this._last_segment = (this._last_segment + 1) % SEGMENTS;
	
	      this._seven_segment_node.text = this._fps_average + ' FP5';
	    }
	  }, {
	    key: 'performance_monitoring',
	    get: function get() {
	      return this._performance_monitoring;
	    },
	    set: function set(value) {
	      this._performance_monitoring = value;
	      this._fps_step = value ? 1000 : 250;
	    }
	  }]);

	  return StatsViewer;
	}(_node.Node);

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SevenSegmentText = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _material = __webpack_require__(4);
	
	var _node = __webpack_require__(1);
	
	var _primitive = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	/*
	Renders simple text using a seven-segment LED style pattern. Only really good
	for numbers and a limited number of other characters.
	*/
	
	var TEXT_KERNING = 2.0;
	
	var SevenSegmentMaterial = function (_Material) {
	  _inherits(SevenSegmentMaterial, _Material);
	
	  function SevenSegmentMaterial() {
	    _classCallCheck(this, SevenSegmentMaterial);
	
	    return _possibleConstructorReturn(this, (SevenSegmentMaterial.__proto__ || Object.getPrototypeOf(SevenSegmentMaterial)).apply(this, arguments));
	  }
	
	  _createClass(SevenSegmentMaterial, [{
	    key: 'material_name',
	    get: function get() {
	      return 'SEVEN_SEGMENT_TEXT';
	    }
	  }, {
	    key: 'vertex_source',
	    get: function get() {
	      return '\n    attribute vec2 POSITION;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      return proj * view * model * vec4(POSITION, 0.0, 1.0);\n    }';
	    }
	  }, {
	    key: 'fragment_source',
	    get: function get() {
	      return '\n    precision mediump float;\n    const vec4 color = vec4(0.0, 1.0, 0.0, 1.0);\n\n    vec4 fragment_main() {\n      return color;\n    }';
	    }
	  }]);
	
	  return SevenSegmentMaterial;
	}(_material.Material);
	
	var SevenSegmentText = exports.SevenSegmentText = function (_Node) {
	  _inherits(SevenSegmentText, _Node);
	
	  function SevenSegmentText() {
	    _classCallCheck(this, SevenSegmentText);
	
	    var _this2 = _possibleConstructorReturn(this, (SevenSegmentText.__proto__ || Object.getPrototypeOf(SevenSegmentText)).call(this));
	
	    _this2._text = "";
	    _this2._char_nodes = [];
	    return _this2;
	  }
	
	  _createClass(SevenSegmentText, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      this.clearNodes();
	      this._char_nodes = [];
	
	      var vertices = [];
	      var segmentIndices = {};
	      var indices = [];
	
	      var width = 0.5;
	      var thickness = 0.25;
	
	      function defineSegment(id, left, top, right, bottom) {
	        var idx = vertices.length / 2;
	        vertices.push(left, top, right, top, right, bottom, left, bottom);
	
	        segmentIndices[id] = [idx, idx + 2, idx + 1, idx, idx + 3, idx + 2];
	      }
	
	      var characters = {};
	      function defineCharacter(c, segments) {
	        var character = {
	          character: c,
	          offset: indices.length * 2,
	          count: 0
	        };
	
	        for (var i = 0; i < segments.length; ++i) {
	          var idx = segments[i];
	          var segment = segmentIndices[idx];
	          character.count += segment.length;
	          indices.push.apply(indices, segment);
	        }
	
	        characters[c] = character;
	      }
	
	      /* Segment layout is as follows:
	       |-0-|
	      3   4
	      |-1-|
	      5   6
	      |-2-|
	       */
	
	      defineSegment(0, -1, 1, width, 1 - thickness);
	      defineSegment(1, -1, thickness * 0.5, width, -thickness * 0.5);
	      defineSegment(2, -1, -1 + thickness, width, -1);
	      defineSegment(3, -1, 1, -1 + thickness, -thickness * 0.5);
	      defineSegment(4, width - thickness, 1, width, -thickness * 0.5);
	      defineSegment(5, -1, thickness * 0.5, -1 + thickness, -1);
	      defineSegment(6, width - thickness, thickness * 0.5, width, -1);
	
	      defineCharacter("0", [0, 2, 3, 4, 5, 6]);
	      defineCharacter("1", [4, 6]);
	      defineCharacter("2", [0, 1, 2, 4, 5]);
	      defineCharacter("3", [0, 1, 2, 4, 6]);
	      defineCharacter("4", [1, 3, 4, 6]);
	      defineCharacter("5", [0, 1, 2, 3, 6]);
	      defineCharacter("6", [0, 1, 2, 3, 5, 6]);
	      defineCharacter("7", [0, 4, 6]);
	      defineCharacter("8", [0, 1, 2, 3, 4, 5, 6]);
	      defineCharacter("9", [0, 1, 2, 3, 4, 6]);
	      defineCharacter("A", [0, 1, 3, 4, 5, 6]);
	      defineCharacter("B", [1, 2, 3, 5, 6]);
	      defineCharacter("C", [0, 2, 3, 5]);
	      defineCharacter("D", [1, 2, 4, 5, 6]);
	      defineCharacter("E", [0, 1, 2, 4, 6]);
	      defineCharacter("F", [0, 1, 3, 5]);
	      defineCharacter("P", [0, 1, 3, 4, 5]);
	      defineCharacter("-", [1]);
	      defineCharacter(" ", []);
	      defineCharacter("_", [2]); // Used for undefined characters
	
	      var gl = renderer.gl;
	      var vertex_buffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
	      var index_buffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
	
	      var vertex_attribs = [new _primitive.PrimitiveAttribute("POSITION", vertex_buffer, 2, gl.FLOAT, 8, 0)];
	
	      var primitive = new _primitive.Primitive(vertex_attribs, indices.length);
	      primitive.setIndexBuffer(index_buffer);
	
	      var material = new SevenSegmentMaterial();
	
	      this._char_primitives = {};
	      for (var char in characters) {
	        var char_def = characters[char];
	        primitive.element_count = char_def.count;
	        primitive.index_byte_offset = char_def.offset;
	        this._char_primitives[char] = renderer.createRenderPrimitive(primitive, material);
	      }
	
	      this.text = this._text;
	    }
	  }, {
	    key: 'text',
	    get: function get() {
	      return this._text;
	    },
	    set: function set(value) {
	      this._text = value;
	
	      var i = 0;
	      var char_primitive = null;
	      for (; i < value.length; ++i) {
	        if (value[i] in this._char_primitives) {
	          char_primitive = this._char_primitives[value[i]];
	        } else {
	          char_primitive = this._char_primitives["_"];
	        }
	
	        if (this._char_nodes.length <= i) {
	          var node = new _node.Node();
	          node.addRenderPrimitive(char_primitive);
	          var offset = i * TEXT_KERNING;
	          node.translation = [offset, 0, 0];
	          this._char_nodes.push(node);
	          this.addNode(node);
	        } else {
	          // This is sort of an abuse of how these things are expected to work,
	          // but it's the cheapest thing I could think of that didn't break the
	          // world.
	          this._char_nodes[i].clearRenderPrimitives();
	          this._char_nodes[i].addRenderPrimitive(char_primitive);
	          this._char_nodes[i].visible = true;
	        }
	      }
	
	      // If there's any nodes left over make them invisible
	      for (; i < this._char_nodes.length; ++i) {
	        this._char_nodes[i].visible = false;
	      }
	    }
	  }]);

	  return SevenSegmentText;
	}(_node.Node);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GLTF2Loader = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright 2018 The Immersive Web Community Group
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
	
	var _pbr = __webpack_require__(10);
	
	var _node2 = __webpack_require__(1);
	
	var _primitive = __webpack_require__(8);
	
	var _texture = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var GL = WebGLRenderingContext; // For enums
	
	var GLB_MAGIC = 0x46546C67;
	var CHUNK_TYPE = {
	  JSON: 0x4E4F534A,
	  BIN: 0x004E4942
	};
	
	function isAbsoluteUri(uri) {
	  var absRegEx = new RegExp('^' + window.location.protocol, 'i');
	  return !!uri.match(absRegEx);
	}
	
	function isDataUri(uri) {
	  var dataRegEx = /^data:/;
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
	    case 'SCALAR':
	      return 1;
	    case 'VEC2':
	      return 2;
	    case 'VEC3':
	      return 3;
	    case 'VEC4':
	      return 4;
	    default:
	      return 0;
	  }
	}
	
	/**
	 * GLTF2SceneLoader
	 * Loads glTF 2.0 scenes into a renderable node tree.
	 */
	
	var GLTF2Loader = exports.GLTF2Loader = function () {
	  function GLTF2Loader(renderer) {
	    _classCallCheck(this, GLTF2Loader);
	
	    this.renderer = renderer;
	    this._gl = renderer._gl;
	  }
	
	  _createClass(GLTF2Loader, [{
	    key: 'loadFromUrl',
	    value: function loadFromUrl(url) {
	      var _this = this;
	
	      return fetch(url).then(function (response) {
	        var i = url.lastIndexOf('/');
	        var baseUrl = i !== 0 ? url.substring(0, i + 1) : '';
	
	        if (url.endsWith('.gltf')) {
	          return response.json().then(function (json) {
	            return _this.loadFromJson(json, baseUrl);
	          });
	        } else if (url.endsWith('.glb')) {
	          return response.arrayBuffer().then(function (arrayBuffer) {
	            return _this.loadFromBinary(arrayBuffer, baseUrl);
	          });
	        } else {
	          throw new Error('Unrecognized file extension');
	        }
	      });
	    }
	  }, {
	    key: 'loadFromBinary',
	    value: function loadFromBinary(arrayBuffer, baseUrl) {
	      var headerView = new DataView(arrayBuffer, 0, 12);
	      var magic = headerView.getUint32(0, true);
	      var version = headerView.getUint32(4, true);
	      var length = headerView.getUint32(8, true);
	
	      if (magic != GLB_MAGIC) {
	        throw new Error('Invalid magic string in binary header.');
	      }
	
	      if (version != 2) {
	        throw new Error('Incompatible version in binary header.');
	      }
	
	      var chunks = {};
	      var chunkOffset = 12;
	      while (chunkOffset < length) {
	        var chunkHeaderView = new DataView(arrayBuffer, chunkOffset, 8);
	        var chunkLength = chunkHeaderView.getUint32(0, true);
	        var chunkType = chunkHeaderView.getUint32(4, true);
	        chunks[chunkType] = arrayBuffer.slice(chunkOffset + 8, chunkOffset + 8 + chunkLength);
	        chunkOffset += chunkLength + 8;
	      }
	
	      if (!chunks[CHUNK_TYPE.JSON]) {
	        throw new Error('File contained no json chunk.');
	      }
	
	      var decoder = new TextDecoder('utf-8');
	      var jsonString = decoder.decode(chunks[CHUNK_TYPE.JSON]);
	      var json = JSON.parse(jsonString);
	      return this.loadFromJson(json, baseUrl, chunks[CHUNK_TYPE.BIN]);
	    }
	  }, {
	    key: 'loadFromJson',
	    value: function loadFromJson(json, baseUrl, binaryChunk) {
	      if (!json.asset) {
	        throw new Error("Missing asset description.");
	      }
	
	      if (json.asset.minVersion != "2.0" && json.asset.version != "2.0") {
	        throw new Error("Incompatible asset version.");
	      }
	
	      var buffers = [];
	      if (binaryChunk) {
	        buffers[0] = new GLTF2Resource({}, baseUrl, binaryChunk);
	      } else {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	          for (var _iterator = json.buffers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var buffer = _step.value;
	
	            buffers.push(new GLTF2Resource(buffer, baseUrl));
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	      }
	
	      var bufferViews = [];
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = json.bufferViews[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var bufferView = _step2.value;
	
	          bufferViews.push(new GLTF2BufferView(bufferView, buffers));
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      var images = [];
	      if (json.images) {
	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;
	
	        try {
	          for (var _iterator3 = json.images[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var image = _step3.value;
	
	            images.push(new GLTF2Resource(image, baseUrl));
	          }
	        } catch (err) {
	          _didIteratorError3 = true;
	          _iteratorError3 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	              _iterator3.return();
	            }
	          } finally {
	            if (_didIteratorError3) {
	              throw _iteratorError3;
	            }
	          }
	        }
	      }
	
	      var textures = [];
	      if (json.textures) {
	        var i = 0;
	        var _iteratorNormalCompletion4 = true;
	        var _didIteratorError4 = false;
	        var _iteratorError4 = undefined;
	
	        try {
	          for (var _iterator4 = json.textures[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var texture = _step4.value;
	
	            var _image = images[texture.source];
	            var glTexture = _image.texture(bufferViews);
	            if (texture.sampler) {
	              var sampler = sampler[texture.sampler];
	              glTexture.sampler.min_filter = sampler.minFilter;
	              glTexture.sampler.mag_filter = sampler.magFilter;
	              glTexture.sampler.wrap_s = sampler.wrapS;
	              glTexture.sampler.wrap_t = sampler.wrapT;
	            }
	            textures.push(glTexture);
	          }
	        } catch (err) {
	          _didIteratorError4 = true;
	          _iteratorError4 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	              _iterator4.return();
	            }
	          } finally {
	            if (_didIteratorError4) {
	              throw _iteratorError4;
	            }
	          }
	        }
	      }
	
	      function getTexture(textureInfo) {
	        if (!textureInfo) {
	          return null;
	        }
	        return textures[textureInfo.index];
	      }
	
	      var materials = [];
	      if (json.materials) {
	        var _iteratorNormalCompletion5 = true;
	        var _didIteratorError5 = false;
	        var _iteratorError5 = undefined;
	
	        try {
	          for (var _iterator5 = json.materials[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	            var material = _step5.value;
	
	            var glMaterial = new _pbr.PbrMaterial();
	            var pbr = material.pbrMetallicRoughness || {};
	
	            glMaterial.base_color_factor.value = pbr.baseColorFactor || [1, 1, 1, 1];
	            glMaterial.base_color.texture = getTexture(pbr.baseColorTexture);
	            glMaterial.metallic_roughness_factor.value = [pbr.metallicFactor || 1.0, pbr.roughnessFactor || 1.0];
	            glMaterial.metallic_roughness.texture = getTexture(pbr.metallicRoughnessTexture);
	            glMaterial.normal.texture = getTexture(json.normalTexture);
	            glMaterial.occlusion.texture = getTexture(json.occlusionTexture);
	            glMaterial.occlusion_strength.value = json.occlusionTexture && json.occlusionTexture.strength ? json.occlusionTexture.strength : 1.0;
	            glMaterial.emissive_factor.value = material.emissiveFactor || [0, 0, 0];
	            glMaterial.emissive.texture = getTexture(json.emissiveTexture);
	            if (!glMaterial.emissive.texture && json.emissiveFactor) {
	              glMaterial.emissive.texture = new _texture.ColorTexture(1.0, 1.0, 1.0, 1.0);
	            }
	
	            switch (material.alphaMode) {
	              case "BLEND":
	                glMaterial.state.blend = true;
	                break;
	              case "MASK":
	                // Not really supported.
	                glMaterial.state.blend = true;
	                break;
	              default:
	                // Includes "OPAQUE"
	                glMaterial.state.blend = false;
	            }
	
	            //glMaterial.alpha_mode = material.alphaMode;
	            //glMaterial.alpha_cutoff = material.alphaCutoff;
	            glMaterial.state.cull_face = !material.doubleSided;
	
	            materials.push(glMaterial);
	          }
	        } catch (err) {
	          _didIteratorError5 = true;
	          _iteratorError5 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion5 && _iterator5.return) {
	              _iterator5.return();
	            }
	          } finally {
	            if (_didIteratorError5) {
	              throw _iteratorError5;
	            }
	          }
	        }
	      }
	
	      var accessors = json.accessors;
	
	      var meshes = [];
	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;
	
	      try {
	        for (var _iterator6 = json.meshes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var mesh = _step6.value;
	
	          var glMesh = new GLTF2Mesh();
	          meshes.push(glMesh);
	
	          var _iteratorNormalCompletion8 = true;
	          var _didIteratorError8 = false;
	          var _iteratorError8 = undefined;
	
	          try {
	            for (var _iterator8 = mesh.primitives[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	              var primitive = _step8.value;
	
	              var _material = null;
	              if ('material' in primitive) {
	                _material = materials[primitive.material];
	              } else {
	                // Create a "default" material if the primitive has none.
	                _material = new _pbr.PbrMaterial();
	              }
	
	              var attributes = [];
	              var element_count = 0;
	              /*let glPrimitive = new GLTF2Primitive(primitive, material);
	              glMesh.primitives.push(glPrimitive);*/
	
	              var min = null;
	              var max = null;
	
	              for (var name in primitive.attributes) {
	                var accessor = accessors[primitive.attributes[name]];
	                var _bufferView = bufferViews[accessor.bufferView];
	                element_count = accessor.count;
	
	                var glAttribute = new _primitive.PrimitiveAttribute(name, _bufferView.renderBuffer(this.renderer, GL.ARRAY_BUFFER), getComponentCount(accessor.type), accessor.componentType, _bufferView.byteStride || 0, accessor.byteOffset || 0);
	                glAttribute.normalized = accessor.normalized || false;
	
	                if (name == "POSITION") {
	                  min = accessor.min;
	                  max = accessor.max;
	                }
	
	                attributes.push(glAttribute);
	              }
	
	              var glPrimitive = new _primitive.Primitive(attributes, element_count, primitive.mode);
	
	              if ('indices' in primitive) {
	                var _accessor = accessors[primitive.indices];
	                var _bufferView2 = bufferViews[_accessor.bufferView];
	
	                glPrimitive.setIndexBuffer(_bufferView2.renderBuffer(this.renderer, GL.ELEMENT_ARRAY_BUFFER), _accessor.byteOffset || 0, _accessor.componentType);
	                glPrimitive.indexType = _accessor.componentType;
	                glPrimitive.indexByteOffset = _accessor.byteOffset || 0;
	                glPrimitive.element_count = _accessor.count;
	              }
	
	              if (min && max) {
	                glPrimitive.setBounds(min, max);
	              }
	
	              // After all the attributes have been processed, get a program that is
	              // appropriate for both the material and the primitive attributes.
	              glMesh.primitives.push(this.renderer.createRenderPrimitive(glPrimitive, _material));
	            }
	          } catch (err) {
	            _didIteratorError8 = true;
	            _iteratorError8 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion8 && _iterator8.return) {
	                _iterator8.return();
	              }
	            } finally {
	              if (_didIteratorError8) {
	                throw _iteratorError8;
	              }
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion6 && _iterator6.return) {
	            _iterator6.return();
	          }
	        } finally {
	          if (_didIteratorError6) {
	            throw _iteratorError6;
	          }
	        }
	      }
	
	      var scene_node = new _node2.Node();
	      var scene = json.scenes[json.scene];
	      var _iteratorNormalCompletion7 = true;
	      var _didIteratorError7 = false;
	      var _iteratorError7 = undefined;
	
	      try {
	        for (var _iterator7 = scene.nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	          var nodeId = _step7.value;
	
	          var node = json.nodes[nodeId];
	          scene_node.addNode(this.processNodes(node, json.nodes, meshes));
	        }
	      } catch (err) {
	        _didIteratorError7 = true;
	        _iteratorError7 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion7 && _iterator7.return) {
	            _iterator7.return();
	          }
	        } finally {
	          if (_didIteratorError7) {
	            throw _iteratorError7;
	          }
	        }
	      }
	
	      return scene_node;
	    }
	  }, {
	    key: 'processNodes',
	    value: function processNodes(node, nodes, meshes) {
	      var glNode = new _node2.Node();
	      glNode.name = node.name;
	
	      if ('mesh' in node) {
	        var mesh = meshes[node.mesh];
	        var _iteratorNormalCompletion9 = true;
	        var _didIteratorError9 = false;
	        var _iteratorError9 = undefined;
	
	        try {
	          for (var _iterator9 = mesh.primitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	            var primitive = _step9.value;
	
	            glNode.addRenderPrimitive(primitive);
	          }
	        } catch (err) {
	          _didIteratorError9 = true;
	          _iteratorError9 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion9 && _iterator9.return) {
	              _iterator9.return();
	            }
	          } finally {
	            if (_didIteratorError9) {
	              throw _iteratorError9;
	            }
	          }
	        }
	      }
	
	      if (node.matrix) {
	        glNode.matrix = new Float32Array(node.matrix);
	      } else if (node.translation || node.rotation || node.scale) {
	        if (node.translation) glNode.translation = new Float32Array(node.translation);
	
	        if (node.rotation) glNode.rotation = new Float32Array(node.rotation);
	
	        if (node.scale) glNode.scale = new Float32Array(node.scale);
	      }
	
	      if (node.children) {
	        var _iteratorNormalCompletion10 = true;
	        var _didIteratorError10 = false;
	        var _iteratorError10 = undefined;
	
	        try {
	          for (var _iterator10 = node.children[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	            var nodeId = _step10.value;
	
	            var _node = nodes[nodeId];
	            glNode.addNode(this.processNodes(_node, nodes, meshes));
	          }
	        } catch (err) {
	          _didIteratorError10 = true;
	          _iteratorError10 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion10 && _iterator10.return) {
	              _iterator10.return();
	            }
	          } finally {
	            if (_didIteratorError10) {
	              throw _iteratorError10;
	            }
	          }
	        }
	      }
	
	      return glNode;
	    }
	  }]);
	
	  return GLTF2Loader;
	}();
	
	var GLTF2Mesh = function GLTF2Mesh() {
	  _classCallCheck(this, GLTF2Mesh);
	
	  this.primitives = [];
	};
	
	var GLTF2BufferView = function () {
	  function GLTF2BufferView(json, buffers) {
	    _classCallCheck(this, GLTF2BufferView);
	
	    this.buffer = buffers[json.buffer];
	    this.byteOffset = json.byteOffset || 0;
	    this.byteLength = json.byteLength || null;
	    this.byteStride = json.byteStride;
	
	    this._viewPromise = null;
	    this._renderBuffer = null;
	  }
	
	  _createClass(GLTF2BufferView, [{
	    key: 'dataView',
	    value: function dataView() {
	      var _this2 = this;
	
	      if (!this._viewPromise) {
	        this._viewPromise = this.buffer.arrayBuffer().then(function (arrayBuffer) {
	          return new DataView(arrayBuffer, _this2.byteOffset, _this2.byteLength);
	        });
	      }
	      return this._viewPromise;
	    }
	  }, {
	    key: 'renderBuffer',
	    value: function renderBuffer(renderer, target) {
	      if (!this._renderBuffer) {
	        this._renderBuffer = renderer.createRenderBuffer(target, this.dataView());
	      }
	      return this._renderBuffer;
	    }
	  }]);
	
	  return GLTF2BufferView;
	}();
	
	var GLTF2Resource = function () {
	  function GLTF2Resource(json, baseUrl, arrayBuffer) {
	    _classCallCheck(this, GLTF2Resource);
	
	    this.json = json;
	    this.baseUrl = baseUrl;
	
	    this._dataPromise = null;
	    this._texture = null;
	    if (arrayBuffer) {
	      this._dataPromise = Promise.resolve(arrayBuffer);
	    }
	  }
	
	  _createClass(GLTF2Resource, [{
	    key: 'arrayBuffer',
	    value: function arrayBuffer() {
	      if (!this._dataPromise) {
	        if (isDataUri(this.json.uri)) {
	          var base64String = this.json.uri.replace('data:application/octet-stream;base64,', '');
	          var binaryArray = Uint8Array.from(atob(base64String), function (c) {
	            return c.charCodeAt(0);
	          });
	          this._dataPromise = Promise.resolve(binaryArray.buffer);
	          return this._dataPromise;
	        }
	
	        this._dataPromise = fetch(resolveUri(this.json.uri, this.baseUrl)).then(function (response) {
	          return response.arrayBuffer();
	        });
	      }
	      return this._dataPromise;
	    }
	  }, {
	    key: 'texture',
	    value: function texture(bufferViews) {
	      var _this3 = this;
	
	      if (!this._texture) {
	        var img = new Image();
	        this._texture = new _texture.ImageTexture(img);
	
	        if (this.json.uri) {
	          if (isDataUri(this.json.uri)) {
	            img.src = this.json.uri;
	          } else {
	            img.src = '' + this.baseUrl + this.json.uri;
	          }
	        } else {
	          var view = bufferViews[this.json.bufferView];
	          view.dataView().then(function (dataView) {
	            var blob = new Blob([dataView], { type: _this3.json.mimeType });
	            img.src = window.URL.createObjectURL(blob);
	          });
	        }
	      }
	      return this._texture;
	    }
	  }]);

	  return GLTF2Resource;
	}();

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GLTF2Scene = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _scene = __webpack_require__(14);
	
	var _gltf = __webpack_require__(20);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright 2018 The Immersive Web Community Group
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
	
	var GLTF2Scene = exports.GLTF2Scene = function (_Scene) {
	  _inherits(GLTF2Scene, _Scene);
	
	  function GLTF2Scene(url) {
	    _classCallCheck(this, GLTF2Scene);
	
	    var _this = _possibleConstructorReturn(this, (GLTF2Scene.__proto__ || Object.getPrototypeOf(GLTF2Scene)).call(this));
	
	    _this.url = url;
	    _this.gltf_node = null;
	    return _this;
	  }
	
	  _createClass(GLTF2Scene, [{
	    key: 'onRendererChanged',
	    value: function onRendererChanged(renderer) {
	      var _this2 = this;
	
	      return this.gltf2Loader.loadFromUrl(this.url).then(function (scene_node) {
	        _this2.gltf_node = scene_node;
	        _this2.addNode(_this2.gltf_node);
	        return _this2.waitForComplete();
	      });
	    }
	  }]);

	  return GLTF2Scene;
	}(_scene.Scene);

/***/ })
/******/ ])
});
;
//# sourceMappingURL=cottontail.debug.js.map