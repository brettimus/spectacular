import type { Context } from "@/context";
import {
  saveSpectacularDebugInfo,
  saveSpectacularMetadata,
} from "../utils/spectacular-dir";

export async function saveSpectacularFolder(ctx: Context) {
  try {
    if (!ctx.specPath) {
      throw new Error("Spec path is required");
    }

    const basePath = process.cwd();

    // Save debug information
    saveSpectacularDebugInfo(basePath, ctx);

    // Save metadata
    saveSpectacularMetadata(basePath, ctx.specPath, ctx.sessionId);

    return;
  } catch (error) {
    return error;
  }
}
