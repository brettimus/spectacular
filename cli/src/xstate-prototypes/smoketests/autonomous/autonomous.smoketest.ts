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
import type { FpModelProvider } from "@/xstate-prototypes/ai";
import { getAiConfig } from "./ai-config";
import { initializeLogger } from "@/xstate-prototypes/utils/logging/logger";

await initializeLogger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const AI_PROVIDER: FpModelProvider = "anthropic";
const AI_CONFIG = getAiConfig(AI_PROVIDER);

const cliProjectRoot = process.cwd();

if (!AI_CONFIG.apiKey) {
  throw new Error(`AI provider (${AI_PROVIDER}) API key is not set`);
}

console.log("Creating spec");

const specDetails = await createSpec(AI_CONFIG);

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
  apiKey: AI_CONFIG.apiKey,
  aiProvider: AI_CONFIG.aiProvider,
  spec: specDetails.spec,
  projectDir,
  logsDir,
});
