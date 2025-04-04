import { fromPromise } from "xstate";
import {
  generateSchema,
  type GenerateSchemaOptions,
  type GenerateSchemaResult,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

export const generateSchemaActor = fromPromise<
  GenerateSchemaResult,
  {
    aiConfig: FpAiConfig;
    options: GenerateSchemaOptions;
  }
>(({ input, signal }) => generateSchema(input.aiConfig, input.options, signal));
