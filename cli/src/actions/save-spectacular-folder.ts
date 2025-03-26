import type { Context } from "@/context";
import { log } from "@clack/prompts";
import {
  saveSpectacularInitDebugInfo,
  saveSpectacularMetadata,
} from "../utils/spectacular-dir";

export async function saveSpectacularFolder(ctx: Context) {
  try {
    if (!ctx.specPath) {
      throw new Error("Spec path is required");
    }

    const basePath = process.cwd();

    // Save debug information
    saveSpectacularInitDebugInfo(basePath, ctx);

    // Save metadata
    saveSpectacularMetadata(basePath, ctx.specPath, ctx.sessionId);

    log.info("Spectacular folder saved");

    return;
  } catch (error) {
    return error;
  }
}
