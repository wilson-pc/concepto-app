<template>
  <q-page padding v-if="recipe != undefined">
    <q-card class="my-card">
      <video-player
        v-if="recipe.video"
        :options="setVideoOptios(recipe.video)"
      />
      <img
        v-else
        :src="
          'http://192.168.1.9:3000/api/image/' +
          recipe.cover.name +
          recipe.cover.format +
          '/?format=webp'
        "
      />

      <q-card-section>
        <div class="text-h6">{{ recipe.name }}</div>
        <div class="text-subtitle2">by John Doe</div>
      </q-card-section>

      <q-card-section>
        <q-btn flat icon="favorite"></q-btn>
        <q-btn flat icon="subscriptions"></q-btn>
        <q-btn flat @click="share(recipe)" icon="share"></q-btn>
      </q-card-section>
    </q-card>
    <br />
    <span class="text-h6">Ingredientes</span>
    <q-list dense bordered padding separator class="rounded-borders">
      <q-item
        clickable
        v-ripple
        v-for="(item, index) in recipe.ingredients"
        v-bind:key="index"
      >
        <q-item-section>
          <strong> {{ item.name }}</strong>
        </q-item-section>
      </q-item>
    </q-list>
    <br />

    <span class="text-h6">Pasos</span>

    <div v-for="(item, index) in recipe.steps" v-bind:key="index">
      <span class="text-h6">paso {{ index + 1 }}</span>

      <p>
        {{ item.name }}
      </p>
      <q-img
        v-for="(file, index) in item.images"
        v-bind:key="index"
        :src="
          'http://192.168.1.9:3000/api/image/' +
          file.name +
          file.format +
          '/?format=webp'
        "
        spinner-color="red"
        style="height: 140px; max-width: 150px"
      />
    </div>
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
  data() {
    return {
      id: undefined,
      recipe: undefined,
    };
  },
  methods: {
    share(item) {
      let title = item.name.replace(/ /g, "-");
      var options = {
        message: "ver receta", // not supported on some apps (Facebook, Instagram)

        url: "https://www.mywebsite.com/cook/" + title,
        chooserTitle: "Pick an app", // Android only, you can override the default share sheet title
      };
      window.plugins.socialsharing.shareWithOptions(
        options,
        (result) => {
          console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        },
        (onError) => {
          console.log("Sharing failed with message: " + onError);
        }
      );
    },
    async images(item) {
      return await this.getImages({
        stepId: { equals: "7d1f1d62-b102-4ecf-a6d5-f009c1f61423" },
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
  async created() {
    this.id = this.$route.params.id;

    this.recipe = await this.getRecipe({ id: this.id });
    console.log(this.recipe);
    this.recipe.steps.forEach(async (element, index) => {
      this.getImages({
        stepId: { equals: element.id },
      }).then((data) => {
        this.recipe.steps[index].images = data;
        console.log(data);
      });
    });
  },
};
</script>
