import { fromPromise } from "xstate";
import type { QuestionTextStreamResult } from "../types";
import type { ResponseMessage } from "./types";
import type { AnyActorRef } from "xstate";
export type ConsumeStreamOutput =
  | { success: true; responseMessages: ResponseMessage[] }
  | { success: false; error: Error };

export const consumeStreamActor = fromPromise<
  ConsumeStreamOutput,
  { streamResponse: QuestionTextStreamResult, parent: AnyActorRef }
>(async ({ input }) => {
  console.log("Consume stream actor");
  try {
    // Extract the textStream from the StreamingTextResponse
    const textStream = input.streamResponse.textStream;

    if (!textStream) {
      throw new Error("No text stream available in the response");
    }

    for await (const chunk of textStream) {
      console.log("Consume stream actor chunk", chunk);
      input.parent.send({ type: "CHUNK", content: chunk });
    }

    // NOTE - Do not send the STREAM_COMPLETE event here,
    //        because the textStreamMachine needs to pass 
    //        its output to the parent actor
    // input.parent.send({ type: "STREAM_COMPLETE" });

    const response = await input.streamResponse.response;
    console.log("Consume stream actor response", response);
    return { success: true, responseMessages: response.messages };
  } catch (error) {
    // Handle any errors
    console.error("Error processing stream:", error);
    input.parent.send({
      type: "STREAM_ERROR",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
});
