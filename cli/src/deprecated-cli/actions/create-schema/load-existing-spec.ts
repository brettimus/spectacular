import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import type { Context } from "@/deprecated-cli/context";
import { getMetadataFile } from "@/deprecated-cli/utils/spectacular-dir";

export function loadExistingSpec(ctx: Context) {
  // Check if spec already exists
  if (!ctx.specPath) {
    const metadata = getMetadataFile(ctx.cwd);
    const hasSpecPath =
      metadata &&
      typeof metadata === "object" &&
      "specPath" in metadata &&
      typeof metadata.specPath === "string";
    const specPath = hasSpecPath
      ? getActualSpecPath(ctx, metadata.specPath as string)
      : null;
    if (specPath) {
      ctx.specPath = specPath;
    } else {
      // TODO - Handle error, throw error?
    }
  }
}

function getActualSpecPath(ctx: Context, specPath: string) {
  if (existsSync(specPath)) {
    return specPath;
  }

  const specFilename = basename(specPath);
  const altSpecPath = join(ctx.cwd, specFilename);
  if (existsSync(altSpecPath)) {
    // TODO - Update metadata
    return altSpecPath;
  }

  return null;
}
