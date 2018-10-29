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
    const xMouseUp = e.offsetX;

    if (this.clickEnd - this.clickStart > 500
        || Math.abs(xMouseUp - this.xMouseDown) > 10) {
      // range selection
      this.completeSelection(this.xMouseDown, xMouseUp, true);
    } else {
      // set curser
      this.completeSelection(this.xMouseDown, xMouseUp, true);
    }
  }

  completeSelection(xMouseDown, xMouseUp, completeSelection) {
    const startTime = pixelsToSeconds(xMouseDown, this.samplesPerPixel, this.sampleRate);
    const endTime = pixelsToSeconds(xMouseUp, this.samplesPerPixel, this.sampleRate);

    this.track.ee.emit('select', startTime, endTime, this.track);
    this.active = !completeSelection;
  }

  mousedown(e) {
    e.preventDefault();
    this.active = true;
    this.clickStart = new Date().getTime();
    this.xMouseDown = e.offsetX;
  }

  mouseup(e) {
    if (this.active) {
      e.preventDefault();
      this.clickEnd = new Date().getTime();
    }
  }

  mousemove(e) {
    if (this.active) {
      e.preventDefault();
      const xMousePos = e.offsetX;
      // draw selection based on mouse position
      this.completeSelection(this.xMouseDown, xMousePos, false);
    }
  }

  mouseleave() {
    if (this.active) {
      this.active = false;
    }
  }

  static getClass() {
    return '.state-cursor';
  }

  static getEvents() {
    return ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseleave'];
  }
}
