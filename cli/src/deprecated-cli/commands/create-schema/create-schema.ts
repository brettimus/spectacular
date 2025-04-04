#!/usr/bin/env node
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { actionCreateSchema } from "@/deprecated-cli/actions/create-schema";
import { actionDependencies } from "@/deprecated-cli/actions/dependencies";
import { actionDownloadTemplate } from "@/deprecated-cli/actions/download-template";
import { SPECTACULAR_TITLE } from "@/deprecated-cli/const";
import { type Context, initContext } from "@/deprecated-cli/context";
import { promptOpenAiKey } from "@/deprecated-cli/openai-api-key";
import {
  appendToLog,
  saveGlobalDebugInfo,
} from "@/deprecated-cli/utils/credentials";
import { handleResult } from "@/deprecated-cli/utils/result";
import { confirm, intro, outro } from "@clack/prompts";
import pico from "picocolors";
import { commandCreateApi } from "../create-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HACK - A directory for rules to use in code generation
//        Not yet completed or filled in or compiled or anything
const rulesDir = path.join(__dirname, "rules");

export async function commandCreateSchema(continuingWithContext?: Context) {
  const ctx = continuingWithContext ?? initContext();

  if (!continuingWithContext) {
    console.log("");
    console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
    console.log("");

    intro("😮 spectacular - Create Schema");
  }

  // Log the action start
  appendToLog(ctx, "commands", {
    command: "create-schema",
    sessionId: ctx.sessionId,
    status: "started",
    timestamp: new Date().toISOString(),
  });

  try {
    // If there wasn't an API key in the environment or credentials, prompt the user for one
    if (!ctx.apiKey) {
      const result = await promptOpenAiKey(ctx);

      handleResult(result);
    }

    if (!ctx.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // First, ensure we have a template downloaded
    const downloadTemplateResult = await actionDownloadTemplate(ctx);
    handleResult(downloadTemplateResult);

    const dependenciesResult = await actionDependencies(ctx);
    handleResult(dependenciesResult);

    // Then generate the schema
    ctx.rulesDir = rulesDir;
    await actionCreateSchema(ctx);

    // Save debug info to the global directory
    saveGlobalDebugInfo(ctx);

    // Log the successful completion
    appendToLog(ctx, "commands", {
      command: "create-schema",
      sessionId: ctx.sessionId,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    const shouldContinue = await confirm({
      message: "Do you want to continue creating the api routes?",
      initialValue: true,
    });

    handleResult(shouldContinue);

    if (!shouldContinue) {
      outro("Schema creation completed successfully! 🎉");
      process.exit(0);
    }

    await commandCreateApi(ctx);
  } catch (error) {
    // Log the error
    appendToLog(ctx, "commands", {
      command: "create-schema",
      sessionId: ctx.sessionId,
      status: "error",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });

    // TODO - Handle cancellation better
    outro(`Schema creation failed: ${(error as Error).message} 😢`);
    process.exit(1);
  }
}
