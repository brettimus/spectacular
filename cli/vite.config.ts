import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    setupFiles: ["dotenv/config"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // 20 mins, which is huge, but i wanna run e2e evals on lots of llm calls so shush.
    testTimeout: 20 * 60 * 1000, // 20 minutes in milliseconds
  },
});
