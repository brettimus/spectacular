import {
  type FpAiConfig,
  type GenerateSchemaOptions,
  type GenerateSchemaResult,
  generateSchema,
} from "@/xstate-prototypes/ai";
import { fromPromise } from "xstate";

export const generateSchemaActor = fromPromise<
  GenerateSchemaResult,
  {
    aiConfig: FpAiConfig;
    options: GenerateSchemaOptions;
  }
>(({ input, signal }) => generateSchema(input.aiConfig, input.options, signal));
