import { fromPromise } from "xstate";
import {
  verifyApi,
  type ApiVerificationResult,
} from "@/xstate-prototypes/ai/codegen/api/verify-api";
import type { ApiVerificationOptions } from "./types";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

/**
 * Verify API code using AI
 */
export const verifyApiActor = fromPromise<
  ApiVerificationResult,
  {
    apiKey: string;
    options: ApiVerificationOptions;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  verifyApi(
    input.apiKey,
    input.options,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
