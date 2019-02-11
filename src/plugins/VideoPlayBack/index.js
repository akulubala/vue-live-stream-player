import VideoPlayback from './VideoPlayback';
var optionsDefaults = {
  data: {},
};

export default {
  install(Vue, opts) {
    Vue.component(VideoPlayback.name, VideoPlayback);
    const options = { ...optionsDefaults, ...opts };
  },
};
