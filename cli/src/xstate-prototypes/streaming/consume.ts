import { fromPromise } from "xstate";
import type { QuestionTextStreamResult, ResponseMessage } from "./types";
import type { AnyActorRef } from "xstate";
export type ConsumeStreamOutput =
  | { success: true; responseMessages: ResponseMessage[] }
  | { success: false; error: Error };

export const consumeStreamActor = fromPromise<
  ConsumeStreamOutput,
  { streamResponse: QuestionTextStreamResult; parent: AnyActorRef }
>(async ({ input }) => {
  try {
    // Extract the textStream from the StreamingTextResponse
    const textStream = input.streamResponse.textStream;

    if (!textStream) {
      throw new Error("No text stream available in the response");
    }

    for await (const chunk of textStream) {
      input.parent.send({ type: "CHUNK", content: chunk });
    }

    // NOTE - Do not send the STREAM_COMPLETE event here,
    //        because the textStreamMachine needs to pass
    //        the response to the parent actor to trigger the transition to its final state
    // input.parent.send({ type: "STREAM_COMPLETE" });

    const response = await input.streamResponse.response;
    return { success: true, responseMessages: response.messages };
  } catch (error) {
    // Handle any errors
    console.error("Error processing stream:", error);
    // FIXME
    // NOTE - We could skip this and implement the onError in the parent text stream machien
    input.parent.send({
      type: "STREAM_ERROR",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
});
