import { fromPromise } from "xstate";
import {
  generateApi,
  type ApiGenerationResult,
} from "@/xstate-prototypes/ai/codegen/api/generate-api";
import type { ApiGenerationOptions } from "./types";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

export type { ApiGenerationOptions, ApiGenerationResult };

export const generateApiActor = fromPromise<
  ApiGenerationResult,
  {
    aiConfig: FpAiConfig;
    options: ApiGenerationOptions;
  }
>(({ input, signal }) =>
  generateApi(
    input.aiConfig,
    {
      spec: input.options.spec,
      schema: input.options.schema,
    },
    signal,
  ),
);
