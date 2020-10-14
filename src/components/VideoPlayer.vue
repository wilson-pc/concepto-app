<template>
  <div>
    <video
      :width="this.$q.screen.width - 10"
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      data-setup='{ "playbackRates": [0.5, 1, 1.5, 2]}'
      controls
    ></video>
  </div>
</template>

<script>
import videojs from "video.js";
import { AppFullscreen } from "quasar";
import "video.js/dist/video-js.min.css";
import "videojs-iplayer-skin-1/dist/videojs-iplayer-theme.css";
import "videojs-contrib-quality-levels";
import "videojs-max-quality-selector";
import "videojs-max-quality-selector/dist/videojs-max-quality-selector.css";
export default {
  name: "VideoPlayer",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    videojs.options.autoplay = true;
    this.player = videojs(
      this.$refs.videoPlayer,
      this.options,
      function onPlayerReady() {
        console.log("onPlayerReady", this);
      }
    );
    this.player.maxQualitySelector();
    this.player.on("fullscreenchange", function (e) {
      // do stuff...
      console.log(this.player());
      if (this.player().isFullscreen()) {
        console.log("Video fullscreenchange: Video entered fullscreen");
        StatusBar.hide();
      } else {
        StatusBar.show();
        console.log("Video fullscreenchange: Video exited fullscreen");
      }
      console.log("todo llega ", e);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
<style >
.video-js .vjs-control.vjs-fullscreen-control,
.video-js .vjs-control.vjs-subs-caps-button,
.video-js .vjs-control.vjs-playback-rate,
.video-js .vjs-control.vjs-captions-button,
.video-js .vjs-control.vjs-chapters-button,
.video-js .vjs-control.vjs-volume-menu-button,
.video-js .vjs-control.vjs-quality-button,
.video-js .vjs-control.vjs-descriptions-button,
.video-js .vjs-control.vjs-audio-button,
.vjs-default-skin .vjs-control.vjs-fullscreen-control,
.vjs-default-skin .vjs-control.vjs-subs-caps-button,
.vjs-default-skin .vjs-control.vjs-playback-rate,
.vjs-default-skin .vjs-control.vjs-captions-button,
.vjs-default-skin .vjs-control.vjs-chapters-button,
.vjs-default-skin .vjs-control.vjs-volume-menu-button,
.vjs-default-skin .vjs-control.vjs-quality-button,
.vjs-default-skin .vjs-picture-in-picture-control,
.vjs-default-skin .vjs-max-quality-selector-button,
.vjs-default-skin .vjs-quality-selector,
.vjs-default-skin .vjs-control.vjs-descriptions-button,
.vjs-default-skin .vjs-control.vjs-audio-button {
  width: 44px;
  height: 44px;
  transition: background-color 0.5s ease;
  bottom: -76px;
  position: relative;
}
</style>