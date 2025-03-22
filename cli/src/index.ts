#!/usr/bin/env node
import { intro, isCancel, outro } from "@clack/prompts";
import { config } from "dotenv";
import pico from "picocolors";
import { actionIdeate } from "./actions/ideate";
import { actionSaveBrainstorm } from "./actions/save-brainstorm";
import { SPECTACULAR_TITLE } from "./const";
import { initContext } from "./context";
import { promptDescription } from "./description";
import { isError } from "./types";
import { handleCancel, handleError } from "./utils";
import { promptOpenAiKey } from "./openai-api-key";

// For local development, to quickly configure env vars from a .env file
config();

async function main() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular");

  const context = initContext();

  // If there wasn't an API key in the environment, prompt the user for one
  if (!context.apiKey) {
    const result = await promptOpenAiKey(context);

    if (isCancel(result)) {
      handleCancel();
    }

    if (result instanceof Error) {
      handleError(result);
    }
  }

  if (!context.apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  // INIT: Get a description of the api from the user
  const descriptionResult = await promptDescription(context);

  if (isCancel(descriptionResult)) {
    handleCancel();
  }

  if (descriptionResult instanceof Error) {
    handleError(descriptionResult);
  }

  // IDEATION: Go back and forth between the user and the LLM
  //           until the LLM is satisfied with the description
  const result = await actionIdeate(context);

  if (isCancel(result)) {
    handleCancel();
  }

  if (isError(result)) {
    handleError(result);
  }

  // Save the brainstorm to a file
  const saveBrainstormResult = await actionSaveBrainstorm(context);

  if (isCancel(saveBrainstormResult)) {
    handleCancel();
  }

  if (saveBrainstormResult instanceof Error) {
    handleError(saveBrainstormResult);
  }

  outro(`🦉 saved spec in ${context.specPath}!
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
