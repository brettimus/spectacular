import { createActor } from "xstate";
import { schemaCodegenMachine } from "../codegen/schema-codegen/schema-codegen";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

const actor = createActor(schemaCodegenMachine, {
  input: {
    apiKey: API_KEY,
    aiProvider: AI_PROVIDER,
    spec,
  },
});

let previousState: string | undefined;

actor.subscribe((snapshot) => {
  console.log("=== Received schemaCodegenMachine snapshot ===");
  console.log("-> schemaCodegenMachine.snapshot.value", snapshot.value);
  if (previousState !== snapshot.value) {
    console.log("-> schemaCodegenMachine.transition", snapshot.value);
    previousState = snapshot.value;
  }
});
