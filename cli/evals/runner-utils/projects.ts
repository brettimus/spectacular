import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { downloadTemplate } from "giget";
import type { SpectacularSchemaFile, SpectacularSpecFile } from "../utils";

const BASE_TEMPLATE_URL = "github:brettimus/mega-honc";
const BASE_TEMPLATE_DIR = "_base-template";

export function getProjectNameFromSpecFile(
  specFileDetails: SpectacularSpecFile,
) {
  return path.basename(
    specFileDetails.fileName,
    path.extname(specFileDetails.fileName),
  );
}

export function getProjectNameFromSchemaFile(
  schemaFileDetails: SpectacularSchemaFile,
) {
  return path.basename(
    schemaFileDetails.fileName,
    path.extname(schemaFileDetails.fileName),
  );
}

/**
 * Returns (or creates and returns) a run directory for a given run ID
 * @param evalReposDir - The directory containing all the eval repos
 * @param runId - The ID of the run
 * @returns The path to the run directory
 */
export async function getEvalRunProjectDir(
  evalReposDir: string,
  runId: string,
) {
  const runDir = path.join(evalReposDir, `run-${runId}`);
  if (!fs.existsSync(runDir)) {
    await setUpRunProjectDir(runDir);
  }
  return runDir;
}

/**
 * Creates a base template for a run
 * This helps us avoid downloading the template from github on every sub-run
 *
 * @param runDirPath - The path to the run directory
 */
async function setUpRunProjectDir(runDirPath: string) {
  await createBaseTemplate(runDirPath);
}

async function createBaseTemplate(parentDir: string) {
  const baseProjectDir = path.join(parentDir, BASE_TEMPLATE_DIR);

  if (!fs.existsSync(baseProjectDir)) {
    fs.mkdirSync(baseProjectDir, { recursive: true });
  }

  await downloadTemplate(BASE_TEMPLATE_URL, {
    // cwd, // INVESTIGATE - Is the cwd needed?
    dir: baseProjectDir,
    force: true,
    provider: "github",
  });

  await runShell(baseProjectDir, ["pnpm", "install"]);
}

export async function createNewProject(
  runDirPath: string,
  dirName: string,
): Promise<string> {
  // Copy contents from base template to new project directory
  const baseProjectDir = path.join(runDirPath, BASE_TEMPLATE_DIR);
  if (!fs.existsSync(baseProjectDir)) {
    throw new Error("Base template directory does not exist");
  }

  const targetDir = path.join(runDirPath, dirName);
  const targetDirTsConfig = path.join(targetDir, "tsconfig.json");
  // Create target directory if it doesn't exist
  // HACK - We need to check if the tsconfig.json exists as a means of checking if the project files were copied in already
  if (!fs.existsSync(targetDir) || !fs.existsSync(targetDirTsConfig)) {
    fs.mkdirSync(targetDir, { recursive: true });
    // Copy all files from base template to target directory
    fs.cpSync(baseProjectDir, targetDir, { recursive: true });
    console.log("Created new project in", targetDir);
  } else {
    console.log("Project already exists in", targetDir);
  }

  return targetDir;
}

export async function runShell(
  cwd: string,
  commands: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const commandStr = commands.join(" ");
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    const child = spawn(commandStr, [], { cwd, shell: true, timeout: 60000 });

    child.on("error", (error) => {
      reject({
        exitCode: 1,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: error.message,
      });
    });

    child.stdout.on("data", (chunk) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    child.stderr.on("data", (chunk) => {
      stderrChunks.push(Buffer.from(chunk));
    });

    child.on("exit", (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString();
      const stderr = Buffer.concat(stderrChunks).toString();

      resolve({
        exitCode: code || 0,
        stdout,
        stderr,
      });
    });
  });
}
