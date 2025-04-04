import { defineConfig } from "tsup";

const isDev = process.env.npm_lifecycle_event === "dev";

export default defineConfig({
  clean: true,
  entry: [
    // "src/index.ts",
    // "src/machines/index.ts",
    // "src/machines/commands/cli-entry.ts",
    "src/deprecated-cli/deprecated-cli.ts",
  ],
  format: ["esm"],
  minify: false,
  target: "esnext",
  outDir: "dist",
  onSuccess: isDev ? "node scripts/dev-deprecated.mjs" : "",
});
