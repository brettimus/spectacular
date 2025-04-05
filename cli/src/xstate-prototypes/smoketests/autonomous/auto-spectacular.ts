import { createActor, waitFor } from "xstate";
import {
  cliApiCodegenMachine,
  cliSchemaCodegenMachine,
} from "../../adapters/cli";
import type { FpModelProvider } from "../../ai";
import { createLogger } from "./logger";

export interface SpectacularOptions {
  apiKey: string;
  aiProvider: FpModelProvider;
  spec: string;
  projectDir: string;
  logsDir: string;
}

export async function autoSpectacular({
  apiKey,
  aiProvider,
  spec,
  projectDir,
  logsDir,
}: SpectacularOptions) {
  const schemaGeneratorActor = createActor(cliSchemaCodegenMachine, {
    input: {
      apiKey,
      aiProvider,
      spec,
      projectDir,
    },
  });

  schemaGeneratorActor.subscribe(createLogger(logsDir, "schemaCodegenMachine"));

  schemaGeneratorActor.start();

  // Kicks off project setup
  schemaGeneratorActor.send({ type: "download.template" });

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

  const apiGeneratorActor = createActor(cliApiCodegenMachine, {
    input: {
      apiKey,
      aiProvider,
      spec,
      projectDir,
      schema: schemaGenOutput.dbSchemaTs,
    },
  });

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
