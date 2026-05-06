import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import pugPlugin from "vite-plugin-pug";

export default defineConfig({
  plugins: [vue(), pugPlugin()],
});
