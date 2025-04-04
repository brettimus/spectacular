import { fromPromise } from "xstate";
import type { Message } from "ai";

import {
  routeRequest,
  type RouterResponse,
  type FpAiConfig,
} from "@/xstate-prototypes/ai";

// Re-exporting these types because they are used by the main machine
// and it makes sense to have them in the same file as the actor
export type { RouterResponse };
export type RouterResponseType = RouterResponse["nextStep"];

export const routeRequestActor = fromPromise<
  RouterResponse,
  {
    aiConfig: FpAiConfig;
    messages: Message[];
  }
>(async ({ input, signal }) => {
  return routeRequest(input.aiConfig, { messages: input.messages }, signal);
});
