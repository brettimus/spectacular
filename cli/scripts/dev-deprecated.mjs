#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the `cli` dir
const CLI_DIR = path.resolve(__dirname, "../");

// Get command line arguments (skip the first two as they are node and script path)
const args = process.argv.slice(2);
const command = args.join(" ").trim() || "help";

const env = {
  ...process.env,
  // NOTE - INIT_CWD is set by pnpm when running `pnpm dev`
  //        This allows us to run the CLI from any directory, and have it
  //        use the correct working directory when it (e.g.) creates a project.
  SPECTACULAR_CWD: process.env.INIT_CWD || process.cwd(),
};

if (command === "create-schema" && env.SPECTACULAR_CWD === CLI_DIR) {
  console.error("Cannot run create-schema from the cli root directory");
  process.exit(1);
}

if (command === "create-api" && env.SPECTACULAR_CWD === CLI_DIR) {
  console.error("Cannot run create-api from the cli root directory");
  process.exit(1);
}

// Construct the onSuccess command
const onSuccessCommand = command
  ? `node dist/deprecated-cli.js ${command}`
  : "node dist/deprecated-cli.js";

// Use pnpm to run tsup (let pnpm handle path resolution)
const tsup = spawn(
  "pnpm",
  ["exec", "tsup", "--watch", "--onSuccess", `'${onSuccessCommand}'`],
  {
    stdio: "inherit",
    env,
    shell: true,
    cwd: CLI_DIR, // Run from the cli directory
  },
);

tsup.on("error", (error) => {
  console.error(`Failed to start tsup: ${error}`);
  process.exit(1);
});

// Forward exit code
tsup.on("close", (code) => {
  process.exit(code);
});
