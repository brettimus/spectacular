import type { Context } from "@/context";
import { log } from "@clack/prompts";
import {
  saveSpectacularInitDebugInfo,
  saveSpectacularMetadata,
} from "../utils/spectacular-dir";
import { initCommandLogSession, logActionExecution } from "../utils/logging";

export async function saveSpectacularFolder(ctx: Context) {
  try {
    // Initialize log session for this action
    initCommandLogSession(ctx, "save-folder");

    if (!ctx.specPath) {
      throw new Error("Spec path is required");
    }

    const basePath = process.cwd();

    // Save debug information
    saveSpectacularInitDebugInfo(basePath, ctx);

    // Save metadata
    saveSpectacularMetadata(basePath, ctx.specPath, ctx.sessionId);

    // Log action execution
    logActionExecution(ctx, "save-spectacular-folder", {
      basePath,
      specPath: ctx.specPath,
      sessionId: ctx.sessionId,
    });

    log.info("Spectacular folder saved");

    return;
  } catch (error) {
    return error;
  }
}
