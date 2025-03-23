#!/usr/bin/env node
import { intro, isCancel, outro, note } from "@clack/prompts";
import pico from "picocolors";
import { actionIdeate } from "../actions/ideate";
import { actionSaveBrainstorm } from "../actions/save-brainstorm";
import { saveSpectacularFolder } from "../actions/save-spectacular-folder";
import { promptProjectFolder, actionCreateProjectFolder } from "../actions/project-folder";
import { SPECTACULAR_TITLE } from "../const";
import { initContext } from "../context";
import { promptDescription } from "../description";
import { promptOpenAiKey } from "../openai-api-key";
import { isError } from "../types";
import { handleCancel, handleError } from "../utils/utils";
import { hasValidSpectacularConfig } from "../utils/spectacular-dir";

export async function commandInit() {
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

  // INIT: Get a project folder from the user
  const projectFolderResult = await promptProjectFolder(context);

  if (isCancel(projectFolderResult)) {
    handleCancel();
  }

  if (projectFolderResult instanceof Error) {
    handleError(projectFolderResult);
  }

  // Check if .spectacular directory already exists in the project folder
  const projectPath = context.projectPath || process.cwd();
  const configCheck = hasValidSpectacularConfig(projectPath);
  
  if (configCheck.exists) {
    note(pico.yellow(`A Spectacular project already exists in this directory (version ${configCheck.version}).`));
    process.exit(1);
  }

  const createProjectFolderResult = await actionCreateProjectFolder(context);

  if (isCancel(createProjectFolderResult)) {
    handleCancel();
  }

  if (createProjectFolderResult instanceof Error) {
    handleError(createProjectFolderResult);
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

  // Save the history to a file
  await saveSpectacularFolder(context);

  outro(`🦉 saved spec in ${context.specPath}!
`);
}