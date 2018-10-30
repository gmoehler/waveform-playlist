const notes = [
  {
    begin: '0.000',
    children: [],
    end: '2.680',
    id: 'f000001',
    language: 'eng',
    lines: [
      '1',
    ],
  },
  {
    begin: '2.680',
    children: [],
    end: '5.880',
    id: 'f000002',
    language: 'eng',
    lines: [
      'From fairest creatures we desire increase,',
    ],
  },
  {
    begin: '5.880',
    children: [],
    end: '9.240',
    id: 'f000003',
    language: 'eng',
    lines: [
      "That thereby beauty's rose might never die,",
    ],
  },
];

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
  annotationList: {
    annotations: notes,
    // controls: actions,
    editable: true,
    isContinuousPlay: false,
    linkEndpoints: true,
  },
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
    // src: 'media/audio/Guitar30.mp3',
    src: 'media/image/poi.png',
    sampleRate: 100,  // one image frame is 10ms
    name: 'Spirals',
    start: 23.5,
    cuein: 0.5,       // in secs
    cueout: 1.47,      // in secs
  },
  {
    src: 'media/image/poi2.png',
    name: 'Spirals',
    sampleRate: 100,  // one image frame is 10ms
    start: 3,
    cuein: 0.5,         // in secs
    cueout: 0.7,      // in secs

  },

]).then(() => {
  // can do stuff with the playlist.

  // initialize the WAV exporter.
  playlist.initExporter();
});
