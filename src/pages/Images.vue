<template>
  <q-page padding>
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
      <input
        type="file"
        name=""
        id="file"
        @change="onFileChange"
        ref="file"
        accept="image/*"
        hidden
      />
      <q-btn
        color="primary"
        icon="attach_file"
        label="Elegir"
        @click="openFolder()"
      />
      <q-btn
        color="primary"
        icon-right="camera_enhance"
        @click="takePhoto()"
        label="Tomar"
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
      <div class="q-gutter-md row items-start">
        <!-- notice "basic" prop (which disables default animation) -->

        <q-img
          v-for="item in images"
          :key="item.id"
          transition="slide-left"
          :src="
            'http://18.231.186.238:3001/api/image/' +
            item.name +
            item.format +
            '/?format=webp'
          "
          style="width: 150px"
          ratio="1"
          spinner-color="white"
          class="rounded-borders"
        >
        </q-img>
      </div>
    </div>
  </q-page>
</template>

<script>
import { videoService } from "../video.service";

export default {
  // name: 'PageName',
  mixins: [videoService],
  data() {
    return {
      file: undefined,
      working: false,
      images: [],
      value: undefined,
    };
  },
  methods: {
    takePhoto() {
      const cameraOptions = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
      };

      navigator.camera.getPicture(
        (sucses) => {
          console.log(sucses);
          this.cordovaUpload(sucses);
        },
        (error) => {
          console.log(error);
        },
        cameraOptions
      );
    },
    onFileChange(e) {
      this.file = e.target.files[0];
      console.log(this.file);
      const fd = new FormData();
      fd.append("image", this.file);
      this.working = true;
      this.$axios
        .post("image/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            this.value =
              Math.round((progressEvent.loaded / progressEvent.total) * 100) /
              100;
          },
        })
        .then(async (res) => {
          this.working = false;
          this.value = undefined;
          this.images = await this.getImages({});
        })
        .catch((err) => {
          this.working = false;
        });
    },
    openFolder() {
      document.getElementById("file").click();
    },

    async cordovaUpload(pathfile) {
      var uri = encodeURI("http://18.231.186.238:3001/api/image/upload");

      var options = new FileUploadOptions();
      options.fileKey = "image";
      options.fileName = pathfile.substr(pathfile.lastIndexOf("/") + 1);
      options.mimeType = "image/jpg";

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
          this.getImages({}).then((da) => {
            this.images = da;
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
    this.images = await this.getImages({});
    console.log(this.images);
  },
};
</script>
