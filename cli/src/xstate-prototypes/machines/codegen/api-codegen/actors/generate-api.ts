import { fromPromise } from "xstate";
import {
  generateApi,
  type GenerateApiResult,
  type GenerateApiOptions,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

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
