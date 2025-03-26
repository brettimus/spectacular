#!/usr/bin/env node
import { handleResult } from "@/utils/result";
import { intro, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionCreateApi } from "../../actions/create-api";
import { SPECTACULAR_TITLE } from "../../const";
import { type Context, initContext } from "../../context";
import { promptOpenAiKey } from "../../openai-api-key";
import { appendToLog, saveGlobalDebugInfo } from "../../utils/credentials";

export async function commandCreateApi(continuingWithContext?: Context) {
  const ctx = continuingWithContext ?? initContext();

  if (!continuingWithContext) {
    console.log("");
    console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
    console.log("");

    intro("😮 spectacular - Create API");
  }

  // Log the action start
  appendToLog("commands", {
    command: "create-api",
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

    // Then generate the API
    await actionCreateApi(ctx);

    // Save debug info to the global directory
    saveGlobalDebugInfo(ctx);

    // Log the successful completion
    appendToLog("commands", {
      command: "create-api",
      sessionId: ctx.sessionId,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    outro("API creation completed successfully! 🎉");
  } catch (error) {
    // Log the error
    appendToLog("commands", {
      command: "create-api",
      sessionId: ctx.sessionId,
      status: "error",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });

    outro(`API creation failed: ${(error as Error).message} 😢`);
    process.exit(1);
  }
}
