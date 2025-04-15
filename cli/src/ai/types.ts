export type OpenAiModelName = "gpt-4o" | "gpt-4o-mini" | "o3-mini";

export type AnthropicModelName =
  | "claude-3-7-sonnet-20250219"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022";

export type OllamaModelName = "gemma3:4b" | "qwq:32b";

export type CloudflareModelName =
  | "@cf/meta/llama-4-scout-17b-16e-instruct"
  | "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  | "@cf/meta/llama-3.1-8b-instruct-fast"
  | "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";

type OpenAiModelDetails = {
  modelProvider: "openai";
  modelName: OpenAiModelName;
  responsesApi?: boolean;
};

type AnthropicModelDetails = {
  modelProvider: "anthropic";
  modelName: AnthropicModelName;
};

type OllamaModelDetails = {
  modelProvider: "ollama";
  modelName: OllamaModelName;
};

/**
 * @NOTE - NOT YET IMPLEMENTED IN STATE MACHINES
 */
export type CloudflareModelDetails = {
  modelProvider: "cloudflare";
  modelName: CloudflareModelName;
};

export type FpModelDetails =
  | OpenAiModelDetails
  | AnthropicModelDetails
  | OllamaModelDetails
  | CloudflareModelDetails;

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
