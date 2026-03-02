import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import MainView from "../views/MainView.vue";

const routes = [
    { path: "/", redirect: "/main" },
    { path: "/auth", name: "auth", component: AuthView },
    { path: "/main", name: "main", component: MainView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const token = sessionStorage.getItem("token");
    const isLoggedIn = !!token;

    if (!isLoggedIn && to.path !== "/auth") return "/auth";
    if (isLoggedIn && to.path === "/auth") return "/main";
});

export default router;