import type { Context } from "@/context";
import { text } from "@clack/prompts";
import pico from "picocolors";

export async function promptDescription(ctx: Context) {
  try {
    const placeholder = "Describe your api...";
    const result = await text({
      message: "Let's build an api.",
      placeholder,
      defaultValue: "",
      validate: (value) => {
        if (value === "") {
          return pico.italic("Give me something to work with here!");
        }
        return undefined;
      },
    });

    // NOTE - Do not give a default description
    if (typeof result === "string") {
      if (result !== "") {
        ctx.description = result;
      }
    }

    return result;
  } catch (error) {
    return error;
  }
}
