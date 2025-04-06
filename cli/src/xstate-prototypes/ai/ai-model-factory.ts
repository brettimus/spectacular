import type { LanguageModelV1 } from "ai";
import type { Ai } from "@cloudflare/workers-types";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createWorkersAI } from 'workers-ai-provider';
import { ollama } from "ollama-ai-provider";
import { traceAISDKModel } from "evalite/ai-sdk";

import type {
  AnthropicModelName,
  FpAiModelFactoryOptions,
  OllamaModelName,
  OpenAiModelName,
  CloudflareModelName,
  CloudflareModelDetails,
} from "./types";

// Create new type for Cloudflare options
export type CloudflareAiModelFactoryOptions = {
  aiBinding: Ai;
  modelDetails: CloudflareModelDetails;
  aiGatewayId?: string;
};

/**
 * Create an ai-sdk {@link LanguageModelV1} from a model details object
 *
 * This function will also wrap the model in an evalite {@link traceAISDKModel}
 * to enable tracing of the model calls during evals.
 *
 * Tracing is a noop in production.
 */
export function aiModelFactory(
  options: FpAiModelFactoryOptions | CloudflareAiModelFactoryOptions,
): LanguageModelV1 {
  // Handle Cloudflare Worker Ai config
  if ('aiBinding' in options && options.modelDetails.modelProvider === 'cloudflare') {
    const { aiBinding, modelDetails, aiGatewayId } = options;
    const model = fromCloudflareModelName(
      aiBinding, 
      modelDetails.modelName, 
      aiGatewayId
    );
    return traceAISDKModel(model);
  }
  
  // Handle other providers
  const { apiKey, modelDetails, aiGatewayUrl } = options as FpAiModelFactoryOptions;
  let model: LanguageModelV1;
  
  switch (modelDetails.modelProvider) {
    case "openai": {
      model = fromOpenAiModelName(
        apiKey,
        modelDetails.modelName,
        modelDetails.responsesApi,
        aiGatewayUrl
      );
      break;
    }
    case "anthropic": {
      model = fromAnthropicModelName(
        apiKey, 
        modelDetails.modelName, 
        aiGatewayUrl
      );
      break;
    }
    case "ollama": {
      model = fromOllamaModelName(modelDetails.modelName);
      break;
    }
    default:
      throw new Error(`Unsupported model: ${modelDetails.modelProvider}:${modelDetails.modelName}`);
  }

  return traceAISDKModel(model);
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

function fromCloudflareModelName(
  binding: Ai,
  modelName: CloudflareModelName,
  aiGatewayId?: string,
): LanguageModelV1 {
  // TODO -
  // Docs: https://developers.cloudflare.com/ai-gateway/providers/workersai/
  const gateway = aiGatewayId ? { id: aiGatewayId } : undefined;
  const workersAi = createWorkersAI({ binding, gateway });
  return workersAi(modelName);
}
