import _assign from 'lodash.assign';

import h from 'virtual-dom/h';

import { secondsToPixels, pixelsToSeconds } from './utils/conversions';
import stateClasses from './track/states';

import ImageCanvasHook from './render/ImageCanvasHook';

const MAX_CANVAS_WIDTH = 1000; // firefox & chrome: 32767, IE: 8,192

export default class {

  constructor() {
    this.name = 'Untitled';
    this.customClass = undefined;

    this.cueIn = 0;
    this.cueOut = 0;
    this.duration = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.sampleRate = 100; // default: 10ms per frame if not specified in the config
  }

  setEventEmitter(ee) {
    this.ee = ee;
  }

  setName(name) {
    this.name = name;
  }

  setCustomClass(className) {
    this.customClass = className;
  }

  setWaveOutlineColor() { // eslint-disable-line class-methods-use-this
    // no waveform
  }

  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate;
  }

  setCues(cueIn, cueOut) {
    if (cueOut < cueIn) {
      throw new Error('cue out cannot be less than cue in');
    }

    const imageEndTime = pixelsToSeconds(this.buffer.width, 1, this.sampleRate);

    this.cueIn = Math.min(cueIn, imageEndTime);
    this.cueOut = Math.min(cueOut, imageEndTime);
    this.duration = this.cueOut - this.cueIn;
    this.endTime = this.startTime + this.duration;
  }

  /*
  *   start, end in seconds relative to the entire playlist.
  */
  trim(start, end) {
    const trackStart = this.getStartTime();
    const trackEnd = this.getEndTime();
    const offset = this.cueIn - trackStart;

    if ((trackStart <= start && trackEnd >= start) ||
      (trackStart <= end && trackEnd >= end)) {
      const cueIn = (start < trackStart) ? trackStart : start;
      const cueOut = (end > trackEnd) ? trackEnd : end;

      this.setCues(cueIn + offset, cueOut + offset);
      if (start > trackStart) {
        this.setStartTime(start);
      }
    }
  }

  setStartTime(start) {
    this.startTime = start;
    this.endTime = start + this.duration;
  }

  setPlayout() { // eslint-disable-line class-methods-use-this
    // no playing
  }

  setOfflinePlayout() { // eslint-disable-line class-methods-use-this
    // no playing
  }

  setEnabledStates(enabledStates = {}) {
    const defaultStatesEnabled = {
      cursor: true,
      select: true,
      shift: true,
    };

    this.enabledStates = _assign({}, defaultStatesEnabled, enabledStates);
  }

  setFadeIn() { // eslint-disable-line class-methods-use-this
    // no fades
  }

  setFadeOut() { // eslint-disable-line class-methods-use-this
    // no fades
  }

  saveFade() { // eslint-disable-line class-methods-use-this
    // no fades
  }

  removeFade() { // eslint-disable-line class-methods-use-this
    // no fades
  }

  setBuffer(buffer) {
    this.buffer = buffer; // the png image
  }

  setPeakData() { // eslint-disable-line class-methods-use-this
    // no peak data
  }

  calculatePeaks() {  // eslint-disable-line class-methods-use-this
   // no peak data
  }

  setPeaks() { // eslint-disable-line class-methods-use-this
    // no peak data
  }

  setState(state) {
    this.state = state;

    if (this.state && this.enabledStates[this.state]) {
      const StateClass = stateClasses[this.state];
      this.stateObj = new StateClass(this);
    } else {
      this.stateObj = undefined;
    }
  }

  getStartTime() {
    return this.startTime;
  }

  getEndTime() {
    return this.endTime;
  }

  getDuration() {
    return this.duration;
  }

  isPlaying() { // eslint-disable-line class-methods-use-this
    return false; // no playing
  }

  setShouldPlay() { // eslint-disable-line class-methods-use-this
    // no playing
  }

  setGainLevel() {  // eslint-disable-line class-methods-use-this
   // no playing
  }

  setMasterGainLevel() {  // eslint-disable-line class-methods-use-this
    // no playing
  }

  /*
    cannot be played for now, will stop when no other track is available
  */
  schedulePlay() { // eslint-disable-line class-methods-use-this
    return Promise.resolve();
  }

  scheduleStop() { // eslint-disable-line class-methods-use-this
    // no playing
  }

  renderOverlay(data) {
    const channelPixels = secondsToPixels(data.playlistLength, data.resolution, data.sampleRate);

    const config = {
      attributes: {
        style: `position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: ${channelPixels}px; z-index: 9;`,
      },
    };

    let overlayClass = '';

    if (this.stateObj) {
      this.stateObj.setup(data.resolution, data.sampleRate);
      const StateClass = stateClasses[this.state];
      const events = StateClass.getEvents();

      events.forEach((event) => {
        config[`on${event}`] = this.stateObj[event].bind(this.stateObj);
      });

      overlayClass = StateClass.getClass();
    }
    // use this overlay for track event cursor position calculations.
    return h(`div.playlist-overlay${overlayClass}`, config);
  }

  renderControls(data) {
    const muteClass = data.muted ? '.active' : '';
    const soloClass = data.soloed ? '.active' : '';

    return h('div.controls',
      {
        attributes: {
          style: `height: ${data.height}px; width: ${data.controls.width}px; position: absolute; left: 0; z-index: 10;`,
        },
      }, [
        h('header', [this.name]),
        h('div.btn-group', [
          h(`span.btn.btn-default.btn-xs.btn-mute${muteClass}`, {
            onclick: () => {
              this.ee.emit('mute', this);
            },
          }, ['Mute']),
          h(`span.btn.btn-default.btn-xs.btn-solo${soloClass}`, {
            onclick: () => {
              this.ee.emit('solo', this);
            },
          }, ['Solo']),
        ]),
      ],
    );
  }

  render(data) {
    // calc based on the waveform resolution and sample rate
    const pixPerSec = data.sampleRate / data.resolution;

    const sourceWidthPx = secondsToPixels(this.duration, 1, this.sampleRate);
    const imageStretchFactor = pixPerSec / this.sampleRate;
    const targetWidthPx = Math.floor(sourceWidthPx * imageStretchFactor); // width to be drawn
    const startPx = Math.floor(this.startTime * pixPerSec);

    const waveformChildren = [];
    const channelChilds = [];

    let currentSourceCue = secondsToPixels(this.cueIn, 1, this.sampleRate);

    // split into portions of MAX_CANVAS_WIDTH at max
    const numSteps = Math.ceil(targetWidthPx / MAX_CANVAS_WIDTH);
    const sourceWidthStep = Math.floor(sourceWidthPx / numSteps);
    const targetWidthStep = Math.floor(sourceWidthStep * imageStretchFactor);

    for (let i = 0; i < numSteps; i += 1) {
      channelChilds.push(h('canvas', {
        attributes: {
          width: targetWidthStep,
          height: data.height,
          style: 'float: left; position: relative; margin: 0; padding: 0; z-index: 3;',
        },
        hook: new ImageCanvasHook(this.src, currentSourceCue, sourceWidthStep, targetWidthStep),
      }));

      currentSourceCue += sourceWidthStep;
    }

    const channel = h(`div.channel.channel-${0}`,
      {
        attributes: {
          style: `height: ${data.height}px; width: ${targetWidthPx}px; top: 0px; left: ${startPx}px; position: absolute; margin: 0; padding: 0; z-index: 1;`,
        },
      },
        channelChilds,
      );

    waveformChildren.push([channel]);
    waveformChildren.push(this.renderOverlay(data));

    // draw cursor selection on active track.
    // if (data.isActive === true) {
    const cStartX = secondsToPixels(data.timeSelection.start, data.resolution, data.sampleRate);
    const cEndX = secondsToPixels(data.timeSelection.end, data.resolution, data.sampleRate);
    const cWidth = (cEndX - cStartX) + 1;
    if (cWidth === 1) {
      waveformChildren.push(h('div.selection.point', {
        attributes: {
          style: `position: absolute; width: 1px; bottom: 0; top: 0; left: ${cStartX}px; z-index: 4;`,
        },
      }));
    } else {
      waveformChildren.push(h('div.selection.selpoint', {
        attributes: {
          style: `position: absolute; width: 1px; bottom: 0; top: 0; left: ${cStartX}px; z-index: 4;`,
        },
      }));
      waveformChildren.push(h('div.selection.segment', {
        attributes: {
          style: `position: absolute; width: ${cWidth}px; bottom: 0; top: 0; left: ${cStartX}px; z-index: 4;`,
        },
      }));
      waveformChildren.push(h('div.selection.selpoint', {
        attributes: {
          style: `position: absolute; width: 1px; bottom: 0; top: 0; left: ${cEndX}px; z-index: 4;`,
        },
      }));
    }
    // }

    const waveform = h('div.waveform',
      {
        attributes: {
          style: `height: ${data.height}px; position: relative;`,
        },
      },
      waveformChildren,
    );

    const channelChildren = [];
    let channelMargin = 0;

    if (data.controls.show) {
      channelChildren.push(this.renderControls(data));
      channelMargin = data.controls.width;
    }

    channelChildren.push(waveform);

    const audibleClass = data.shouldPlay ? '' : '.silent';
    const customClass = (this.customClass === undefined) ? '' : `.${this.customClass}`;

    return h(`div.channel-wrapper${audibleClass}${customClass}`,
      {
        attributes: {
          style: `margin-left: ${channelMargin}px; height: ${data.height}px;`,
        },
      },
      channelChildren,
    );
  }

  getTrackDetails() {
    const info = {
      src: this.src,
      start: this.startTime,
      end: this.endTime,
      name: this.name,
      customClass: this.customClass,
      cuein: this.cueIn,
      cueout: this.cueOut,
    };

    return info;
  }
}
