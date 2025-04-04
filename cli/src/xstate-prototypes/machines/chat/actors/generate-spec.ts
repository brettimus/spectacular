import type { Message } from "ai";
import { fromPromise } from "xstate";
import { generateSpec, type GeneratedPlan } from "@/xstate-prototypes/ai";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

// Re-exporting this return type because it is used by the main machine
// and it makes sense to have it in the same file as the actor
export type { GeneratedPlan };

export const generateSpecActor = fromPromise<
  GeneratedPlan,
  {
    aiConfig: FpAiConfig;
    messages: Message[];
  }
>(async ({ input, signal }) => {
  return generateSpec(input.aiConfig, { messages: input.messages }, signal);
});
