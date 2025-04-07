import { generateText, streamText } from "ai";
import type { Message } from "ai";
import { ollama } from "ollama-ai-provider";
import { fromPromise } from "xstate";
import type { AiTextStreamResult } from "../../machines/streaming";
import {
  FpAiConfig,
  GeneratedPlan,
  RouterResponse,
} from "@/xstate-prototypes/ai";
import { RouterResponseType } from "@/xstate-prototypes/machines/chat/actors";

export const routeRequestLocalActor = fromPromise<
  RouterResponse,
  { aiConfig: FpAiConfig; messages: Message[] }
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
  return { nextStep, reasoning: "NA" };
});

// This is tricky, we will need to stream the response
export const askNextQuestionOllamaActor = fromPromise<
  AiTextStreamResult,
  { aiConfig: FpAiConfig; messages: Message[] }
>(async ({ input }) => {
  // console.log("--> asking next question!");
  // await new Promise(r => setTimeout(r, 2000));
  const model = ollama("gemma3:4b");
  const response = streamText({
    model,
    system:
      "You are an inquisitive goose, behave like a goose. BUT BE VERY CONCISE",
    messages: input.messages,
  });
  return response;
});

export const generateSpecLocalActor = fromPromise<
  GeneratedPlan,
  { aiConfig: FpAiConfig; messages: Message[] }
>(async () => {
  console.log("--> generating the plan!");
  await new Promise((r) => setTimeout(r, 5000));
  return {
    title: "Hi",
    plan: "# This is a plan\nnvm wait i got lost",
  };
});
