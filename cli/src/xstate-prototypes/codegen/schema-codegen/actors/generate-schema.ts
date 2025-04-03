import { fromPromise } from "xstate";
import type { SchemaGenerationOptions, SchemaGenerationResult } from "@/xstate-prototypes/ai/codegen/schema/types";
import { generateSchema } from "@/xstate-prototypes/ai/codegen/schema/generate-schema";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

export const generateSchemaActor = fromPromise<
  SchemaGenerationResult,
  { apiKey: string; options: SchemaGenerationOptions, aiProvider: FpModelProvider, aiGatewayUrl?: string }
>(({ input, signal }) => generateSchema(input.apiKey, input.options, signal, input.aiProvider, input.aiGatewayUrl));

