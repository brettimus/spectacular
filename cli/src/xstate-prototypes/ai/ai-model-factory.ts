import type { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ollama } from "ollama-ai-provider";

type OpenAiModelName = "gpt-4o" | "gpt-4o-mini" | "o3-mini";
type AnthropicModelName = "claude-3-7-sonnet-20250219" | "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022";
type OllamaModelName = "gemma3:4b" | "qwq:32b";

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

export function aiModelFactory(
  options: FpAiModelFactoryOptions,
): LanguageModelV1 {
  const { apiKey, modelDetails, aiGatewayUrl } = options;
  return fromModelDetails(apiKey, modelDetails, aiGatewayUrl);
}

function fromModelDetails(
  apiKey: string,
  modelDetails: FpModelDetails,
  aiGatewayUrl?: string,
): LanguageModelV1 {
  const { modelProvider, modelName } = modelDetails;
  switch (modelProvider) {
    case "openai": {
      return fromOpenAiModelName(
        apiKey,
        modelName,
        modelDetails.responsesApi,
        aiGatewayUrl,
      );
    }
    case "anthropic": {
      return fromAnthropicModelName(apiKey, modelName, aiGatewayUrl);
    }
    case "ollama": {
      return fromOllamaModelName(modelName);
    }
    default:
      throw new Error(`Unsupported model: ${modelProvider}:${modelName}`);
  }
}

function fromOpenAiModelName(
  apiKey: string,
  modelName: OpenAiModelName,
  withOpenAIResponsesApi = false,
  aiGatewayUrl?: string,
): LanguageModelV1 {
  const openai = createOpenAI({ apiKey, baseURL: aiGatewayUrl });
  const model = withOpenAIResponsesApi
    ? openai.responses(modelName)
    : openai(modelName);
  return model;
}

function fromAnthropicModelName(
  apiKey: string,
  modelName: AnthropicModelName,
  aiGatewayUrl?: string,
): LanguageModelV1 {
  const anthropic = createAnthropic({ apiKey, baseURL: aiGatewayUrl });
  return anthropic(modelName);
}

function fromOllamaModelName(modelName: OllamaModelName): LanguageModelV1 {
  return ollama(modelName);
}