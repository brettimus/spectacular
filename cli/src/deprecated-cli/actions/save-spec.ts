import { writeFileSync } from "node:fs";
import type { Context } from "@/deprecated-cli/context";
import { convertSpecNameToFilename, pathFromInput } from "@/deprecated-cli/utils/utils";
import { log } from "@clack/prompts";

export async function actionSaveSpec(ctx: Context) {
  try {
    const specName = convertSpecNameToFilename(ctx.specName ?? "spec");
    ctx.specPath = pathFromInput(specName, ctx.cwd);
    // Appease typescript
    if (!ctx.specPath) {
      throw new Error("Path to save spec is required");
    }

    if (!ctx.specContent) {
      throw new Error("A spec is required");
    }

    // Write the spec to the file
    writeFileSync(ctx.specPath, ctx.specContent);

    log.success(`Spectacular file saved in ${ctx.specPath}`);

    return specName;
  } catch (error) {
    return error;
  }
}
