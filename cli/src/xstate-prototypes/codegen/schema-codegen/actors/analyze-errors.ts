import { fromPromise } from "xstate";
import type {
  TypescriptErrorAnalysisOptions,
  SchemaErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { analyzeErrors } from "@/xstate-prototypes/ai/codegen/schema/analyze-errors";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

export const analyzeErrorsActor = fromPromise<
  SchemaErrorAnalysisResult | null,
  {
    apiKey: string;
    options: TypescriptErrorAnalysisOptions;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  analyzeErrors(
    input.apiKey,
    input.options,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
