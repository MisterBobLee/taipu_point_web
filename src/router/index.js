import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

import LoginView from "../views/LoginView.vue";
import AdminHome from "../views/admin/AdminHome.vue";
import MemberHome from "../views/member/MemberHome.vue";
import StoreHome from "../views/store/StoreHome.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },

    {
      path: "/admin",
      name: "admin",
      component: AdminHome,
      meta: { roles: ["ADMIN"] },
    },
    {
      path: "/store",
      name: "store",
      component: StoreHome,
      meta: { roles: ["STORE"] },
    },
    {
      path: "/member",
      name: "member",
      component: MemberHome,
      meta: { roles: ["MEMBER"] },
    },

    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.bootstrapped) await auth.bootstrap();

  if (!auth.isLoggedIn && to.meta.public !== true) {
    return { name: "login" };
  }

  const isPublic = to.meta.public === true;
  const requiredRoles = to.meta.roles;

  if (!auth.isLoggedIn && !isPublic) return { name: "login" };
  if (auth.isLoggedIn && isPublic) {
    if (auth.role) return auth.homePathForRole(auth.role);
  }

  if (requiredRoles?.length) {
    if (!auth.isLoggedIn) return { name: "login" };
    if (!auth.role) {
      await auth.bootstrap();
    }
    if (!requiredRoles.includes(auth.role)) {
      return auth.homePathForRole(auth.role);
    }
  }
});

export default router;
