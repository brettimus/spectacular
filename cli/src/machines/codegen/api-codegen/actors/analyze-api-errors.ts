import {
  type AnalyzeApiErrorsResult,
  type FpAiConfig,
  analyzeApiErrors,
} from "../../../../ai";
import type { ErrorInfo } from "../../../../typechecking";
import { fromPromise } from "xstate";

// Re-export the result type so it can be referenced in the machine
export type { AnalyzeApiErrorsResult };

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
