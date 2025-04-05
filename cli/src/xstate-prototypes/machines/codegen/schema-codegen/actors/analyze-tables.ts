import {
  type AnalyzeTablesOptions,
  type AnalyzeTablesResult,
  type FpAiConfig,
  analyzeTables,
} from "@/xstate-prototypes/ai";
import { fromPromise } from "xstate";

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
