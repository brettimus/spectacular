import type { GeneratedPlan } from "@/agents/ideation-agent/generate-spec";
import type { Message } from "ai";

export type RouterResponseType =
  | "ask_follow_up_question"
  | "generate_implementation_plan";

export interface ChatRouterMachineContext {
  messages: Message[];
  responseType?: RouterResponseType;
  response?: GeneratedPlan | ReadableStream;
}

export type ChatRouterMachineOutput = ChatRouterMachineContext;

export type RouterResponse = {
  nextStep: RouterResponseType;
  reasoning: string;
};
