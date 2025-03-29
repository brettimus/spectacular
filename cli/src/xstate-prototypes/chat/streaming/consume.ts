import { fromPromise } from "xstate";
import type { QuestionTextStreamResult } from "../types";
import type { ResponseMessage } from "./types";

export type ConsumeStreamOutput =
  | { success: true; responseMessages: ResponseMessage[] }
  | { success: false; error: Error };

export const consumeStreamActor = fromPromise<
  ConsumeStreamOutput,
  { streamResponse: QuestionTextStreamResult }
>(async ({ input, self }) => {
  try {
    // Extract the textStream from the StreamingTextResponse
    const textStream = input.streamResponse.textStream;

    if (!textStream) {
      throw new Error("No text stream available in the response");
    }

    for await (const chunk of textStream) {
      self.send({ type: "CHUNK", content: chunk });
    }

    self.send({ type: "STREAM_COMPLETE" });

    const response = await input.streamResponse.response;

    return { success: true, responseMessages: response.messages };
  } catch (error) {
    // Handle any errors
    console.error("Error processing stream:", error);
    self.send({
      type: "STREAM_ERROR",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
});
