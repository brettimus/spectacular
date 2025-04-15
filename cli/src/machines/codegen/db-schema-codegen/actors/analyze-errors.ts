import type { FpAiConfig } from "../../../../ai";
import type {
  AnalyzeSchemaErrorsOptions,
  AnalyzeSchemaErrorsResult,
} from "../../../../ai";
import { analyzeErrors } from "../../../../ai/codegen/db-schema/analyze-schema-errors";
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
