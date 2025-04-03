import type { Message } from "ai";
import { fromPromise } from "xstate";
import type { FpModelProvider } from "@/xstate-prototypes/ai";
import { askNextQuestion } from "@/xstate-prototypes/ai";
import type { AiTextStreamResult } from "../../streaming/types";

export const askNextQuestionActor = fromPromise<
  AiTextStreamResult,
  { apiKey: string; messages: Message[]; aiProvider?: FpModelProvider }
>(async ({ input }) => {
  return askNextQuestion(input.apiKey, input.messages, input.aiProvider);
});
