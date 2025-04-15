import { createOpenAI } from "@ai-sdk/openai";

export const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
  responsesApi: true,
  temperature: 0.5,
  getSystemPrompt,
  getTools: (apiKey: string, aiGatewayUrl?: string) => {
    return {
      web_search_preview: createOpenAI({
        apiKey,
        baseURL: aiGatewayUrl,
      }).tools.webSearchPreview(),
    };
  },
} as const;

function getSystemPrompt() {
  return "";
}
