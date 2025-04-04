import { fromPromise } from "xstate";
import {
  fixApiErrors,
  type FixApiErrorsResult,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

export const fixApiErrorsActor = fromPromise<
  FixApiErrorsResult | null,
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
