const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "Home", component: () => import("pages/Index.vue") },
      {
        path: "images",
        name: "Images",
        component: () => import("pages/Images.vue")
      },
      {
        path: "camera",
        name: "Camera",
        component: () => import("pages/Camera.vue")
      },
      {
        path: "new-recipe",
        name: "NewRecipe",
        component: () => import("pages/NewRecipe.vue")
      },
      {
        path: "list-recipe",
        name: "ListRecipe",
        component: () => import("pages/ListRecipe.vue")
      },
      {
        path: "detail-recipe/:id",
        name: "DetailRecipe",
        component: () => import("pages/Detail.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
