import type { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ollama } from "ollama-ai-provider";
import { traceAISDKModel } from "evalite/ai-sdk";
import type {
  AnthropicModelName,
  FpAiModelFactoryOptions,
  FpModelDetails,
  OllamaModelName,
  OpenAiModelName,
} from "./types";

/**
 * Create an ai-sdk {@link LanguageModelV1} from a model details object
 *
 * This function will also wrap the model in an evalite {@link traceAISDKModel}
 * to enable tracing of the model calls during evals.
 *
 * Tracing is a noop in production.
 */
export function aiModelFactory(
  options: FpAiModelFactoryOptions,
): LanguageModelV1 {
  const { apiKey, modelDetails, aiGatewayUrl } = options;
  const model = fromModelDetails(apiKey, modelDetails, aiGatewayUrl);

  return traceAISDKModel(model);
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
