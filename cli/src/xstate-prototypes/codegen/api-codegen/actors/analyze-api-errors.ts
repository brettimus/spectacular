import { fromPromise } from "xstate";
import {
  analyzeApiErrors,
  type ApiErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/api/analyze-api-errors";
import type { ErrorInfo } from "@/xstate-prototypes/typechecking/types";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

/**
 * Analyze API errors using AI
 */
export const analyzeApiErrorsActor = fromPromise<
  ApiErrorAnalysisResult | null,
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
