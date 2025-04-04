export type OpenAiModelName = "gpt-4o" | "gpt-4o-mini" | "o3-mini";

export type AnthropicModelName =
  | "claude-3-7-sonnet-20250219"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022";

export type OllamaModelName = "gemma3:4b" | "qwq:32b";

export type FpModelDetails =
  | {
      modelProvider: "openai";
      modelName: OpenAiModelName;
      responsesApi?: boolean;
    }
  | {
      modelProvider: "anthropic";
      modelName: AnthropicModelName;
    }
  | {
      modelProvider: "ollama";
      modelName: OllamaModelName;
    };

export type FpModelProvider = FpModelDetails["modelProvider"];

export type FpAiModelFactoryOptions = {
  apiKey: string;
  modelDetails: FpModelDetails;
  aiGatewayUrl?: string;
};

/**
 * Configuration for AI service calls
 */
export type FpAiConfig = {
  apiKey: string;
  aiProvider: FpModelProvider;
  aiGatewayUrl?: string;
};
