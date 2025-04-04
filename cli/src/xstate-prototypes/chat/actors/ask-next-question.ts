import type { Message } from "ai";
import { fromPromise } from "xstate";
import { askNextQuestion } from "@/xstate-prototypes/ai";
import type { FpAiConfig } from "@/xstate-prototypes/ai";
import type { AiTextStreamResult } from "../../streaming/types";

export const askNextQuestionActor = fromPromise<
  AiTextStreamResult,
  { aiConfig: FpAiConfig; messages: Message[] }
>(async ({ input, signal }) => {
  return askNextQuestion(input.aiConfig, { messages: input.messages }, signal);
});
