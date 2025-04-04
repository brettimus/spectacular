import { fromPromise } from "xstate";
import type {
  SchemaFixOptions,
  SchemaFixResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { fixSchema as fixSchemaAi } from "@/xstate-prototypes/ai/codegen/schema/fix-schema";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

/**
 * Fix schema errors using AI
 */
export const fixSchemaActor = fromPromise<
  SchemaFixResult | null,
  {
    aiConfig: FpAiConfig;
    options: SchemaFixOptions;
  }
>(({ input, signal }) =>
  fixSchemaAi(
    input.aiConfig,
    input.options,
    signal,
  ),
);
