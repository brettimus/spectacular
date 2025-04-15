import { existsSync, writeFileSync } from "node:fs";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

export function verifyCurrentDir({
  cliProjectRoot,
  __dirname,
}: {
  cliProjectRoot: string;
  __dirname: string;
}) {
  if (cliProjectRoot !== path.join(__dirname, "..", "..", "..", "..")) {
    console.log("cliProjectRoot", cliProjectRoot);
    console.log("__dirname", __dirname);
    console.log(
      "path.join(__dirname, '..', '..', '..', '..')",
      path.join(__dirname, "..", "..", "..", ".."),
    );
    throw new Error("Something is unexpected about the cwd");
  }
}

export function setUpProjectDir({
  projectDir,
}: {
  projectDir: string;
}) {
  // Create schemagen folder if it doesn't exist
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
    console.log(`Created directory: ${projectDir}`);
  } else {
    // Clean the contents of the project folder
    rmSync(projectDir, { recursive: true, force: true });
    mkdirSync(projectDir, { recursive: true });
    console.log(`Cleaned directory: ${projectDir}`);
  }
}

export function setUpLogsDir({
  projectDir,
}: {
  projectDir: string;
}) {
  // Create a logs directory inside the project folder
  const logsDir = path.join(projectDir, "logs");
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
    console.log(`Created logs directory: ${logsDir}`);
  }
  return logsDir;
}

export function addTimestampToProjectDirName(projectDirName: string) {
  const timestamp = new Date().toISOString().replace(/[-:Z]/g, "");
  const lastDotIndex = projectDirName.lastIndexOf(".");

  // Always strip extension if present
  const name =
    lastDotIndex === -1
      ? projectDirName
      : projectDirName.substring(0, lastDotIndex);
  return `${timestamp}-${name}`;
}

export function writeSpecToFile({
  projectDir,
  spec,
}: {
  projectDir: string;
  spec: string;
}) {
  const specFilePath = path.join(projectDir, "spec.md");
  writeFileSync(specFilePath, spec);
}
