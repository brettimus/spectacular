import type { Message } from "ai";
import { fromPromise } from "xstate";
import type { WithTrace } from "../../types";
import { type GeneratedPlan, generateSpec } from "../../../ai";
import type { FpAiConfig } from "../../../ai";

// Re-exporting this return type because it is used by the main machine
// and it makes sense to have it in the same file as the actor
export type { GeneratedPlan };

// Export the input type for the actor to be reused in tests
export type GenerateSpecActorInput = WithTrace<{
  aiConfig: FpAiConfig;
  messages: Message[];
}>;

export const generateSpecActor = fromPromise<
  GeneratedPlan,
  GenerateSpecActorInput
>(async ({ input, signal }) => {
  return generateSpec(input.aiConfig, { messages: input.messages }, signal);
});
