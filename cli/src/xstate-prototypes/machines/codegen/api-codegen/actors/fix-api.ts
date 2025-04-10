import {
  type FixApiErrorsResult,
  type FpAiConfig,
  fixApiErrors,
} from "../../../../ai";
import { fromPromise } from "xstate";

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
