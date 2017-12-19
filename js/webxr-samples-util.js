// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

window.XRSamplesUtil = (function () {

  "use strict";

  // Lifted from the WebXR Polyfill
  function isMobile () {
    return /Android/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function getMessageContainer () {
    let messageContainer = document.getElementById("xr-sample-message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "xr-sample-message-container";
      messageContainer.style.fontFamily = "sans-serif";
      messageContainer.style.position = "absolute";
      messageContainer.style.zIndex = "999";
      messageContainer.style.left = "0";
      messageContainer.style.top = "0";
      messageContainer.style.right = "0";
      messageContainer.style.margin = "0";
      messageContainer.style.padding = "0";
      messageContainer.align = "center";
      document.body.appendChild(messageContainer);
    }
    return messageContainer;
  }

  function addMessageElement (message, backgroundColor) {
    let messageElement = document.createElement("div");
    messageElement.classList.add = "xr-sample-message";
    messageElement.style.color = "#FFF";
    messageElement.style.backgroundColor = backgroundColor;
    messageElement.style.borderRadius = "3px";
    messageElement.style.position = "relative";
    messageElement.style.display = "inline-block";
    messageElement.style.margin = "0.5em";
    messageElement.style.padding = "0.75em";

    messageElement.innerHTML = message;

    getMessageContainer().appendChild(messageElement);

    return messageElement;
  }

  // Makes the given element fade out and remove itself from the DOM after the
  // given timeout.
  function makeToast (element, timeout) {
    element.style.transition = "opacity 0.5s ease-in-out";
    element.style.opacity = "1";
    setTimeout(function () {
      element.style.opacity = "0";
      setTimeout(function () {
        if (element.parentElement)
          element.parentElement.removeChild(element);
      }, 500);
    }, timeout);
  }

  function addError (message, timeout) {
    let element = addMessageElement("<b>ERROR:</b> " + message, "#D33");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function addInfo (message, timeout) {
    let element = addMessageElement(message, "#22A");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function getButtonContainer () {
    let buttonContainer = document.getElementById("xr-sample-button-container");
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.id = "xr-sample-button-container";
      buttonContainer.style.fontFamily = "sans-serif";
      buttonContainer.style.position = "absolute";
      buttonContainer.style.zIndex = "999";
      buttonContainer.style.left = "0";
      buttonContainer.style.bottom = "0";
      buttonContainer.style.right = "0";
      buttonContainer.style.margin = "0";
      buttonContainer.style.padding = "0";
      buttonContainer.align = "right";
      document.body.appendChild(buttonContainer);
    }
    return buttonContainer;
  }

  // Creates a WebGL context and initializes it with some common default state.
  function initWebGLContext(glAttribs) {
    glAttribs = glAttribs || { alpha: false };

    let webglCanvas = document.createElement("canvas");
    let contextTypes = glAttribs.webgl2 ? ["webgl2"] : ["webgl", "experimental-webgl"];
    let context = null;

    for (let contextType of contextTypes) {
      context = webglCanvas.getContext(contextType, glAttribs);
      if (context)
        break;
    }

    if (!context) {
      var webglType = (glAttribs.webgl2 ? "WebGL 2" : "WebGL")
      addError("Your browser does not support " + webglType + ".");
      return null;
    }

    // Set up a non-black clear color so that we can see if something
    // renders wrong.
    context.clearColor(0.1, 0.2, 0.3, 1.0);

    // Enabled depth testing and face culling
    context.enable(context.DEPTH_TEST);
    context.enable(context.CULL_FACE);

    return context;
  }

  return {
    isMobile: isMobile,
    addError: addError,
    addInfo: addInfo,
    makeToast: makeToast,
    initWebGLContext: initWebGLContext
  };
})();
