import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from "node:path";

export default defineConfig({
  root: "./inspector-ui",
  plugins: [nodePolyfills({
    overrides: {
      // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
      fs: 'memfs',
    },
  })],
  server: {
    fs: {
      // Allow serving files from the project root and the "shared" folder
      allow: [resolve(__dirname, "xstate-prototypes"), resolve(__dirname)]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});