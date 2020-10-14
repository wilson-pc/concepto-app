<template>
  <q-page class="flex flex-center">
    <q-pull-to-refresh @refresh="refresh">
      <q-select v-model="model" :options="options" label="opciones de subida" />

      <br />
      <q-uploader
        v-if="model.value.width == 0"
        label="Elige tu video"
        multiple
        name="file"
        :field-name="(file) => 'file'"
        ref="uploader"
        url="http://18.231.186.238:3001/api/upload"
        @finish="finished"
        accept="video/*"
        @rejected="onRejected"
      />
      <q-input
        @click="select()"
        v-if="model.value.width != 0 || !working"
        outlined
        v-model="filo"
      >
        <div>{{ filo }}</div>
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-input>

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
        <span>{{ operation }}</span>
        <br />
        <br />
      </div>
      <div v-for="item in videos" v-bind:key="item.id">
        <video-player :options="setVideoOptios(item)" />
        <br />
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { videoService } from "../video.service";
import VideoPlayer from "../components/VideoPlayer.vue";
export default {
  name: "PageIndex",
  mixins: [videoService],
  components: {
    VideoPlayer,
  },
  data() {
    return {
      videos: [],
      filo: null,
      operation: "optimizando video",
      working: false,
      value: undefined,
      model: {
        label: "original",
        value: { width: 0, height: 2, videoBitrate: 600000 },
      },
      options: [
        {
          label: "original",
          value: { width: 0, height: 2, videoBitrate: 600000 },
        },
        {
          label: "baja calidad",
          value: { width: 640, height: 360, videoBitrate: 600000 },
        },
        {
          label: "calidad normal",
          value: { width: 854, height: 480, videoBitrate: 900000 },
        },
        {
          label: "calta calidad",
          value: { width: 1280, height: 720, videoBitrate: 1200000 },
        },
      ],
      uploadPercentage: 0,
      videoOptions: {
        autoplay: false,
        poster:
          "https://i1.wp.com/ashishuideveloper.in/wp-content/uploads/poster-image.jpg",
        controls: true,
        sources: [
          {
            src:
              "http://18.231.186.238:3001/api/dc735746f288f160635221f5f4493c71.mp4/gd",
            type: "video/mp4",
          },
        ],
      },
    };
  },
  methods: {
    async select() {
      fileChooser.open({ mime: "video/*" }, (uri) => {
        console.log(uri);
        VideoEditor.transcodeVideo(
          (das) => {
            this.working = false;
            this.value = undefined;
            this.cordovaUpload(das);
          }, // success cb
          (error) => {
            console.log(error);
          }, // error cb
          {
            fileUri: uri, // the path to the video on the device
            outputFileName: uri.substr(uri.lastIndexOf("/") + 1), // the file name for the transcoded video
            width: this.model.value.width, // optional, see note below on width and height
            videoBitrate: this.model.value.videoBitrate,
            height: this.model.value.height, // optional, see notes below on width and height
            outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
            optimizeForNetworkUse: VideoEditorOptions.OptimizeForNetworkUse.YES,

            saveToLibrary: true, // optional, defaults to true,
            progress: (info) => {
              this.working = true;
              console.log(Math.ceil(info * 100));
              this.value = Math.ceil(info * 100);
            },
          }
        );
      });
    },
    async cordovaUpload(pathfile) {
      var uri = encodeURI("http://18.231.186.238:3001/api/upload");
      this.operation = "subiendo video";
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
          this.getVideos({
            orderBy: { createdAt: "desc" },
          }).then((da) => {
            this.videos = da;
          });
        },
        (falil) => {
          console.log(falil);
        },
        options
      );
    },
    async refresh(done) {
      this.videos = [];
      this.videos = await this.getVideos({
        orderBy: { createdAt: "desc" },
      });
      done();
    },
    async finished() {
      this.videos = await this.getVideos({
        orderBy: { createdAt: "desc" },
      });
    },
    uploadFile(file, updateProgress) {
      const fd = new FormData();
      fd.append("file", file);
      updateProgress(0);
      return new Promise((resolve, reject) => {
        this.$axios
          .post("upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              updateProgress(
                Math.round((progressEvent.loaded / progressEvent.total) * 100) /
                  100
              );
            },
          })
          .then((res) => {
            resolve(file);
          })
          .catch((err) => reject(err));
      });
    },
    onRejected(rejectedEntries) {
      // Notify plugin needs to be installed
      // https://quasar.dev/quasar-plugins/notify#Installation
      this.$q.notify({
        type: "negative",
        message: `${rejectedEntries.length} file(s) did not pass validation constraints`,
      });
    },
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
              ? "http://192.168.1.9:3000/api/" + video.name + "/video.m3u8"
              : "http://192.168.1.9:3000/api/" +
                video.name +
                video.format +
                "/video.m3u8",
            type: video.hls ? "application/vnd.apple.mpegurl" : "video/mp4",
          },
        ],
      };
    },
  },
  async mounted() {
    try {
      this.videos = await this.getVideos({
        orderBy: { createdAt: "desc" },
      });
      var permissions = cordova.plugins.permissions;

      var list = [
        permissions.READ_EXTERNAL_STORAGE,
        permissions.MANAGE_EXTERNAL_STORAGE,
        permissions.ACCESS_FINE_LOCATIONE,
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_PHONE_STATE,
        permissions.READ_EXTERNAL_STORAGE,
        permissions.CAMERA,
      ];
      permissions.requestPermission(
        list,
        (sus) => {
          console.log("sus", sus);
        },
        (error) => {
          console.warn("Camera permission is not turned on");
        }
      );
    } catch (error) {}
  },
};
</script>
<style >
.process {
  align-content: center;
  align-items: center;
  padding-left: 35%;
}
</style>
