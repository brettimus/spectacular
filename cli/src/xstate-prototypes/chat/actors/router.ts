import { fromPromise } from "xstate";
import type { Message } from "ai";

import {
  routeRequest,
  type RouterResponse,
} from "@/xstate-prototypes/ai/chat/router";
import type { FpAiConfig } from "@/xstate-prototypes/ai";

export type { RouterResponse };

export const routeRequestActor = fromPromise<
  RouterResponse,
  {
    aiConfig: FpAiConfig;
    messages: Message[];
  }
>(async ({ input, signal }) => {
  return routeRequest(input.aiConfig, { messages: input.messages }, signal);
});
