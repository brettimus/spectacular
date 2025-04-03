import { fromPromise } from "xstate";
import type {
  SchemaFixOptions,
  SchemaFixResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { fixSchema as fixSchemaAi } from "@/xstate-prototypes/ai/codegen/schema/fix-schema";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

/**
 * Fix schema errors using AI
 */
export const fixSchemaActor = fromPromise<
  SchemaFixResult | null,
  {
    apiKey: string;
    options: SchemaFixOptions;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(({ input, signal }) =>
  fixSchemaAi(
    input.apiKey,
    input.options,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  ),
);
