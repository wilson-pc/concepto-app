import gql from "graphql-tag";

export const videoService = {
  data() {
    return {};
  },
  methods: {
    async getVideos(query) {
      return await this.$apollo
        .query({
          // Query
          query: gql`
            query($where: VideoWhereInput) {
              videos(where: $where) {
                id
                name
                hls
                format
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
          return data.videos;
        });
    },
    async getImages(query) {
      return await this.$apollo
        .query({
          // Query
          query: gql`
            query($where: ImagenWhereInput) {
              imagens(where: $where) {
                name
                id
                format
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
          console.log(data);
          return data.imagens;
        });
    }
  },
  computed: {}
};
