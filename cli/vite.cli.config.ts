import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  // Added for vite-node CLI execution support
  optimizeDeps: {
    disabled: false,
  },
  build: {
    rollupOptions: {
      input: {
        chat: resolve(__dirname, "src/xstate-prototypes/index.ts"),
        "chat-local": resolve(__dirname, "src/xstate-prototypes/chat-local.ts"),
        auto: resolve(
          __dirname,
          "src/xstate-prototypes/smoketests/autonomous/autonomous.smoketest.ts",
        ),
        schemagen: resolve(
          __dirname,
          "src/xstate-prototypes/smoketests/schemagen.smoketest.ts",
        ),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
    target: "node20",
    outDir: "dist",
    sourcemap: true,
    minify: false,
  },
});
