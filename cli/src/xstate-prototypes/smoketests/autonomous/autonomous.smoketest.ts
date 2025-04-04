import { config } from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addTimestampToProjectDirName,
  setUpLogsDir,
  setUpProjectDir,
  verifyCurrentDir,
  writeSpecToFile,
} from "./utils";
import { createSpec } from "./create-spec";
import { autoSpectacular } from "./auto-spectacular";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = "openai";
const cliProjectRoot = process.cwd();

if (!API_KEY) {
  throw new Error("AI provider API key is not set");
}

console.log("Creating spec");
const specDetails = await createSpec({
  apiKey: API_KEY,
  aiProvider: AI_PROVIDER,
});
console.log("Spec created");
console.log(`specDetails.spec: ${specDetails.spec.slice(0, 100)}...\n\n`);
console.log(`specDetails.projectDirName: ${specDetails.projectDirName}`);

if (!specDetails.spec) {
  throw new Error("Spec file not found");
}

const projectName = addTimestampToProjectDirName(specDetails.projectDirName);

verifyCurrentDir({ cliProjectRoot, __dirname });

const projectDir = path.join(
  cliProjectRoot,
  "..",
  "..",
  "spectacular-autonomous",
  projectName,
);

setUpProjectDir({ projectDir });
writeSpecToFile({ projectDir, spec: specDetails.spec });

const logsDir = setUpLogsDir({ projectDir });

autoSpectacular({
  apiKey: API_KEY,
  aiProvider: AI_PROVIDER,
  spec: specDetails.spec,
  projectDir,
  logsDir,
});
