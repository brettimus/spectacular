import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createActor, type AnyActorRef } from "xstate";
import {
  consumeStreamActor,
  type ConsumeStreamOutput,
} from "../../machines/streaming/consume-stream";
import {
  createMockParentActor,
  createMockStreamResponse,
  type MockStreamResponse,
} from "./helpers";
import type { AiTextStreamResult } from "../../machines/streaming/types";

// Create a controlled error stream for testing
function createErrorStream() {
  let controller: ReadableStreamDefaultController<string> | null = null;

  const stream = new ReadableStream<string>({
    start(c) {
      controller = c;
      c.enqueue("This will be sent");
      // We don't throw here directly to avoid Vitest catching it
    },
  });

  // Return both the stream and a way to trigger the error later
  return {
    stream,
    triggerError: () => {
      if (controller) {
        // Use error() method instead of throwing directly
        controller.error(new Error("Stream error"));
      }
    },
  };
}

describe("Consume Stream Actor", () => {
  let mockParentActor: AnyActorRef;
  let mockStreamResponse: MockStreamResponse;

  beforeEach(() => {
    // Create a mock parent actor to receive events
    mockParentActor = createMockParentActor();

    // Spy on the parent's send method
    vi.spyOn(mockParentActor, "send");

    // Create a mock stream response with known chunks
    mockStreamResponse = createMockStreamResponse();

    // Mock console.error to suppress expected error messages
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockParentActor.stop();
  });

  it("should consume stream and emit chunks to parent", () => {
    // Create actor with our mock stream response
    const actor = createActor(consumeStreamActor, {
      input: {
        streamResponse: mockStreamResponse as unknown as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Set up done listener before starting the actor
    return new Promise<void>((resolve) => {
      // Listen for done event
      actor.subscribe((snapshot) => {
        if (snapshot.status === "done") {
          const result = snapshot.output as ConsumeStreamOutput;

          // Verify result is of success type
          expect(result).toBeDefined();
          expect(result).toHaveProperty("success", true);

          if (result && "success" in result && result.success) {
            // Check that it was successful
            expect(result.responseMessages).toEqual([
              { id: "1", role: "assistant", content: "Hello, world!" },
            ]);

            // Check that all chunks were sent to parent
            expect(mockParentActor.send).toHaveBeenCalledTimes(4);
            expect(mockParentActor.send).toHaveBeenCalledWith({
              type: "textStream.chunk",
              content: "Hello",
            });

            resolve();
          }
        }
      });

      // Start the actor
      actor.start();
    });
  });

  it("should handle stream with multiple chunks", () => {
    // Create a response with more chunks
    const customChunks = [
      "First",
      " chunk",
      ", second",
      " chunk",
      ", third",
      " chunk",
    ];
    const customStreamResponse = createMockStreamResponse(customChunks);

    const actor = createActor(consumeStreamActor, {
      input: {
        streamResponse: customStreamResponse as unknown as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Set up done listener before starting the actor
    return new Promise<void>((resolve) => {
      // Listen for done event
      actor.subscribe((snapshot) => {
        if (snapshot.status === "done") {
          // Check that all chunks were sent to parent
          expect(mockParentActor.send).toHaveBeenCalledTimes(
            customChunks.length,
          );

          // Verify each chunk was sent
          for (const chunk of customChunks) {
            expect(mockParentActor.send).toHaveBeenCalledWith({
              type: "textStream.chunk",
              content: chunk,
            });
          }

          resolve();
        }
      });

      // Start the actor
      actor.start();
    });
  });

  it("should throw error when textStream is null", () => {
    // Create a response with null text stream
    const nullStreamResponse = {
      textStream: null,
      response: Promise.resolve({
        messages: [
          { id: "1", role: "assistant", content: "This should not be reached" },
        ],
      }),
    };

    const actor = createActor(consumeStreamActor, {
      input: {
        streamResponse: nullStreamResponse as unknown as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Set up error listener before starting the actor
    return new Promise<void>((resolve) => {
      // Listen for errors on the actor
      actor.subscribe({
        error: (error: unknown) => {
          const err = error as Error;
          expect(err.message).toBe("No text stream available in the response");
          resolve();
        },
      });

      // Start the actor, which should immediately throw
      actor.start();
    });
  });

  it("should handle errors in stream processing", () => {
    // Create a controlled error stream
    const { stream, triggerError } = createErrorStream();

    const errorStreamResponse = {
      textStream: stream,
      response: Promise.resolve({
        messages: [
          { id: "error", role: "assistant", content: "Error content" },
        ],
      }),
    };

    const actor = createActor(consumeStreamActor, {
      input: {
        streamResponse: errorStreamResponse as unknown as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Set up error listener before starting the actor
    return new Promise<void>((resolve) => {
      // Listen for errors on the actor
      actor.subscribe({
        error: (error: unknown) => {
          const err = error as Error;
          expect(err.message).toBe("Stream error");

          // Should have sent at least one chunk before error
          expect(mockParentActor.send).toHaveBeenCalledWith({
            type: "textStream.chunk",
            content: "This will be sent",
          });

          resolve();
        },
      });

      // Start the actor
      actor.start();

      // Trigger the error after a small delay to ensure the chunk is processed
      setTimeout(() => {
        triggerError();
      }, 10);
    });
  });
});
