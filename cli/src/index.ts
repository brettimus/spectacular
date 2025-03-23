#!/usr/bin/env node
import { intro, outro } from "@clack/prompts";
import { config } from "dotenv";
import pico from "picocolors";
import { SPECTACULAR_TITLE } from "./const";
import { commandInit } from "./commands/init";

// For local development, to quickly configure env vars from a .env file
config();

async function commandCreateSchema() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");
  
  intro("😮 spectacular - Create Schema");
  
  // TODO: Implement create-schema functionality
  outro("Schema creation not yet implemented");
}

async function commandCreateApi() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");
  
  intro("😮 spectacular - Create API");
  
  // TODO: Implement create-api functionality
  outro("API creation not yet implemented");
}

async function main() {
  console.log(process.argv);
  const command = process.argv[2] || 'init';
  
  try {
    switch (command) {
      case 'init':
        await commandInit();
        break;
      case 'create-schema':
        await commandCreateSchema();
        break;
      case 'create-api':
        await commandCreateApi();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Available commands: init, create-schema, create-api');
        process.exit(1);
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    process.exit(1);
  }
}

main();
