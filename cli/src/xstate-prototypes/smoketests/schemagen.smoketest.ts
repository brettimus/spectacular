import { createActor } from "xstate";
import { schemaCodegenMachine } from "../machines/codegen/schema-codegen/schema-codegen";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const spec = readFileSync(path.join(__dirname, "./spec.md"), "utf-8");

if (!spec) {
  throw new Error("Spec file not found");
}

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const AI_PROVIDER = "openai";

const projectName = `plantalytics-engine-${Date.now()}`;

const cliProjectRoot = process.cwd();

if (cliProjectRoot !== path.join(__dirname, "..", "..", "..")) {
  console.log("cliProjectRoot", cliProjectRoot);
  console.log("__dirname", __dirname);
  console.log(
    "path.join(__dirname, '..', '..', '..')",
    path.join(__dirname, "..", "..", ".."),
  );
  throw new Error("Something is unexpected about the cwd");
}

const projectDir = path.join(
  cliProjectRoot,
  "..",
  "..",
  "spectacular-tests",
  projectName,
);

// Create schemagen folder if it doesn't exist
if (!existsSync(projectDir)) {
  mkdirSync(projectDir, { recursive: true });
  console.log(`Created directory: ${projectDir}`);
} else {
  // Clean the contents of the schemagen folder
  rmSync(projectDir, { recursive: true, force: true });
  mkdirSync(projectDir, { recursive: true });
  console.log(`Cleaned directory: ${projectDir}`);
}

// Create a logs directory inside the schemagen folder
const logsDir = path.join(projectDir, "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
  console.log(`Created logs directory: ${logsDir}`);
}

const actor = createActor(schemaCodegenMachine, {
  input: {
    apiKey: API_KEY,
    aiProvider: AI_PROVIDER,
    spec,
    projectDir,
  },
});

let previousState: string | undefined;

actor.subscribe((snapshot) => {
  console.log("=== Received schemaCodegenMachine snapshot ===");
  console.log("-> schemaCodegenMachine.snapshot.value", snapshot.value);
  if (previousState !== snapshot.value) {
    console.log("-> schemaCodegenMachine.transition", snapshot.value);

    // Save the state machine context to a file when there's a state transition
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const stateTransitionFile = path.join(
      logsDir,
      `state-transition-${timestamp}.json`,
    );

    // Create a safe-to-serialize version of the context
    const contextToSave = {
      state: snapshot.value,
      previousState,
      context: JSON.parse(JSON.stringify(snapshot.context)),
      timestamp: new Date().toISOString(),
    };

    try {
      writeFileSync(
        stateTransitionFile,
        JSON.stringify(contextToSave, null, 2),
      );
      console.log(`State transition saved to: ${stateTransitionFile}`);
    } catch (error) {
      console.error("Failed to save state transition:", error);
    }

    previousState = snapshot.value;
  }
});

actor.start();

// Kicks off project setup
actor.send({ type: "download.template" });
