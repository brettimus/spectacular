import { fromPromise } from "xstate";
import type {
  SchemaAnalysisOptions,
  SchemaAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { analyzeTables } from "@/xstate-prototypes/ai/codegen/schema/analyze-tables";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

/**
 * Analyze tables from specification using AI
 */
export const analyzeTablesActor = fromPromise<
  SchemaAnalysisResult,
  {
    apiKey: string;
    options: SchemaAnalysisOptions;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  analyzeTables(
    input.apiKey,
    input.options,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
