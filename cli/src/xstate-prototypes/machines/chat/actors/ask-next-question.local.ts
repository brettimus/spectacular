import { streamText } from "ai";
import type { Message } from "ai";
import { ollama } from "ollama-ai-provider";
import { fromPromise } from "xstate";
import type { AiTextStreamResult } from "../../streaming/types";

function askOllama(messages: Message[]) {
  const model = ollama("gemma3:4b");
  const response = streamText({
    model,
    system:
      "You are an inquisitive goose, behave like a goose. BUT BE VERY CONCISE",
    messages,
  });
  return response;
}

// This is tricky, we will need to stream the response
export const askNextQuestionActor = fromPromise<
  AiTextStreamResult,
  { messages: Message[] }
>(async ({ input }) => {
  // console.log("--> asking next question!");
  // await new Promise(r => setTimeout(r, 2000));
  return askOllama(input.messages);
});
