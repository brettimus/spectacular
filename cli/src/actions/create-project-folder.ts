import { mkdirSync } from "node:fs";
import type { Context } from "@/context";

export async function actionCreateProjectFolder(ctx: Context) {
  try {
    if (!ctx.projectPath) {
      throw new Error("Project path is required");
    }

    // Create the project folder
    mkdirSync(ctx.projectPath, { recursive: true });

    // Change working directory
    process.chdir(ctx.projectPath);
    ctx.cwd = process.cwd();

    return;
  } catch (error) {
    return error;
  }
}
