#!/usr/bin/env node
import { config } from "dotenv";
import {
  commandApiKeyAdd,
  commandApiKeyList,
  commandApiKeyRemove,
  commandApiKeySetDefault,
} from "./commands/api-keys";
import {
  commandAutogander,
  commandClearAutogander,
  commandListAutogander,
  commandSubmitFixesToAutogander,
} from "./commands/autogander-fixes";
import { commandCreateApi } from "./commands/create-api";
import { commandCreateSchema } from "./commands/create-schema";
import { commandInit } from "./commands/init";
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
      case "autogander":
        await commandAutogander();
        break;
      case "autogander:list":
      case "fixes:list":
        await commandListAutogander();
        break;
      case "autogander:submit":
      case "fixes:submit":
        await commandSubmitFixesToAutogander();
        break;
      case "autogander:clear":
        await commandClearAutogander();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(
          "Available commands: init, create-schema, create-api, apikey:add, apikey:list, apikey:remove, apikey:set-default, logs, autogander, autogander:list, autogander:submit, autogander:clear",
        );
        process.exit(1);
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    process.exit(1);
  }
}
