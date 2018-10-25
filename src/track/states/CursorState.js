import { pixelsToSeconds } from '../../utils/conversions';

export default class {
  constructor(track) {
    this.track = track;
    this.active = false;
  }

  setup(samplesPerPixel, sampleRate) {
    this.samplesPerPixel = samplesPerPixel;
    this.sampleRate = sampleRate;
  }

  click(e) {
    e.preventDefault();

    const startX = e.offsetX;
    const startTime = pixelsToSeconds(startX, this.samplesPerPixel, this.sampleRate);

    this.track.ee.emit('select', startTime, startTime, this.track);
  }

  completeSelection(xMouseUp) {
    const startTime = pixelsToSeconds(this.xMouseDown, this.samplesPerPixel, this.sampleRate);
    const endTime = pixelsToSeconds(xMouseUp, this.samplesPerPixel, this.sampleRate);

    this.track.ee.emit('select', startTime, endTime, this.track);
    this.active = false;
  }

  mousedown(e) {
    e.preventDefault();
    this.active = true;
    this.xMouseDown = e.offsetX;
  }

  mouseup(e) {
    if (this.active) {
      e.preventDefault();
      this.completeSelection(e.offsetX);
    }
  }

  mouseleave(e) {
    if (this.active) {
      e.preventDefault();
      this.completeSelection(e.offsetX);
    }
  }

  static getClass() {
    return '.state-cursor';
  }

  static getEvents() {
    return ['click', 'mousedown', 'mouseup', 'mouseleave'];
  }
}
