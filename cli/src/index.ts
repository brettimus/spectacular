#!/usr/bin/env node
import { intro, outro } from "@clack/prompts";
import { config } from "dotenv";
import pico from "picocolors";
import { commandCreateSchema } from "./commands/create-schema";
import { commandInit } from "./commands/init";
import { SPECTACULAR_TITLE } from "./const";
import {
  commandApiKeyAdd,
  commandApiKeyList,
  commandApiKeyRemove,
  commandApiKeySetDefault,
} from "./commands/api-keys";
import { commandViewLogs } from "./commands/logs";

// For local development, to quickly configure env vars from a .env file
config();

main();

async function main() {
  const command = process.argv[2] || "init";

  try {
    switch (command) {
      case "init":
        await commandInit();
        break;
      case "create-schema":
        await commandCreateSchema();
        break;
      case "create-api":
        await commandCreateApi();
        break;
      case "apikey:add":
      case "key:add":
        await commandApiKeyAdd();
        break;
      case "apikey:list":
      case "key:list":
        await commandApiKeyList();
        break;
      case "apikey:remove":
      case "key:remove":
        await commandApiKeyRemove();
        break;
      case "apikey:set-default":
      case "key:set-default":
        await commandApiKeySetDefault();
        break;
      case "logs":
      case "view-logs":
        await commandViewLogs();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(
          "Available commands: init, create-schema, create-api, apikey:add, apikey:list, apikey:remove, apikey:set-default, logs",
        );
        process.exit(1);
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    process.exit(1);
  }
}

async function commandCreateApi() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Create API");

  // TODO: Implement create-api functionality
  outro("API creation not yet implemented");
}
