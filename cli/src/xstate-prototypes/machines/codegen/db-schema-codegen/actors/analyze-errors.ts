import type { FpAiConfig } from "@/xstate-prototypes/ai";
import type {
  AnalyzeSchemaErrorsOptions,
  AnalyzeSchemaErrorsResult,
} from "@/xstate-prototypes/ai";
import { analyzeErrors } from "@/xstate-prototypes/ai/codegen/db-schema/analyze-schema-errors";
import { fromPromise } from "xstate";

// Re-export the result type so it can be referenced in the machine
export type { AnalyzeSchemaErrorsResult };

export const analyzeErrorsActor = fromPromise<
  AnalyzeSchemaErrorsResult | null,
  {
    aiConfig: FpAiConfig;
    options: AnalyzeSchemaErrorsOptions;
  }
>(({ input, signal }) => analyzeErrors(input.aiConfig, input.options, signal));
