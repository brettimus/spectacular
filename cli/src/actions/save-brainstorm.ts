import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Context } from "@/context";
import { text } from "@clack/prompts";

// TODO: validate path
export async function actionSaveBrainstorm(ctx: Context) {
  try {
    const placeholder = ctx.specName ?? "./brainstorm.md";
    const result = await text({
      message: "Where should we save your brainstorm? (./relative-path)",
      placeholder,
      defaultValue: placeholder,
    });

    if (typeof result === "string") {
      if (result === "") {
        ctx.specPath = placeholder;
      } else {
        // Check if it's a bare filename (no directory separators and no relative path markers)
        const dirname = path.dirname(result);
        if (
          dirname === "." &&
          !result.startsWith("./") &&
          !result.startsWith("../")
        ) {
          // It's a bare filename add it to the current working directory
          ctx.specPath = path.join(ctx.cwd, result);
        } else {
          ctx.specPath = result;
        }
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
