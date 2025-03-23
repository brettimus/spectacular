import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { cancel, log } from "@clack/prompts";
import { CANCEL_MESSAGE, HATCH_LOG_LEVEL } from "../const";
import { CodeGenError } from "../types";
import path from "node:path";

/**
 * Converts a spec name to a path, replacing spaces with dashes and converting to lowercase.
 */
export function convertSpecNameToFilename(specName: string) {
  const filename = specName
    .replace(new RegExp(`[\\s${path.sep}]+`, "g"), "-")
    .toLowerCase();
  return filename.endsWith(".md") ? filename : `${filename}.md`;
}

/**
 * Turns an input string into a path, adding the current working directory if it's an unqualified name
 */
export function pathFromInput(input: string, cwd: string) {
  // Check if it's a bare filename (no directory separators and no relative path markers)
  // Use path.dirname for cross-platform compatibility
  const dirname = path.dirname(input);
  if (dirname === "." && !input.startsWith("./") && !input.startsWith("../")) {
    // It's a bare filename, so add it to the current working directory
    return path.join(cwd, input);
  }

  return input;
}

export function getPackageManager() {
  return process.env.npm_config_user_agent?.split("/").at(0);
}

export async function runShell(cwd: string, commands: string[]): Promise<void> {
  const commandStr = commands.join(" ");

  return new Promise((resolve, reject) => {
    const child = spawn(commandStr, [], { cwd, shell: true, timeout: 60000 });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    // Swallow stdout and stderr
    child.stdout.on("data", () => {});
    child.stderr.on("data", () => {});
  });
}

export function handleError(error: Error | CodeGenError) {
  if (error instanceof CodeGenError) {
    log.warn(
      `Could not scaffold project according to your description\n(error: ${error.message})`,
    );
    log.info("Continuing...");
  } else {
    log.error(`exiting with an error: ${error.message}`);
    // HACK - Allow us to log the error in more depth if `HATCH_LOG_LEVEL` is set to `debug`
    if (HATCH_LOG_LEVEL === "debug") {
      console.error("\n\n*********LOGGING VERBOSE ERROR*********\n");
      console.error(error);
      console.error(
        "\n\n*********LOGGING VERBOSE ERROR AGAIN, BUT AS JSON*********\n",
      );
      console.error(JSON.stringify(error, null, 2));
    }
    process.exit(1);
  }
}

export function handleCancel() {
  cancel(CANCEL_MESSAGE);
  process.exit(0);
}

export function safeReadFile(path: string) {
  try {
    return readFileSync(path, "utf-8");
  } catch (_error) {
    return null;
  }
}

export function randomId() {
  return Math.random().toString(36).substring(2);
}
