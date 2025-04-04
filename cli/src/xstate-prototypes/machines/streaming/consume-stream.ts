import { fromPromise } from "xstate";
import type { AiTextStreamResult, AiResponseMessage } from "./types";
import type { AnyActorRef } from "xstate";
import { log } from "../../utils/logging";
import { createChunkEvent } from "./events";

export type ConsumeStreamOutput =
  | { success: true; responseMessages: AiResponseMessage[] }
  | { success: false; error: Error };

export const consumeStreamActor = fromPromise<
  ConsumeStreamOutput,
  { streamResponse: AiTextStreamResult; parent: AnyActorRef }
>(async ({ input }) => {
  try {
    // Extract the textStream from the StreamingTextResponse
    const textStream = input.streamResponse.textStream;

    if (!textStream) {
      throw new Error("No text stream available in the response");
    }

    // Send the chunks to the parent actor as well
    for await (const chunk of textStream) {
      input.parent.send(createChunkEvent(chunk));
    }

    // Wait for the response to be complete, so we can send the final `messages` array collected by the ai sdk
    const response = await input.streamResponse.response;

    return { success: true, responseMessages: response.messages };
  } catch (error) {
    log("error", "Error processing stream:", { error });
    throw error;
  }
});
