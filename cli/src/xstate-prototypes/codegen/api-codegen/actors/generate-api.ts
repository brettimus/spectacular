import { fromPromise } from "xstate";
import {
  generateApi,
  type ApiGenerationResult,
} from "@/xstate-prototypes/ai/codegen/api/generate-api";
import type { ApiGenerationOptions } from "./types";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

export type { ApiGenerationOptions, ApiGenerationResult };

export const generateApiActor = fromPromise<
  ApiGenerationResult,
  {
    apiKey: string;
    options: ApiGenerationOptions;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  generateApi(
    input.apiKey,
    input.options.spec,
    input.options.schema,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
