import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/context";
import { getSpectacularProjectDirPath } from "@/utils";

export interface ApiCodeSaveResult {
  indexTsPath: string;
  reasoningPath?: string;
}

export async function saveApiCode(
  context: Context,
  apiCode: string,
  reasoning?: string,
): Promise<ApiCodeSaveResult> {
  // Determine the location to save the API code
  const projectPath = context.projectPath || process.cwd();

  // Create the src directory if it doesn't exist
  const srcDir = path.join(projectPath, "src");
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Save the API code to src/index.ts
  const indexTsPath = path.join(srcDir, "index.ts");
  fs.writeFileSync(indexTsPath, apiCode, "utf-8");

  // Also save a copy in the spectacular directory for reference
  const spectacularDir = getSpectacularProjectDirPath(projectPath);
  if (!fs.existsSync(spectacularDir)) {
    fs.mkdirSync(spectacularDir, { recursive: true });
  }

  const apiBackupPath = path.join(spectacularDir, "api.ts");
  fs.writeFileSync(apiBackupPath, apiCode, "utf-8");

  let reasoningPath: string | undefined;
  if (reasoning) {
    // Save the reasoning to a markdown file for inspection
    reasoningPath = path.join(spectacularDir, "api-reasoning.md");
    fs.writeFileSync(reasoningPath, reasoning, "utf-8");
  }

  return {
    indexTsPath,
    reasoningPath,
  };
}
