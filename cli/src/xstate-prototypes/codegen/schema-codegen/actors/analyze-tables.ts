import { fromPromise } from "xstate";
import type {
  AnalyzeTablesOptions,
  AnalyzeTablesResult,
} from "@/xstate-prototypes/ai";
import { analyzeTables } from "@/xstate-prototypes/ai/codegen/schema/analyze-tables";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

/**
 * Analyze tables from specification using AI
 */
export const analyzeTablesActor = fromPromise<
  AnalyzeTablesResult,
  {
    aiConfig: FpAiConfig;
    options: AnalyzeTablesOptions;
  }
>(({ input, signal }) => analyzeTables(input.aiConfig, input.options, signal));
