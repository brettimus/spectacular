import { createActor, waitFor } from "xstate";
import { schemaCodegenMachine } from "../../codegen/schema-codegen/schema-codegen";
import { apiCodegenMachine } from "../../codegen/api-codegen/api-codegen";
import { config } from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "./logger";
import { setUpLogsDir, setUpProjectDir, verifyCurrentDir } from "./utils";
import { createSpec } from "./create-spec";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = "openai";
const projectName = `plantalytics-engine-${Date.now()}`;
const spec = await createSpec();
const cliProjectRoot = process.cwd();

if (!spec) {
  throw new Error("Spec file not found");
}

if (!API_KEY) {
  throw new Error("AI provider API key is not set");
}

verifyCurrentDir({ cliProjectRoot, __dirname });

const projectDir = path.join(
  cliProjectRoot,
  "..",
  "..",
  "spectacular-autonomous",
  projectName,
);

setUpProjectDir({ projectDir });

const logsDir = setUpLogsDir({ projectDir });

const schemaGeneratorActor = createActor(schemaCodegenMachine, {
  input: {
    apiKey: API_KEY,
    aiProvider: AI_PROVIDER,
    spec,
    projectDir,
  },
});

schemaGeneratorActor.subscribe(
  createLogger(logsDir, "schemaCodegenMachine"),
);

schemaGeneratorActor.start();

// Kicks off project setup
schemaGeneratorActor.send({ type: "download.template" });

// HACK - Await final state
await waitFor(schemaGeneratorActor, (state) => {
  return !!state.output || !!state.error;
});

const finalState = schemaGeneratorActor.getSnapshot();

if (!finalState.matches("Success")) {
  console.error("Schema generation failed", JSON.stringify(finalState.toJSON(), null, 2));
  throw new Error("Schema generation failed");
}

if (!finalState.output) {
  console.error("Schema generation has no output", JSON.stringify(finalState.toJSON(), null, 2));
  throw new Error("Schema generation has no output");
}

const schemaGenOutput = finalState.output;

const apiGeneratorActor = createActor(apiCodegenMachine, {
  input: {
    apiKey: API_KEY,
    aiProvider: AI_PROVIDER,
    spec,
    projectDir,
    schema: schemaGenOutput.dbSchemaTs,
  },
});

apiGeneratorActor.subscribe(
  createLogger(logsDir, "apiCodegenMachine"),
);

apiGeneratorActor.start();

