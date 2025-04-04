import { config } from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setUpLogsDir, verifyCurrentDir } from "./utils";
import type { FpModelProvider } from "@/xstate-prototypes/ai";
import { getAiConfig } from "./ai-config";
import { initializeLogger } from "@/xstate-prototypes/utils/logging/logger";
import { readFileSync } from "node:fs";
import { createActor } from "xstate";
import { createLogger } from "./logger";
import { apiCodegenMachine } from "@/xstate-prototypes/machines/codegen/api-codegen/api-codegen";

await initializeLogger();

const RETRY_PROJECT_DIR = process.env.RETRY_PROJECT_DIR;

if (!RETRY_PROJECT_DIR) {
  throw new Error("RETRY_PROJECT_DIR is not set");
}

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

// TODO - Read from project dir
const specDetails = {
  spec: readFileSync(path.join(RETRY_PROJECT_DIR, "spec.md"), "utf8"),
  projectDirName: path.basename(RETRY_PROJECT_DIR),
};

if (!specDetails.spec) {
  throw new Error("Spec file not found");
}

const projectName = specDetails.projectDirName;

verifyCurrentDir({ cliProjectRoot, __dirname });

const projectDir = path.join(
  cliProjectRoot,
  "..",
  "..",
  "spectacular-autonomous",
  projectName,
);

const logsDir = setUpLogsDir({ projectDir });

const dbSchemaTs = readFileSync(
  path.join(projectDir, "src", "db", "schema.ts"),
  "utf8",
);

const apiGeneratorActor = createActor(apiCodegenMachine, {
  input: {
    apiKey: AI_CONFIG.apiKey,
    aiProvider: AI_CONFIG.aiProvider,
    spec: specDetails.spec,
    projectDir,
    schema: dbSchemaTs,
  },
});

apiGeneratorActor.subscribe(createLogger(logsDir, "apiCodegenMachine"));

apiGeneratorActor.start();

apiGeneratorActor.send({
  type: "generate.api",
  schema: dbSchemaTs,
  spec: specDetails.spec,
});
