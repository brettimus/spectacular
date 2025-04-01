import type { Message } from "ai";
import { z } from "zod";

const GeneratedPlanSchema = z.object({
  title: z.string().describe("A title for the project."),
  plan: z
    .string()
    .describe(
      "A detailed implementation plan / handoff document for a developer to implement the project (in markdown).",
    ),
});

export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;

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
