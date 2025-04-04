import { fromPromise } from "xstate";
import {
  analyzeApiErrors,
  type ApiErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/api/analyze-api-errors";
import type { ErrorInfo } from "@/deprecated-cli/utils/typechecking/types";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

/**
 * Analyze API errors using AI
 */
export const analyzeApiErrorsActor = fromPromise<
  ApiErrorAnalysisResult | null,
  {
    apiKey: string;
    apiCode: string;
    errors: ErrorInfo[];
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  analyzeApiErrors(
    input.apiKey,
    input.apiCode,
    input.errors,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
