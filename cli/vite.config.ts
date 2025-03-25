import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    setupFiles: ["dotenv/config"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // 2 mins... but probably want longer for evals
    testTimeout: 120000,
  },
});
