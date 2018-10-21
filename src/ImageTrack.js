import _assign from 'lodash.assign';

import h from 'virtual-dom/h';

import extractPeaks from 'webaudio-peaks';

import { secondsToPixels, secondsToSamples } from './utils/conversions';
import stateClasses from './track/states';

import ImageCanvasHook from './render/ImageCanvasHook';

const MAX_CANVAS_WIDTH = 1000;

export default class {

  constructor() {
    this.name = 'Untitled';
    this.imageName = undefined;
    this.customClass = undefined;
    this.waveOutlineColor = undefined;
    this.gain = 1;
    this.peakData = {
      type: 'WebAudio',
      mono: false,
    };

    this.cueIn = 0;
    this.cueOut = 0;
    this.duration = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  setEventEmitter(ee) {
    this.ee = ee;
  }

  setName(name) {
    this.name = name;
  }

  setImage(imageName) {
    this.imageName = imageName;
  }


  setCustomClass(className) {
    this.customClass = className;
  }

  setWaveOutlineColor(color) {
    this.waveOutlineColor = color;
  }

  setCues(cueIn, cueOut) {
    if (cueOut < cueIn) {
      throw new Error('cue out cannot be less than cue in');
    }

    this.cueIn = cueIn;
    this.cueOut = cueOut;
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

  setPlayout(playout) {
    this.playout = playout;
  }

  setOfflinePlayout(playout) {
    this.offlinePlayout = playout;
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
    this.buffer = buffer;
  }

  setPeakData(data) { // eslint-disable-line class-methods-use-this
    this.peakData = data;
  }

  calculatePeaks(samplesPerPixel, sampleRate) {
    const cueIn = secondsToSamples(this.cueIn, sampleRate);
    const cueOut = secondsToSamples(this.cueOut, sampleRate);

    this.setPeaks(extractPeaks(this.buffer, samplesPerPixel, this.peakData.mono, cueIn, cueOut));
  }

  setPeaks(peaks) {
    this.peaks = peaks;
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

  isPlaying() {
    return this.playout.isPlaying();
  }

  setShouldPlay(bool) {
    this.playout.setShouldPlay(bool);
  }

  setGainLevel(level) {
    this.gain = level;
    this.playout.setVolumeGainLevel(level);
  }

  setMasterGainLevel(level) {
    this.playout.setMasterGainLevel(level);
  }

  /*
    startTime, endTime in seconds (float).
    segment is for a highlighted section in the UI.

    returns a Promise that will resolve when the AudioBufferSource
    is either stopped or plays out naturally.
  */
  schedulePlay(now, startTime, endTime, config) {
    let start;
    let duration;
    let when = now;
    let segment = (endTime) ? (endTime - startTime) : undefined;

    const defaultOptions = {
      shouldPlay: true,
      masterGain: 1,
      isOffline: false,
    };

    const options = _assign({}, defaultOptions, config);
    const playoutSystem = options.isOffline ? this.offlinePlayout : this.playout;

    // 1) track has no content to play.
    // 2) track does not play in this selection.
    if ((this.endTime <= startTime) || (segment && (startTime + segment) < this.startTime)) {
      // return a resolved promise since this track is technically "stopped".
      return Promise.resolve();
    }

    // track should have something to play if it gets here.

    // the track starts in the future or on the cursor position
    if (this.startTime >= startTime) {
      start = 0;
      // schedule additional delay for this audio node.
      when += (this.startTime - startTime);

      if (endTime) {
        segment -= (this.startTime - startTime);
        duration = Math.min(segment, this.duration);
      } else {
        duration = this.duration;
      }
    } else {
      start = startTime - this.startTime;

      if (endTime) {
        duration = Math.min(segment, this.duration - start);
      } else {
        duration = this.duration - start;
      }
    }

    start += this.cueIn;
    const sourcePromise = playoutSystem.setUpSource();


    playoutSystem.setVolumeGainLevel(this.gain);
    playoutSystem.setShouldPlay(options.shouldPlay);
    playoutSystem.setMasterGainLevel(options.masterGain);
    playoutSystem.play(when, start, duration);

    return sourcePromise;
  }

  scheduleStop(when = 0) {
    this.playout.stop(when);
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
    const numChan = this.peaks.data.length;

    return h('div.controls',
      {
        attributes: {
          style: `height: ${numChan * data.height}px; width: ${data.controls.width}px; position: absolute; left: 0; z-index: 10;`,
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
    const width = this.peaks.length;
    const playbackX = secondsToPixels(data.playbackSeconds, data.resolution, data.sampleRate);
    const startX = secondsToPixels(this.startTime, data.resolution, data.sampleRate);
    const endX = secondsToPixels(this.endTime, data.resolution, data.sampleRate);
    let progressWidth = 0;
    const numChan = this.peaks.data.length;

    if (playbackX > 0 && playbackX > startX) {
      if (playbackX < endX) {
        progressWidth = playbackX - startX;
      } else {
        progressWidth = width;
      }
    }

    const waveformChildren = [
      h('div.cursor', {
        attributes: {
          style: `position: absolute; width: 1px; margin: 0; padding: 0; top: 0; left: ${playbackX}px; bottom: 0; z-index: 5;`,
        },
      }),
    ];

    const channels = Object.keys(this.peaks.data).map((channelNum) => {
      const channelChildren = [
        h('div.channel-progress', {
          attributes: {
            style: `position: absolute; width: ${progressWidth}px; height: ${data.height}px; z-index: 2;`,
          },
        }),
      ];
      let offset = 0;
      let totalWidth = width;

      while (totalWidth > 0) {
        const currentWidth = Math.min(totalWidth, MAX_CANVAS_WIDTH);

        channelChildren.push(h('canvas', {
          attributes: {
            width: currentWidth,
            height: data.height,
            style: 'float: left; position: relative; margin: 0; padding: 0; z-index: 3;',
          },
          hook: new ImageCanvasHook(this.imageName, offset),
        }));

        totalWidth -= currentWidth;
        offset += MAX_CANVAS_WIDTH;
      }

      return h(`div.channel.channel-${channelNum}`,
        {
          attributes: {
            style: `height: ${data.height}px; width: ${width}px; top: ${channelNum * data.height}px; left: ${startX}px; position: absolute; margin: 0; padding: 0; z-index: 1;`,
          },
        },
        channelChildren,
      );
    });

    waveformChildren.push(channels);
    waveformChildren.push(this.renderOverlay(data));

    // draw cursor selection on active track.
    if (data.isActive === true) {
      const cStartX = secondsToPixels(data.timeSelection.start, data.resolution, data.sampleRate);
      const cEndX = secondsToPixels(data.timeSelection.end, data.resolution, data.sampleRate);
      const cWidth = (cEndX - cStartX) + 1;
      const cClassName = (cWidth > 1) ? '.segment' : '.point';

      waveformChildren.push(h(`div.selection${cClassName}`, {
        attributes: {
          style: `position: absolute; width: ${cWidth}px; bottom: 0; top: 0; left: ${cStartX}px; z-index: 4;`,
        },
      }));
    }

    const waveform = h('div.waveform',
      {
        attributes: {
          style: `height: ${numChan * data.height}px; position: relative;`,
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
          style: `margin-left: ${channelMargin}px; height: ${data.height * numChan}px;`,
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
