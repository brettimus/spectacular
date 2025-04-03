import { fromPromise } from "xstate";
// Remove unused imports
// import { createOpenAI } from "@ai-sdk/openai";
// import { generateText } from "ai";
// import { traceAISDKModel } from "evalite/ai-sdk";
// import { log } from "@/xstate-prototypes/utils/logging/logger";

// Import necessary types
import type {
  TypescriptErrorAnalysisOptions,
  SchemaErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
// Original ErrorInfo type might still be needed for the input structure
// import type { ErrorInfo } from "@/utils/typechecking/types";

// Re-import the AI function to ensure correct reference
import { analyzeErrors } from "@/xstate-prototypes/ai/codegen/schema/analyze-errors";
// Import provider type
import type { FpModelProvider } from "@/xstate-prototypes/ai";

// *** REMOVE OLD FUNCTION DEFINITION ***
// /**
//  * Analyze schema errors using AI
//  */
// export async function analyzeErrors(
//   apiKey: string,
//   options: TypescriptErrorAnalysisOptions,
//   signal?: AbortSignal,
// ): Promise<SchemaErrorAnalysisResult | null> {
//  ... old implementation ...
// }

export const analyzeErrorsActor = fromPromise<
  SchemaErrorAnalysisResult | null,
  {
    apiKey: string;
    options: TypescriptErrorAnalysisOptions;
    // Add new optional inputs
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  // Call the extracted function with new parameters
  analyzeErrors(
    input.apiKey,
    input.options,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);

// *** REMOVE OLD HELPER FUNCTION ***
// /**
//  * Generate a prompt for the AI to analyze schema errors
//  */
// function generateErrorAnalysisPrompt(
//   specContent: string,
//   schema: string,
//   errorMessages: ErrorInfo[],
// ): string {
//  ... old prompt generation ...
// }
