import type { Context } from "@/context";
import { text } from "@clack/prompts";
import pico from "picocolors";

export async function promptOpenAiKey(ctx: Context) {
  try {
    const placeholder = "sk-...";
    const result = await text({
      message: "Enter an OpenAI API key",
      placeholder,
      defaultValue: "",
      validate: (value) => {
        if (value === "") {
          return pico.italic("I need the key to continue!");
        }
        return undefined;
      },
    });

    // NOTE - Do not give a default description
    if (typeof result === "string") {
      if (result !== "") {
        ctx.apiKey = result;
      }
    }

    return result;
  } catch (error) {
    return error;
  }
}
