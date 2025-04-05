import {
  type FpAiConfig,
  type GenerateApiOptions,
  type GenerateApiResult,
  generateApi,
} from "@/xstate-prototypes/ai";
import { fromPromise } from "xstate";

export const generateApiActor = fromPromise<
  GenerateApiResult,
  {
    aiConfig: FpAiConfig;
    options: GenerateApiOptions;
  }
>(({ input, signal }) =>
  generateApi(
    input.aiConfig,
    {
      spec: input.options.spec,
      schema: input.options.schema,
    },
    signal,
  ),
);
