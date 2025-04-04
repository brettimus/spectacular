import { fromPromise } from "xstate";
import type {
  SchemaAnalysisOptions,
  SchemaAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { analyzeTables } from "@/xstate-prototypes/ai/codegen/schema/analyze-tables";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

/**
 * Analyze tables from specification using AI
 */
export const analyzeTablesActor = fromPromise<
  SchemaAnalysisResult,
  {
    aiConfig: FpAiConfig;
    options: SchemaAnalysisOptions;
  }
>(({ input, signal }) =>
  analyzeTables(
    input.aiConfig,
    input.options,
    signal,
  ),
);
