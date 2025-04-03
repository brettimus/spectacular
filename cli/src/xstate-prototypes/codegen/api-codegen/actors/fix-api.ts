import { fromPromise } from "xstate";
import {
  fixApiErrors,
  type ApiFixResult,
} from "@/xstate-prototypes/ai/codegen/api/fix-api";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

export const fixApiErrorsActor = fromPromise<
  ApiFixResult | null,
  {
    apiKey: string;
    fixContent: string;
    originalApiCode: string;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  fixApiErrors(
    input.apiKey,
    input.fixContent,
    input.originalApiCode,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
