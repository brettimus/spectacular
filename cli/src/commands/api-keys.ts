#!/usr/bin/env node
import { confirm, intro, isCancel, outro, select, text } from "@clack/prompts";
import pico from "picocolors";
import { SPECTACULAR_TITLE } from "../const";
import { handleCancel } from "../utils";
import {
  appendToLog,
  listApiKeys,
  removeApiKey,
  saveApiKey,
  setDefaultApiKey,
} from "../utils/credentials";

export async function commandApiKeyAdd() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Add API Key");

  // Ask for the API key
  const apiKey = await text({
    message: "Enter the OpenAI API key to save",
    placeholder: "sk-...",
    validate: (value) => {
      if (value === "") {
        return pico.italic("Please enter a valid API key!");
      }
      return undefined;
    },
  });

  if (isCancel(apiKey)) {
    handleCancel();
  }

  // Ask for a name to save the key with
  const name = await text({
    message: "Enter a name for this API key",
    placeholder: "default",
    validate: (value) => {
      if (value === "") {
        return pico.italic("Please enter a name!");
      }
      return undefined;
    },
  });

  if (isCancel(name)) {
    handleCancel();
  }

  // Ask if this should be the default key
  const makeDefault = await confirm({
    message: "Make this the default API key?",
  });

  if (isCancel(makeDefault)) {
    handleCancel();
  }

  // Save the API key
  saveApiKey(name as string, apiKey as string, makeDefault === true);

  // Log the action
  appendToLog("api-keys", {
    action: "add",
    keyName: name as string,
    makeDefault: makeDefault === true,
  });

  outro("API key saved successfully!");
}

export async function commandApiKeyList() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - List API Keys");

  const keys = listApiKeys();

  if (keys.length === 0) {
    outro(
      "No API keys found. Add one with 'npx @fiberplane/spectacular-cli apikey:add'",
    );
    return;
  }

  console.log("");
  console.log(pico.bold("Saved API Keys:"));

  for (const key of keys) {
    console.log(
      `- ${key.name}${key.isDefault ? pico.green(" (default)") : ""}`,
    );
  }
  console.log("");

  // Log the action
  appendToLog("api-keys", {
    action: "list",
    count: keys.length,
  });

  outro("API keys listed successfully!");
}

export async function commandApiKeyRemove() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Remove API Key");

  const keys = listApiKeys();

  if (keys.length === 0) {
    outro(
      "No API keys found. Add one with 'npx @fiberplane/spectacular-cli apikey:add'",
    );
    return;
  }

  const keyToRemove = await select({
    message: "Select an API key to remove",
    options: keys.map((key) => ({
      value: key.name,
      label: `${key.name}${key.isDefault ? " (default)" : ""}`,
    })),
  });

  if (isCancel(keyToRemove)) {
    handleCancel();
  }

  const keyName = String(keyToRemove);

  const confirmRemove = await confirm({
    message: `Are you sure you want to remove the API key '${keyName}'?`,
  });

  if (isCancel(confirmRemove) || !confirmRemove) {
    outro("Operation cancelled");
    return;
  }

  const success = removeApiKey(keyName);

  // Log the action
  appendToLog("api-keys", {
    action: "remove",
    keyName,
    success,
  });

  if (success) {
    outro(`API key '${keyName}' removed successfully!`);
  } else {
    outro(`Failed to remove API key '${keyName}'`);
  }
}

export async function commandApiKeySetDefault() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Set Default API Key");

  const keys = listApiKeys();

  if (keys.length === 0) {
    outro(
      "No API keys found. Add one with 'npx @fiberplane/spectacular-cli apikey:add'",
    );
    return;
  }

  if (keys.length === 1) {
    const success = setDefaultApiKey(keys[0].name);
    if (success) {
      outro(`API key '${keys[0].name}' set as default!`);
    } else {
      outro(`Failed to set API key '${keys[0].name}' as default`);
    }
    return;
  }

  const keyToSetDefault = await select({
    message: "Select an API key to set as default",
    options: keys.map((key) => ({
      value: key.name,
      label: `${key.name}${key.isDefault ? " (default)" : ""}`,
    })),
  });

  if (isCancel(keyToSetDefault)) {
    handleCancel();
  }

  const keyName = String(keyToSetDefault);

  const success = setDefaultApiKey(keyName);

  // Log the action
  appendToLog("api-keys", {
    action: "set-default",
    keyName,
    success,
  });

  if (success) {
    outro(`API key '${keyName}' set as default!`);
  } else {
    outro(`Failed to set API key '${keyName}' as default`);
  }
}
