#!/usr/bin/env node
import { config } from "dotenv";
import { intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { promptDescription } from "./actions/description";
import { SPECTACULAR_TITLE } from "./const";
import { initContext } from "./context";
import { isError } from "./types";
import { handleCancel, handleError } from "./utils";
import { actionIdeate } from "./actions/ideate";

config();

async function main() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular");

  const context = initContext();

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

  outro(`🦉 saved brainstorm.md in ${context.path}!
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
