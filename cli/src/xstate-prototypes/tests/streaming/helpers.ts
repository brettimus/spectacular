import { createActor, type AnyActorRef, fromPromise } from "xstate";
import type {
  AiResponseMessage,
  AiTextStreamResult,
} from "../../machines/streaming/types";
import { createChunkEvent } from "../../machines/streaming/events";
import type { ConsumeStreamOutput } from "../../machines/streaming/consume-stream";

/**
 * Defines the interface for a mock AI stream response
 */
export interface MockStreamResponse {
  textStream: ReadableStream<string> | null;
  response: Promise<{ messages: AiResponseMessage[] }>;
}

/**
 * Creates a readable stream that can be used for testing
 * This properly implements the async iterator protocol that the consume-stream actor uses
 */
export function createMockTextStream(chunks: string[]): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      // Add all chunks to the queue
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

/**
 * Creates a properly structured mock AI stream response with the specified chunks and messages
 * This more accurately mimics the Vercel AI SDK's structure
 */
export function createMockStreamResponse(
  chunks = ["Hello", ", ", "world", "!"],
  messages: AiResponseMessage[] = [
    { id: "1", role: "assistant", content: "Hello, world!" },
  ],
): MockStreamResponse {
  // Create a stream that will emit the chunks when iterated
  const textStream = createMockTextStream(chunks);

  // Return an object that matches what our tests expect and the consumer uses
  return {
    textStream,
    response: Promise.resolve({ messages }),
  };
}

/**
 * Creates a mock parent actor to receive events during tests
 */
export function createMockParentActor(): AnyActorRef {
  const parentActor = createActor(fromPromise(async () => {}));
  parentActor.start();
  return parentActor;
}

/**
 * Creates a mock consume stream actor that succeeds with the given chunks and messages
 */
export const createMockConsumeStreamSuccessActor = (
  chunks = ["Hello", ", ", "world", "!"],
  messages: AiResponseMessage[] = [
    { id: "1", role: "assistant", content: "Hello, world!" },
  ],
  delayMs = 10,
) => {
  return fromPromise<
    ConsumeStreamOutput,
    { streamResponse: AiTextStreamResult; parent: AnyActorRef }
  >(async ({ input }) => {
    // Send chunks to parent
    for (const chunk of chunks) {
      input.parent.send(createChunkEvent(chunk));
      // Add small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return {
      success: true,
      responseMessages: messages,
    };
  });
};

/**
 * Creates a mock consume stream actor that fails after sending some chunks
 */
export const createMockConsumeStreamFailureActor = (
  chunks = ["Hello"],
  errorMessage = "Stream processing failed",
  delayMs = 10,
) => {
  return fromPromise<
    ConsumeStreamOutput,
    { streamResponse: AiTextStreamResult; parent: AnyActorRef }
  >(async ({ input }) => {
    // Send chunks to parent before failing
    for (const chunk of chunks) {
      input.parent.send(createChunkEvent(chunk));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(errorMessage);
  });
};
