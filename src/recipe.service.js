import gql from "graphql-tag";

export const recipeService = {
  data() {
    return {};
  },
  methods: {
    async getImages(query) {
      return await this.$apollo
        .query({
          // Query
          query: gql`
            query($where: ImagenWhereInput) {
              imagens(where: $where) {
                id
                name
                format
              }
            }
          `,
          // Parameters
          variables: {
            where: query
          },
          fetchPolicy: "network-only"
        })
        .then(({ data }) => {
          return data.imagens;
        });
    },
    async getRecipe(query) {
      return await this.$apollo
        .query({
          // Query
          query: gql`
            query($where: RecipeWhereUniqueInput!) {
              recipe(where: $where) {
                name
                cover {
                  name
                  id
                  format
                }
                people
                video {
                  id
                  format
                  hls
                  name
                }
                description
                id
                ingredients {
                  name
                  id
                }
                steps {
                  id
                  name
                  images {
                    name
                    id
                    format
                  }
                }
              }
            }
          `,
          // Parameters
          variables: {
            where: query
          },
          fetchPolicy: "network-only"
        })
        .then(({ data }) => {
          return data.recipe;
        });
    },
    async getRecipes(query) {
      return await this.$apollo
        .query({
          // Query
          query: gql`
            query($where: RecipeWhereInput) {
              recipes(where: $where) {
                id
                name
                cover {
                  id
                  name
                  format
                }
                people
                description
              }
            }
          `,
          // Parameters
          variables: {
            query
          },
          fetchPolicy: "network-only"
        })
        .then(({ data }) => {
          return data.recipes;
        });
    },
    async saveRecipe(data) {
      return await this.$apollo
        .mutate({
          // Query
          mutation: gql`
            mutation($data: RecipeCreateInput!) {
              createRecipe(data: $data) {
                id
              }
            }
          `,
          // Parameters
          variables: {
            data: data
          }
        })
        .then(({ data }) => {
          return data;
        });
    }
  },
  computed: {}
};
