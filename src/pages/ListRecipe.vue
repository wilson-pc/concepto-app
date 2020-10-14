<template>
  <q-page padding class="q-pa-md row items-start q-gutter-md">
    <!-- content -->
    <q-card class="my-card" v-for="(item, index) in recipes" v-bind:key="index">
      <img
        :src="
          'http://192.168.1.9:3000/api/image/' +
          item.cover.name +
          item.cover.format +
          '/?format=webp'
        "
        @click="to(item)"
      />

      <q-card-section
        center
        algin="center"
        class="text-cente"
        @click="to(item)"
      >
        <div class="text-h6">{{ item.name }}</div>
      </q-card-section>

      <q-card-section class="text-cente" @click="to(item)">
        {{ item.description }}</q-card-section
      >
      <q-card-actions>
        <q-btn flat icon="favorite"></q-btn>
        <q-space />
        <q-btn @click="share(item)" flat icon="share"></q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { recipeService } from "../recipe.service";
export default {
  mixins: [recipeService],
  data() {
    return {
      recipes: [],
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
    to(item) {
      console.log(item);
      this.$router.push({ name: "DetailRecipe", params: { id: item.id } });
    },
  },
  async created() {
    this.recipes = await this.getRecipes({ where: {} });
  },

  // name: 'PageName',
};
</script>
<style lang="sass" scoped>
</style>