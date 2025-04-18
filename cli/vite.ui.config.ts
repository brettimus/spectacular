/**
 * This is the vite config for the inspector-ui, which is a simple vite app that can run our state machines in the browser,
 * in order to visualize them with Stately's inspector.
 *
 * https://stately.ai/docs/inspector
 */

import { resolve } from "node:path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { evaliteTracerPlugin } from "./src/shims/evalite-tracer-plugin";

export default defineConfig(() => {
  return {
    root: "./inspector-ui",
    plugins: [
      // Plugin to replace evalite's traceAISDKModel with an identity function
      evaliteTracerPlugin(),
      // Standard node polyfills
      nodePolyfills({
        overrides: {
          // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
          fs: "memfs",
          // Use our custom child_process shim for the child_process module
          child_process: resolve(__dirname, "./src/shims/child_process.ts"),
        },
      }),
    ],
    server: {
      fs: {
        // Allow serving files from the project root folder
        allow: [resolve(__dirname)],
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  };
});
