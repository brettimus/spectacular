import type { Message } from "ai";
import { fromPromise } from "xstate";
import {
  generateSpec,
  type GeneratedPlan,
  GeneratedPlanSchema,
} from "@/xstate-prototypes/ai/chat/generate-spec";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

// Re-exporting schema for backwards compatibility within this module
export { GeneratedPlanSchema, type GeneratedPlan };

export const generateSpecActor = fromPromise<
  GeneratedPlan,
  {
    aiConfig: FpAiConfig;
    messages: Message[];
  }
>(async ({ input, signal }) => {
  return generateSpec(input.aiConfig, { messages: input.messages }, signal);
});
