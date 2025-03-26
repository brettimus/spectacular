import type { Context } from "@/context";
import type { ErrorInfo } from "@/utils/typechecking/types";

export interface ApiGenerationOptions {
  schema: string;
}

export interface ApiVerificationOptions {
  schema: string;
  apiCode: string;
}

export interface ApiVerificationResult {
  valid: boolean;
  issues: string[];
}

export interface ApiGenerationResult {
  indexTs: string;
  reasoning: string;
}

export interface ApiErrorAnalysisResult {
  text: string;
  sources?: Record<string, unknown>[];
}

export interface ApiFixResult {
  code: string;
}

export interface ApiAgentInterface {
  generateApiRoutes(
    context: Context,
    options: ApiGenerationOptions,
  ): Promise<string>;

  generateApiWithReasoning(
    context: Context,
    options: ApiGenerationOptions,
  ): Promise<ApiGenerationResult>;

  verifyApi(
    context: Context,
    options: ApiVerificationOptions,
  ): Promise<ApiVerificationResult>;

  analyzeApiErrors(
    context: Context,
    apiCode: string,
    errors: ErrorInfo[],
  ): Promise<ApiErrorAnalysisResult | null>;

  fixApiErrors(
    context: Context,
    fixContent: string,
    originalApiCode: string,
  ): Promise<ApiFixResult | null>;
}
