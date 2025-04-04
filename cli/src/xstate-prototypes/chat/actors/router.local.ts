import { generateText, type Message } from "ai";
import { fromPromise } from "xstate";
import { ollama } from "ollama-ai-provider";
import type { RouterResponse, RouterResponseType } from "./router";

export const routeRequestActor = fromPromise<
  RouterResponse,
  { messages: Message[] }
>(async ({ input, signal }) => {
  const model = ollama("gemma3:4b");
  const response = await generateText({
    model,
    system:
      "You are a router. Only respond with one of two responses: 'ask_follow_up_question' or 'generate_implementation_plan'. Do not include quotes.",
    messages: input.messages,
    abortSignal: signal,
  });
  let nextStep = response.text?.trim() as RouterResponseType;
  if (
    nextStep !== "ask_follow_up_question" &&
    nextStep !== "generate_implementation_plan"
  ) {
    console.error("Invalid response from router:", nextStep);
    nextStep = "ask_follow_up_question";
  }
  return { nextStep, reasoning: "TODO" };

  // return { nextStep: "ask_follow_up_question", reasoning: "TODO" };
});
