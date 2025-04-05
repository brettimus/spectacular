import {
  type FixSchemaOptions,
  type FixSchemaResult,
  type FpAiConfig,
  fixSchema,
} from "@/xstate-prototypes/ai";
import { fromPromise } from "xstate";

/**
 * Fix schema errors using AI
 */
export const fixSchemaActor = fromPromise<
  FixSchemaResult | null,
  {
    aiConfig: FpAiConfig;
    options: FixSchemaOptions;
  }
>(({ input, signal }) => fixSchema(input.aiConfig, input.options, signal));
