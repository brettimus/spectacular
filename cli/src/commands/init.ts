#!/usr/bin/env node
import { intro, note, outro, confirm } from "@clack/prompts";
import pico from "picocolors";
import { actionIdeate } from "../actions/ideate";
import {
  actionCreateProjectFolder,
  promptProjectFolder,
} from "../actions/project-folder";
import { actionSaveSpec } from "../actions/save-spec";
import { saveSpectacularFolder } from "../actions/save-spectacular-folder";
import { SPECTACULAR_TITLE } from "../const";
import { initContext } from "../context";
import { promptDescription } from "../description";
import { promptOpenAiKey } from "../openai-api-key";
import { saveGlobalDebugInfo } from "../utils/credentials";
import { hasValidSpectacularConfig } from "../utils/spectacular-dir";
import { handleResult } from "../utils";
import { commandCreateSchema } from "./create-schema";

export async function commandInit() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular TEST 12345");

  const context = initContext();

  // If there wasn't an API key in the environment, prompt the user for one
  if (!context.apiKey) {
    const result = await promptOpenAiKey(context);

    handleResult(result);
  }

  if (!context.apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  // INIT: Get a project folder from the user
  const projectFolderResult = await promptProjectFolder(context);

  handleResult(projectFolderResult);

  // Check if spectacular directory already exists in the project folder
  const projectPath = context.projectPath || process.cwd();
  const configCheck = hasValidSpectacularConfig(projectPath);

  if (configCheck.exists) {
    note(
      pico.yellow(
        `A Spectacular project already exists in this directory (version ${configCheck.version}).`,
      ),
    );
    process.exit(1);
  }

  const createProjectFolderResult = await actionCreateProjectFolder(context);

  handleResult(createProjectFolderResult);

  // INIT: Get a description of the api from the user
  const descriptionResult = await promptDescription(context);

  handleResult(descriptionResult);

  // IDEATION: Go back and forth between the user and the LLM
  //           until the LLM is satisfied with the description
  const ideationResult = await actionIdeate(context);
  handleResult(ideationResult);

  // Save the spec to a file
  const saveSpecResult = await actionSaveSpec(context);
  handleResult(saveSpecResult);

  // Save the history to a file
  await saveSpectacularFolder(context);

  // Also save to the global debug directory
  saveGlobalDebugInfo(context);

  const shouldDoCodeGen = await confirm({
    message: "Do you want to generate code?",
    initialValue: true,
    active: "Yes",
  });

  handleResult(shouldDoCodeGen);

  if (!shouldDoCodeGen) {
    outro(`🦉 spec was created ${context.specPath}!`);
    process.exit(0);
  }

  if (shouldDoCodeGen) {
    await commandCreateSchema(context);
  }
}
