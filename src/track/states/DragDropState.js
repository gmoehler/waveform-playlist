import { pixelsToSeconds } from '../../utils/conversions';

export default class {
  constructor(track) {
    this.track = track;
  }

  setup(samplesPerPixel, sampleRate) {
    this.samplesPerPixel = samplesPerPixel;
    this.sampleRate = sampleRate;
  }

  drop(e) {
    e.preventDefault();
    const xMousePos = e.offsetX;
    const endTime = pixelsToSeconds(xMousePos, this.samplesPerPixel, this.sampleRate);

    this.track.ee.emit('select', endTime, endTime, this.track);

    // let dropEvent = e.originalEvent;
  }

  static getClass() {
    return '.state-dragdrop';
  }

  static getEvents() {
    return ['drop'];
  }
}
