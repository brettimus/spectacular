#!/usr/bin/env node
import { Command } from "commander";
import {
  commandEvalSpecGeneration,
  commandEvalSchemaGeneration,
  commandEvalFullWorkflow,
  commandCreateSchemaMachine,
} from "../index";

const program = new Command();

program
  .name("spectacular-machine")
  .description("Machine-based implementation of Spectacular CLI")
  .version("0.1.0");

program
  .command("eval-spec")
  .description("Evaluate spec generation workflow")
  .action(async () => {
    await commandEvalSpecGeneration();
  });

program
  .command("eval-schema")
  .description("Evaluate schema generation workflow")
  .argument("<spec-path>", "Path to the specification file")
  .action(async (specPath: string) => {
    await commandEvalSchemaGeneration(specPath);
  });

program
  .command("eval-full")
  .description("Evaluate full workflow")
  .action(async () => {
    await commandEvalFullWorkflow();
  });

program
  .command("create-schema")
  .description("Create schema using the machine-based implementation")
  .argument("[spec-path]", "Path to the specification file (optional)")
  .action(async (specPath: string | undefined) => {
    const result = await commandCreateSchemaMachine(specPath);
    if (result.success) {
      console.log(`Success! Schema created at: ${result.schemaPath}`);
    } else {
      console.error("Failed to create schema");
      process.exit(1);
    }
  });

program.parse(process.argv);
