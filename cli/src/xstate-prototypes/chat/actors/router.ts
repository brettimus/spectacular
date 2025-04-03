import { fromPromise } from "xstate";
import type { Message } from "ai";

import {
  routeRequest,
  type RouterResponse,
} from "@/xstate-prototypes/ai/chat/router";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

export type { RouterResponse };

export const routeRequestActor = fromPromise<
  RouterResponse,
  {
    apiKey: string;
    messages: Message[];
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(async ({ input, signal }) => {
  return routeRequest(
    input.apiKey,
    input.messages,
    signal,
    input.aiProvider,
    input.aiGatewayUrl,
  );
});
