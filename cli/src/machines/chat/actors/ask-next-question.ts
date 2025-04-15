import type { Message } from "ai";
import { fromPromise } from "xstate";
import type { AiTextStreamResult } from "../../streaming/types";
import type { WithTrace } from "../../types";
import { askNextQuestion } from "../../../ai";
import type { FpAiConfig } from "../../../ai";

export type AskNextQuestionActorInput = WithTrace<{
  aiConfig: FpAiConfig;
  messages: Message[];
}>;

export const askNextQuestionActor = fromPromise<
  AiTextStreamResult,
  AskNextQuestionActorInput
>(async ({ input, signal }) => {
  return askNextQuestion(input.aiConfig, { messages: input.messages }, signal);
});
