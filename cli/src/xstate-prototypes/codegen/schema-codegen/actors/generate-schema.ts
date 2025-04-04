import { fromPromise } from "xstate";
import type {
  SchemaGenerationOptions,
  SchemaGenerationResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { generateSchema } from "@/xstate-prototypes/ai/codegen/schema/generate-schema";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

export const generateSchemaActor = fromPromise<
  SchemaGenerationResult,
  {
    aiConfig: FpAiConfig;
    options: SchemaGenerationOptions;
  }
>(({ input, signal }) => generateSchema(input.aiConfig, input.options, signal));
