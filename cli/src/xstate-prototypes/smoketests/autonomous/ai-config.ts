import type { FpModelProvider } from "@/xstate-prototypes/ai";

export function getAiConfig(aiProvider: FpModelProvider): {
  apiKey: string;
  aiProvider: FpModelProvider;
} {
  if (aiProvider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return {
      apiKey: process.env.OPENAI_API_KEY,
      aiProvider: "openai",
    };
  }

  if (aiProvider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    return {
      apiKey: process.env.ANTHROPIC_API_KEY,
      aiProvider: "anthropic",
    };
  }

  throw new Error(`Unsupported AI provider: ${aiProvider}`);
}
