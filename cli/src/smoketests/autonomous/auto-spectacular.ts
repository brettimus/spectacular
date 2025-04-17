import { getPackageManager } from "@/utils";
import { createActor, waitFor } from "xstate";
import {
  createCliApiCodegenMachine,
  createCliDbSchemaCodegenMachine,
  createCliSetUpWorkspaceMachine,
} from "../../adapters/cli";
import type { FpModelProvider } from "../../ai";
import { createLogger } from "./logger";

export interface SpectacularOptions {
  apiKey: string;
  aiProvider: FpModelProvider;
  aiGatewayUrl?: string;
  spec: string;
  projectDir: string;
  logsDir: string;
}

export async function autoSpectacular({
  apiKey,
  aiProvider,
  aiGatewayUrl,
  spec,
  projectDir,
  logsDir,
}: SpectacularOptions) {
  const packageManager = getPackageManager();

  // Downloads templates and installs dependencies
  const setUpWorkspaceActor = createActor(
    createCliSetUpWorkspaceMachine(projectDir, packageManager),
  );

  // Generates db/schema.ts
  const schemaGeneratorActor = createActor(
    createCliDbSchemaCodegenMachine(projectDir, packageManager),
    {
      input: {
        apiKey,
        aiProvider,
        aiGatewayUrl,
        spec,
      },
    },
  );

  setUpWorkspaceActor.subscribe(createLogger(logsDir, "setUpWorkspaceActor"));

  // HACK - Create a promise that resolves when the actor completes
  // TODO - us toPromise
  const setUpWorkspacePromise = new Promise((resolve, reject) => {
    setUpWorkspaceActor.subscribe({
      complete() {
        resolve(null);
      },
      error(err) {
        reject(err);
      },
    });
  });

  setUpWorkspaceActor.start();

  schemaGeneratorActor.subscribe(createLogger(logsDir, "schemaCodegenMachine"));

  schemaGeneratorActor.start();

  await setUpWorkspacePromise;

  // Kicks off ai workflow for creating db schema
  schemaGeneratorActor.send({ type: "analyze.tables", spec });

  // HACK - Await final state
  await waitFor(schemaGeneratorActor, (state) => {
    return !!state.output || !!state.error;
  });

  const finalState = schemaGeneratorActor.getSnapshot();

  if (!finalState.matches("Success")) {
    console.error(
      "Schema generation failed",
      JSON.stringify(finalState.toJSON(), null, 2),
    );
    throw new Error("Schema generation failed");
  }

  if (!finalState.output) {
    console.error(
      "Schema generation has no output",
      JSON.stringify(finalState.toJSON(), null, 2),
    );
    throw new Error("Schema generation has no output");
  }

  const schemaGenOutput = finalState.output;

  const apiGeneratorActor = createActor(
    createCliApiCodegenMachine(projectDir, packageManager),
    {
      input: {
        apiKey,
        aiProvider,
        aiGatewayUrl,
        spec,
        dbSchemaTs: schemaGenOutput.dbSchemaTs,
      },
    },
  );

  apiGeneratorActor.subscribe(createLogger(logsDir, "apiCodegenMachine"));

  apiGeneratorActor.start();

  apiGeneratorActor.send({
    type: "generate.api",
    schema: schemaGenOutput.dbSchemaTs,
    spec,
  });

  // HACK - Await final state
  await waitFor(apiGeneratorActor, (state) => {
    return !!state.output || !!state.error;
  });

  const finalApiGeneratorState = apiGeneratorActor.getSnapshot();

  console.log("Auto-spectacular completed, see:", projectDir);

  if (!finalApiGeneratorState.matches("Success")) {
    console.error(
      "API generation failed",
      JSON.stringify(finalState.toJSON(), null, 2),
    );
    throw new Error("API generation failed");
  }
}
