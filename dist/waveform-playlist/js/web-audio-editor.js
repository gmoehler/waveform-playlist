const playlist = WaveformPlaylist.init({
  samplesPerPixel: 3000,
  waveHeight: 100,
  container: document.getElementById('playlist'),
  state: 'cursor',
  colors: {
    waveOutlineColor: '#E0EFF1',
    timeColor: 'grey',
    fadeColor: 'black',
  },
  timescale: true,
  controls: {
    show: true, // whether or not to include the track controls
    width: 200, // width of controls in pixels
  },
  seekStyle: 'line',
  zoomLevels: [500, 1000, 3000, 5000],
});

playlist.load([
  {
    src: 'media/audio/Vocals30.mp3',
    name: 'Vocals',
    fadeIn: {
      duration: 0.5,
    },
    fadeOut: {
      duration: 0.5,
    },
    cuein: 5.918,
    cueout: 14.5,
    customClass: 'vocals',
    waveOutlineColor: '#c0dce0',
  },
  {
    src: 'media/audio/BassDrums30.mp3',
    name: 'Drums',
    start: 3,
    soloed: false,
    fadeIn: {
      shape: 'logarithmic',
      duration: 0.5,
    },
    fadeOut: {
      shape: 'logarithmic',
      duration: 0.5,
    },
  },
  {
    src: 'media/audio/Guitar30.mp3',
    name: 'Guitar',
    start: 23.5,
    cuein: 16,
    waveOutlineColor: '#c0dce0',
  },
  {
    src: 'media/audio/Guitar30.mp3',
    img: 'media/image/poi.png',
    frameStep: 10, // one image frame is 10ms
    name: 'Spirals',
    start: 23.5,
    cuein: 0,
    cueout: 1.47,
  },
  {
    src: 'media/audio/Guitar30.mp3',
    img: 'media/image/poi2.png',
    name: 'Spirals',
    frameStep: 10, // one image frame is 10ms
    start: 3,
    cuein: 0,
    cueout: 1.47,

  },

]).then(() => {
  // can do stuff with the playlist.

  // initialize the WAV exporter.
  playlist.initExporter();
});
