// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Default settings for panning. Cone parameters are experimentally
// determined.
const PANNING_MODEL = 'HRTF';
const DISTANCE_MODEL = 'inverse';
const CONE_INNER_ANGLE = 60;
const CONE_OUTER_ANGLE = 120;
const CONE_OUTER_GAIN = 0.25;

class WebVRAudioHelper {
  constructor(context) {
    // Master audio context.
    this.context = context;

    this._tmpVec = vec3.create();
    this._tmpQuat = quat.create();
  }

  // For WebAudio we want to get the position of the listener and a vector
  // representing the direction they're facing. This utility function takes
  // a matrix representing the pose (not inverted) and returns WebAudio
  // compatible vectors.
  setListenerPose(poseMat) {
    // By having the listener transition between poses we introduce a small
    // amount of latency, but avoid some potential audio artifacts introduced
    // but sudden position/orientation jumps in the panner.
    let tmpVec = this._tmpVec;
    let tmpQuat = this._tmpQuat;

    let listener = this.context.listener;
    let targetTime = this.context.currentTime + 0.1; // 10ms transition time

    let audioPose = new AudioPose(targetTime);

    mat4.getTranslation(tmpVec, poseMat);
    listener.positionX.linearRampToValueAtTime(tmpVec[0], targetTime);
    listener.positionY.linearRampToValueAtTime(tmpVec[1], targetTime);
    listener.positionZ.linearRampToValueAtTime(tmpVec[2], targetTime);

    mat4.getRotation(tmpQuat, poseMat);

    vec3.transformQuat(tmpVec, [0, 0, -1], tmpQuat);
    vec3.normalize(tmpVec, tmpVec);
    listener.forwardX.linearRampToValueAtTime(tmpVec[0], targetTime);
    listener.forwardY.linearRampToValueAtTime(tmpVec[1], targetTime);
    listener.forwardZ.linearRampToValueAtTime(tmpVec[2], targetTime);

    vec3.transformQuat(tmpVec, [0, 1, 0], tmpQuat);
    vec3.normalize(tmpVec, tmpVec);
    listener.upX.linearRampToValueAtTime(tmpVec[0], targetTime);
    listener.upY.linearRampToValueAtTime(tmpVec[1], targetTime);
    listener.upZ.linearRampToValueAtTime(tmpVec[2], targetTime);
  }

  /**
   * Load an audio file asynchronously.
   * @param {Object} options.url Audio file info in the format of {name, url}
   * @return {Promise} Promise.
   */
  createAudioSource(options) {
    let url = options.url;
    return fetch(url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => this.context.decodeAudioData(buffer))
        .then((decodedBuffer) => {
          return new WebVRAudioSource(this.context, decodedBuffer, options);
        });
  }
}

/**
 * A buffer source player with HRTF panning.
 */
class WebVRAudioSource {
  /**
   * @param {Object} options Default options.
   * @param {Number} options.gain Sound object gain. (0.0~1.0)
   * @param {Number} options.buffer AudioBuffer to play.
   * @param {Number} options.detune Detune parameter. (cent)
   * @param {Array} options.position x, y, z position in a array.
   * @param {Array} options.orientation x, y, z direction vector in a array.
   */
  constructor(context, decodedBuffer, options) {
    this._src = context.createBufferSource();
    this._out = context.createGain();
    this._panner = context.createPanner();
    this._analyser = context.createAnalyser();

    this._src.connect(this._out);
    this._out.connect(this._analyser);
    this._analyser.connect(this._panner);
    this._panner.connect(context.destination);
    
    this._src.buffer = decodedBuffer;
    this._src.loop = true;
    this._out.gain.value = options.gain;

    this._analyser.fftSize = 1024;
    this._analyser.smoothingTimeConstant = 0.85;
    this._lastRMSdB = 0.0;

    this._panner.panningModel = PANNING_MODEL;
    this._panner.distanceModel = DISTANCE_MODEL;
    this._panner.coneInnerAngle = CONE_INNER_ANGLE;
    this._panner.coneOuterAngle = CONE_OUTER_ANGLE;
    this._panner.coneOuterGain = CONE_OUTER_GAIN;

    this._analyserBuffer = new Uint8Array(this._analyser.fftSize);

    this._src.detune.value = (options.detune || 0);
    this._analyserBuffer = new Float32Array(this._analyser.fftSize);

    this._position = [0, 0, 0];
    this._orientation = [1, 0, 0];

    this.position = options.position;
    this.orientation = options.orientation;
  }

  start() {
    this._src.start(0);
  }

  stop() {
    this._src.stop(0);
  }

  get position() {
    return this._position;
  }

  set position(value) {
    if (value && value.length >= 3) {
      this._position[0] = value[0];
      this._position[1] = value[1];
      this._position[2] = value[2];
    }

    this._panner.setPosition(value[0], value[1], value[2]);
  }

  get orientation() {
    return this._orientation;
  }

  set orientation(value) {
    if (value && value >= 3) {
      this._orientation[0] = value[0];
      this._orientation[1] = value[1];
      this._orientation[2] = value[2];
    }

    this._panner.setOrientation(value[0], value[1], value[2]);
  }

  /**
   * Returns a floating point value that represents the loudness of the audio
   * stream, appropriate for scaling an object with.
   * @return {Number} loudness scalar.
   */
  getLoudnessScale() {
    this._analyser.getFloatTimeDomainData(this._analyserBuffer);
    for (let i = 0, sum = 0; i < this._analyserBuffer.length; ++i)
      sum += this._analyserBuffer[i] * this._analyserBuffer[i];
    
    // Calculate RMS and convert it to DB for perceptual loudness.
    let rms = Math.sqrt(sum / this._analyserBuffer.length);
    let db = 30 + 10 / Math.LN10 * Math.log(rms <= 0 ? 0.0001 : rms);

    // Moving average with the alpha of 0.525. Experimentally determined.
    this._lastRMSdB += 0.525 * ((db < 0 ? 0 : db) - this._lastRMSdB);

    // Scaling by 1/30 is also experimentally determined.
    return this._lastRMSdB / 30.0;
  }
}
