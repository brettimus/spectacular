import { fromPromise } from "xstate";
import {
  analyzeTables,
  type AnalyzeTablesOptions,
  type AnalyzeTablesResult,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

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
