<template>
  <q-page padding>
    <div class="col-4" center align="center">
      <input
        type="file"
        name=""
        id="file"
        @change="onFileChange"
        ref="file"
        accept="image/*"
        hidden
      />
      <input
        type="file2"
        name=""
        id="file"
        @change="onFileChange"
        ref="file"
        accept="image/*"
        hidden
      />
      <q-img :src="cover" style="width: 150px" @click="openFolder()" />
    </div>
    <q-file
      v-model="model"
      v-if="video == undefined"
      label="Selecciona video"
      @input="changeVideo"
    />
    <video-player v-else :options="setVideoOptios(video)" />
    <q-input v-model="recipe.name" label="Titulo de la receta" />
    <q-input v-model="recipe.description" label="Descripcion" />
    <q-input v-model="recipe.people" label="Comensales" />
    <h6>Ingredientes</h6>
    <q-list bordered>
      <q-item v-for="(item, index) in ingredients" v-bind:key="index">
        <q-item-section>
          <q-input v-model="item.name" placeholder="ej: 3 piesas de ajo" />
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="delete_forever" />
        </q-item-section>
      </q-item>
    </q-list>
    <div align="center">
      <q-btn flat icon="add" @click="addItem()" label="Ingrediente" />
    </div>
    <h6>Pasos</h6>
    <div bordered>
      <div v-for="(item, index) in steps" v-bind:key="index">
        <q-item-section>
          <q-input
            v-model="item.name"
            placeholder="ej: Calentar el agua por 40 minutos"
          />
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="delete_forever" />
        </q-item-section>
        <div algin="center">
          <q-img
            v-for="(image, idx) in item.images"
            v-bind:key="idx"
            :src="
              'http://192.168.1.9:3000/api/image/' +
              image.name +
              image.format +
              '/?format=webp'
            "
            spinner-color="red"
            style="height: 140px; max-width: 150px"
          />

          <q-img
            :src="'https://toppng.com/uploads/preview/file-upload-image-icon-115632290507ftgixivqp.png'"
            spinner-color="red"
            style="height: 140px; max-width: 150px"
            @click="stepImage(item)"
          />
        </div>
      </div>
    </div>
    <div align="center">
      <q-btn flat icon="add" @click="addStep()" label="mas pasos" />
    </div>
    <br />
    <div align="center">
      <q-btn
        align="center"
        color="primary"
        label="Publicar"
        @click="publish()"
      />
    </div>
    <q-dialog
      v-model="persistent"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Subiendo video</div>
        </q-card-section>

        <q-card-section class="q-pt-none text-center">
          <q-circular-progress
            show-value
            class="text-light-blue q-ma-md"
            :value="value"
            size="60px"
            color="light-blue"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { recipeService } from "../recipe.service";
import VideoPlayer from "../components/VideoPlayer.vue";

export default {
  mixins: [recipeService],
  components: {
    VideoPlayer,
  },
  // name: 'PageName',
  data() {
    return {
      persistent: false,
      value: 81,
      model: null,
      video: undefined,
      recipe: { name: undefined, description: undefined, people: undefined },
      file: undefined,
      ingredients: [{ name: undefined }, { name: undefined }],
      coverdata: undefined,
      cover:
        "https://toppng.com/uploads/preview/file-upload-image-icon-115632290507ftgixivqp.png",
      steps: [{ name: undefined, images: [] }],
    };
  },
  methods: {
    stepImage(item) {
      console.log(item);
      let file = document.createElement("input");
      file.type = "file";
      file.click();
      file.addEventListener("change", (e) => {
        let image = e.target.files[0];
        const fd = new FormData();
        fd.append("image", image);
        this.$q.loading.show({
          message: "Subiendo imagen",
        });
        this.$axios
          .post("image/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(async (res) => {
            this.$q.loading.hide();

            item.images.push(res.data);
          })
          .catch((err) => {
            this.$q.loading.hide();
            console.log(err);
          });
      });
    },
    async publish() {
      console.log(this.coverdata);
      this.recipe.ingredients = { create: this.ingredients };
      this.recipe.cover = { connect: { id: this.coverdata.id } };
      if (this.video != undefined) {
        this.recipe.video = { connect: { id: this.video.id } };
      }

      let stpe = [];
      this.steps.forEach((ele) => {
        stpe.push({
          name: ele.name,
          images: {
            connect: ele.images.map((img) => {
              return { id: img.id };
            }),
          },
        });
      });
      this.recipe.steps = { create: stpe };
      console.log(this.recipe);
      let dd = await this.saveRecipe(this.recipe);
      this.$router.push({ name: "ListRecipe" });
    },
    addImage(item) {},
    addStep() {
      this.steps.push({ name: undefined, images: [] });
    },
    addItem() {
      this.ingredients.push({ name: undefined });
    },
    changeVideo(file) {
      console.log(file);
      const fd = new FormData();
      fd.append("file", file);
      this.persistent = true;
      return new Promise((resolve, reject) => {
        this.$axios
          .post("upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              this.value = Math.ceil(
                (progressEvent.loaded / progressEvent.total) * 100
              );
            },
          })
          .then((res) => {
            this.persistent = false;
            this.video = res.data;
          })
          .catch((err) => reject(err));
      });
    },
    onFileChange(e) {
      this.file = e.target.files[0];

      const fd = new FormData();
      fd.append("image", this.file);
      this.$q.loading.show({
        message: "Subiendo imagen",
      });
      this.$axios
        .post("image/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(async (res) => {
          this.$q.loading.hide();
          this.coverdata = res.data;
          this.cover =
            "http://192.168.1.9:3000/api/image/" +
            this.coverdata.name +
            this.coverdata.format +
            "/?format=webp";
          console.log(res);
        })
        .catch((err) => {
          this.$q.loading.hide();
          console.log(err);
        });
    },
    openFolder() {
      document.getElementById("file").click();
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
};
</script>
