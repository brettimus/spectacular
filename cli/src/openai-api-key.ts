import type { Context } from "@/context";
import { confirm, select, text } from "@clack/prompts";
import pico from "picocolors";
import { getApiKey, listApiKeys, saveApiKey } from "./utils/credentials";
import { handleResult } from "./utils";

export async function promptOpenAiKey(ctx: Context) {
  try {
    // Check if there are existing saved keys to offer
    const savedKeys = listApiKeys();

    if (savedKeys.length > 0) {
      // Ask if user wants to use a saved key or enter a new one
      const useExistingKey = await confirm({
        message: `You have ${savedKeys.length} saved API key(s). Would you like to use one of them?`,
      });

      handleResult(useExistingKey);

      if (useExistingKey) {
        // Let user select from saved keys
        const selectedKey = await select({
          message: "Choose a saved API key",
          options: savedKeys.map((key) => ({
            value: key.name,
            label: `${key.name}${key.isDefault ? " (default)" : ""}`,
          })),
        });

        handleResult(selectedKey);

        const keyName = String(selectedKey);
        const apiKey = getApiKey(keyName);

        if (apiKey) {
          ctx.apiKey = apiKey;
          return apiKey;
        }
      }
    }

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

    handleResult(result);

    // If we got a valid API key, offer to save it
    if (typeof result === "string" && result !== "") {
      ctx.apiKey = result;

      const saveName = await text({
        message:
          "Would you like to save this API key? Enter a name (or leave empty to skip)",
        placeholder: "default",
      });

      handleResult(saveName);

      if (typeof saveName === "string" && saveName !== "") {
        const makeDefault =
          savedKeys.length === 0 ||
          (await confirm({
            message: "Would you like to make this the default API key?",
          }));

        handleResult(makeDefault);

        saveApiKey(saveName, result, makeDefault === true);
      }
    }

    return result;
  } catch (error) {
    return error;
  }
}
