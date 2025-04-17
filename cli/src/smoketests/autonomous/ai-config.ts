import type { FpModelProvider } from "@/ai";

const CLOUDFLARE_ACCOUNT_ID = "d49b8f4bbd035f3851d1e478dbc6f1a8";
const CLOUDFLARE_AI_GATEWAY_ID = "spectacular";

export function getAiConfig(aiProvider: FpModelProvider): {
  apiKey: string;
  aiProvider: FpModelProvider;
  aiGatewayUrl?: string;
} {
  if (aiProvider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return {
      apiKey: process.env.OPENAI_API_KEY,
      aiProvider: "openai",
      aiGatewayUrl: `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/openai`,
    };
  }

  if (aiProvider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    return {
      apiKey: process.env.ANTHROPIC_API_KEY,
      aiProvider: "anthropic",
      aiGatewayUrl: `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/anthropic`,
    };
  }

  throw new Error(`Unsupported AI provider: ${aiProvider}`);
}
