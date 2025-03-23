import { writeFileSync } from "node:fs";
import type { Context } from "@/context";
import { convertSpecNameToFilename, pathFromInput } from "@/utils/utils";
import { text } from "@clack/prompts";

export async function actionSaveSpec(ctx: Context) {
  try {
    const placeholder = convertSpecNameToFilename(ctx.specName ?? "spec");
    const result = await text({
      message: "Where should we save your spec? (./relative-path)",
      placeholder,
      defaultValue: placeholder,
    });

    if (typeof result === "string") {
      if (result === "") {
        ctx.specPath = placeholder;
      } else {
        ctx.specPath = pathFromInput(result, ctx.cwd);
      }
    }

    // Appease typescript
    if (!ctx.specPath) {
      throw new Error("Path to save spec is required");
    }

    if (!ctx.specContent) {
      throw new Error("A spec is required");
    }

    // Write the spec to the file
    writeFileSync(ctx.specPath, ctx.specContent);

    return result;
  } catch (error) {
    return error;
  }
}
