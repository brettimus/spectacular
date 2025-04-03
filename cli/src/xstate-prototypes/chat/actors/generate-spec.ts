import type { Message } from "ai";
import { fromPromise } from "xstate";
import {
  generateSpec,
  type GeneratedPlan,
  GeneratedPlanSchema,
} from "@/xstate-prototypes/ai/chat/generate-spec";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

// Re-exporting schema for backwards compatibility within this module
export { GeneratedPlanSchema, type GeneratedPlan };

export const generateSpecActor = fromPromise<
  GeneratedPlan,
  {
    apiKey: string;
    messages: Message[];
    // Add new optional inputs
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(async ({ input }) => {
  return generateSpec(
    input.apiKey,
    input.messages,
    input.aiProvider,
    input.aiGatewayUrl,
  );
});
