import { writeFileSync } from "node:fs";
import type { Context } from "@/context";

export async function actionSaveHistory(ctx: Context) {
  try {
    if (!ctx.specPath) {
      throw new Error("Spec path is required");
    }

    let historyFileName = ctx.specPath?.replace(/\.md$/, "--debug.json");
    if (!historyFileName?.endsWith(".json")) {
      historyFileName = `${historyFileName}--debug.json`;
    }
    // Write the brainstorm to the file
    const history = {
      apiKey: ctx.apiKey ? "REDACTED" : "MISSING!",
      cwd: ctx.cwd,
      packageManager: ctx.packageManager,

      messages: ctx.messages,

      specPath: ctx.specPath,
      specName: ctx.specName,
      specContent: ctx.specContent,

      sessionId: ctx.sessionId,
    }

    writeFileSync(historyFileName, JSON.stringify(history, null, 2));

    return;
  } catch (error) {
    return error;
  }
}
