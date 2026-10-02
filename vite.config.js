import { defineConfig } from "vite";

export default defineConfig({
  // Keep built assets portable under the GitHub Pages repository path.
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
