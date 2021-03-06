import { pixelsToSeconds } from '../../utils/conversions';

export default class {
  constructor(track) {
    this.track = track;
  }

  setup(samplesPerPixel, sampleRate) {
    this.samplesPerPixel = samplesPerPixel;
    this.sampleRate = sampleRate;
  }

  dragenter(e) {
    e.preventDefault();
    e.target.classList.add('drag-enter');
  }

  dragover(e) {
    e.preventDefault();
  }

  dragleave(e) {
    e.preventDefault();
    e.target.classList.remove('drag-enter');
  }

  drop(e) {
    e.preventDefault();
    const xMousePos = e.offsetX;
    const endTime = pixelsToSeconds(xMousePos, this.samplesPerPixel, this.sampleRate);

    this.track.ee.emit('select', endTime, endTime, this.track);

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      console.log(e.dataTransfer.files[i]);
    }
  }

  static getClass() {
    return '.state-dragdrop';
  }

  static getEvents() {
    return ['dragenter', 'dragover', 'dragleave', 'drop'];
  }
}
