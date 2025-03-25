import type { Context } from "@/context";

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
}
