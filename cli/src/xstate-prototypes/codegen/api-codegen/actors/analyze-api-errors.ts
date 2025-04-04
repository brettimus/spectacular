import { fromPromise } from "xstate";
import {
  analyzeApiErrors,
  type AnalyzeApiErrorsResult,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";
import type { ErrorInfo } from "@/xstate-prototypes/typechecking";

/**
 * Analyze API errors using AI
 */
export const analyzeApiErrorsActor = fromPromise<
  AnalyzeApiErrorsResult | null,
  {
    aiConfig: FpAiConfig;
    apiCode: string;
    errors: ErrorInfo[];
  }
>(({ input, signal }) =>
  analyzeApiErrors(
    input.aiConfig,
    {
      apiCode: input.apiCode,
      errors: input.errors,
    },
    signal,
  ),
);
