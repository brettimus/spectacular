#!/usr/bin/env node
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isError } from "@/types";
import { handleCancel, handleError } from "@/utils";
import { confirm, intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionCreateSchema } from "../../actions/create-schema";
import { actionDownloadTemplate } from "../../actions/download-template";
import { SPECTACULAR_TITLE } from "../../const";
import { type Context, initContext } from "../../context";
import { promptOpenAiKey } from "../../openai-api-key";
import { appendToLog, saveGlobalDebugInfo } from "../../utils/credentials";
import { actionDependencies } from "@/actions/dependencies";
import { handleResult } from "@/utils/result";

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
  appendToLog("commands", {
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

    const shouldDownloadTemplate = await confirm({
      message:
        "Do you want to download a HONC template? (will overwrite existing template files)",
      initialValue: true,
    });

    handleResult(shouldDownloadTemplate);

    if (typeof shouldDownloadTemplate === "boolean" && shouldDownloadTemplate) {
      // First, ensure we have a template downloaded
      const downloadTemplateResult = await actionDownloadTemplate(ctx);

      if (isCancel(downloadTemplateResult)) {
        handleCancel();
      }

      if (isError(downloadTemplateResult)) {
        handleError(downloadTemplateResult);
      }
    }

    const dependenciesResult = await actionDependencies(ctx);

    if (isCancel(dependenciesResult)) {
      handleCancel();
    }

    if (isError(dependenciesResult)) {
      handleError(dependenciesResult);
    }

    // Then generate the schema
    ctx.rulesDir = rulesDir;
    await actionCreateSchema(ctx);

    // Save debug info to the global directory
    saveGlobalDebugInfo(ctx);

    // Log the successful completion
    appendToLog("commands", {
      command: "create-schema",
      sessionId: ctx.sessionId,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    outro("Schema creation completed successfully! 🎉");
  } catch (error) {
    // Log the error
    appendToLog("commands", {
      command: "create-schema",
      sessionId: ctx.sessionId,
      status: "error",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });

    outro(`Schema creation failed: ${(error as Error).message} 😢`);
    process.exit(1);
  }
}
