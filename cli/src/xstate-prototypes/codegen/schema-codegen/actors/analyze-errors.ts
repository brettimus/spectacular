import { fromPromise } from "xstate";
import type {
  TypescriptErrorAnalysisOptions,
  SchemaErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { analyzeErrors } from "@/xstate-prototypes/ai/codegen/schema/analyze-schema-errors";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

export const analyzeErrorsActor = fromPromise<
  SchemaErrorAnalysisResult | null,
  {
    aiConfig: FpAiConfig;
    options: TypescriptErrorAnalysisOptions;
  }
>(({ input, signal }) =>
  analyzeErrors(
    input.aiConfig,
    input.options,
    signal,
  ),
);
