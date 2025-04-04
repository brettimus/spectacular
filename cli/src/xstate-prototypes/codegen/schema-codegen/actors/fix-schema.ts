import { fromPromise } from "xstate";
import {
  fixSchema,
  type FixSchemaOptions,
  type FixSchemaResult,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

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
