import { defineStore } from "pinia";
import { login as apiLogin, logout as apiLogout } from "../api/auth.js";
import { fetchMe } from "../api/me.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    me: null,
    bootstrapped: false,
    accessToken: localStorage.getItem("access_token"),
  }),
  getters: {
    isLoggedIn: (s) => !!s.accessToken,
    role: (s) => s.me?.role ?? null,
  },
  actions: {
    async bootstrap() {
      if (!this.isLoggedIn) {
        this.me = null;
        this.bootstrapped = true;
        return;
      }

      try {
        this.me = await fetchMe();
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          localStorage.removeItem("access_token");
          this.me = null;
        } else {
          throw e;
        }
      } finally {
        this.bootstrapped = true;
      }
    },
    async login({ username, password }) {
      const data = await apiLogin({ username, password });
      this.accessToken = data.access;
      this.me = await fetchMe();
      this.bootstrapped = true;
    },
    logout() {
      apiLogout();
      this.accessToken = null;
      this.me = null;
      this.bootstrapped = true;
    },
    homePathForRole(role) {
      if (role === "MEMBER") return "/member";
      if (role === "STORE") return "/store";
      if (role === "ADMIN") return "/admin";
      return "/login";
    },
  },
});
