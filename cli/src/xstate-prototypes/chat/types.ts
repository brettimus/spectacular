import type { Message } from "ai";
import type { GeneratedPlan, RouterResponseType } from "./actors";

export interface ChatRouterMachineContext {
  messages: Message[];
  responseType?: RouterResponseType;
  response?: GeneratedPlan | ReadableStream;
}

export type ChatRouterMachineOutput = ChatRouterMachineContext;
