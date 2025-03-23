import { writeFileSync } from "node:fs";
import type { Context } from "@/context";
import { convertSpecNameToFilename, pathFromInput } from "@/utils";
import { text } from "@clack/prompts";

export async function actionSaveBrainstorm(ctx: Context) {
  try {
    const placeholder = convertSpecNameToFilename(ctx.specName ?? "brainstorm");
    const result = await text({
      message: "Where should we save your brainstorm? (./relative-path)",
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
      throw new Error("Brainstorm is required");
    }

    // Write the brainstorm to the file
    writeFileSync(ctx.specPath, ctx.specContent);

    return result;
  } catch (error) {
    return error;
  }
}
