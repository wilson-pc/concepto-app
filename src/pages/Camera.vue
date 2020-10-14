<template>
  <q-page padding>
    <!-- content -->

    <div
      center
      align="center"
      class="center"
      style="
         {
          align: center;
        }
      "
    >
      <q-btn
        color="primary"
        icon-right="camera_enhance"
        @click="takeVideo()"
        label="Tomar video"
      />

      <br />
      <div center algin="center" class="center process" v-if="working">
        <q-circular-progress
          align="center"
          show-value
          font-size="12px"
          :value="value"
          size="70px"
          :thickness="0.22"
          color="teal"
          track-color="grey-3"
          class="q-ma-md center"
        >
          {{ value }}%
        </q-circular-progress>
        <br />
        <span> Subiendo</span>
        <br />
        <br />
      </div>
      <br />
      <b></b>
      <div v-for="item in videos" v-bind:key="item.id">
        <video-player :options="setVideoOptios(item)" />
        <br />
      </div>
    </div>
  </q-page>
</template>

<script>
import { videoService } from "../video.service";
import VideoPlayer from "../components/VideoPlayer.vue";
export default {
  // name: 'PageName',
  mixins: [videoService],
  components: {
    VideoPlayer,
  },
  data() {
    return {
      file: undefined,
      working: false,
      videos: [],
      value: undefined,
    };
  },
  methods: {
    setVideoOptios(video) {
      return {
        autoplay: false,
        poster:
          "https://i1.wp.com/ashishuideveloper.in/wp-content/uploads/poster-image.jpg",
        controls: true,
        html5: {
          hls: {
            overrideNative: true,
          },
        },
        sources: [
          {
            src: video.hls
              ? "http://18.231.186.238:3001/api/" + video.name + "/video.m3u8"
              : "http://18.231.186.238:3001/api/" +
                video.name +
                video.format +
                "/video.m3u8",
            type: video.hls ? "application/vnd.apple.mpegurl" : "video/mp4",
          },
        ],
      };
    },
    takeVideo() {
      navigator.device.capture.captureVideo(
        (subses) => {
          console.log(subses);
          var file = subses[0];
          this.cordovaUpload(file.fullPath);
        },
        (error) => {
          console.log(error);
        },
        {
          limit: 1,
        }
      );
    },
    async cordovaUpload(pathfile) {
      var uri = encodeURI("http://18.231.186.238:3001/api/upload");

      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = pathfile.substr(pathfile.lastIndexOf("/") + 1);
      options.mimeType = "video/mp4";

      var ft = new FileTransfer();

      ft.onprogress = (progressEvent) => {
        this.working = true;

        this.value = Math.ceil(
          (progressEvent.loaded / progressEvent.total) * 100
        );
      };
      ft.upload(
        pathfile,
        uri,
        (sucses) => {
          this.working = false;
          this.getVideos({}).then((da) => {
            this.videos = da;
          });
        },
        (falil) => {
          console.log(falil);
        },
        options
      );
    },
  },
  async mounted() {
    this.videos = await this.getVideos({});
  },
};
</script>
