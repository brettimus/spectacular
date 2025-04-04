import { fromPromise } from "xstate";
import {
  fixApiErrors,
  type ApiFixResult,
} from "@/xstate-prototypes/ai/codegen/api/fix-api";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

export const fixApiErrorsActor = fromPromise<
  ApiFixResult | null,
  {
    aiConfig: FpAiConfig;
    fixContent: string;
    originalApiCode: string;
  }
>(({ input, signal }) =>
  fixApiErrors(
    input.aiConfig,
    {
      fixContent: input.fixContent,
      originalApiCode: input.originalApiCode,
    },
    signal,
  ),
);
