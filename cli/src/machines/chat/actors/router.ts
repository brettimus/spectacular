import type { Message } from "ai";
import { fromPromise } from "xstate";
import {
  type FpAiConfig,
  type RouterResponse,
  routeRequest,
} from "../../../ai";
import type { WithTrace } from "../../types";

// Re-exporting these types because they are used by the main machine
// and it makes sense to have them in the same file as the actor
export type { RouterResponse };
export type RouterResponseType = RouterResponse["nextStep"];

// Export the input type for the actor to be reused in tests
export type RouterActorInput = WithTrace<{
  aiConfig: FpAiConfig;
  messages: Message[];
}>;

export const routeRequestActor = fromPromise<RouterResponse, RouterActorInput>(
  async ({ input, signal }) => {
    return routeRequest(input.aiConfig, { messages: input.messages }, signal);
  },
);
