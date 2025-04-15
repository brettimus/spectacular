import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type AnyActorRef, createActor } from "xstate";
import { aiTextStreamMachine } from "../../machines/streaming/ai-text-stream-machine";
import type { AiTextStreamResult } from "../../machines/streaming/types";
import {
  type MockStreamResponse,
  createMockConsumeStreamFailureActor,
  createMockConsumeStreamSuccessActor,
  createMockParentActor,
  createMockStreamResponse,
} from "./helpers";

describe("AI Text Stream Machine", () => {
  let mockParentActor: AnyActorRef;
  let streamSuccessActor: AnyActorRef;
  let streamFailureActor: AnyActorRef;
  let mockStreamResponse: MockStreamResponse;

  beforeEach(() => {
    // Create a mock parent actor to receive events
    mockParentActor = createMockParentActor();

    // Spy on the parent's send method
    vi.spyOn(mockParentActor, "send");

    // Create a mock stream response
    mockStreamResponse = createMockStreamResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockParentActor.stop();
    streamSuccessActor?.stop();
    streamFailureActor?.stop();
  });

  it("should process text stream successfully", async () => {
    const successActor = createMockConsumeStreamSuccessActor();

    // Create a machine that uses the mock success actor
    const successMachine = aiTextStreamMachine.provide({
      actors: {
        consumeStream: successActor,
      },
    });

    // Create an actor from the success machine
    streamSuccessActor = createActor(successMachine, {
      input: {
        streamResponse: mockStreamResponse as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Start the actor
    streamSuccessActor.start();

    // Wait for the machine to reach the Complete state
    return new Promise<void>((resolve) => {
      const subscription = streamSuccessActor.subscribe((snapshot) => {
        if (snapshot.matches("Complete")) {
          // Check that chunks were appended to context
          expect(snapshot.context.chunks).toEqual([
            "Hello",
            ", ",
            "world",
            "!",
          ]);

          // Check that response messages were set
          expect(snapshot.context.responseMessages).toEqual([
            { id: "1", role: "assistant", content: "Hello, world!" },
          ]);

          // Check that parent received chunk events
          expect(mockParentActor.send).toHaveBeenCalledTimes(4);
          expect(mockParentActor.send).toHaveBeenCalledWith({
            type: "textStream.chunk",
            content: "Hello",
          });

          subscription.unsubscribe();
          resolve();
        }
      });
    });
  });

  it("should handle errors when stream processing fails", async () => {
    const failureActor = createMockConsumeStreamFailureActor();

    // Create a machine that uses the mock failure actor
    const failureMachine = aiTextStreamMachine.provide({
      actors: {
        consumeStream: failureActor,
      },
    });

    // Create an actor from the failure machine
    streamFailureActor = createActor(failureMachine, {
      input: {
        streamResponse: mockStreamResponse as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    // Start the actor
    streamFailureActor.start();

    // Wait for the machine to reach the Failed state
    return new Promise<void>((resolve) => {
      const subscription = streamFailureActor.subscribe((snapshot) => {
        if (snapshot.matches("Failed")) {
          // Check that error was captured
          expect(snapshot.context.error).toBeDefined();
          expect(snapshot.context.error?.message).toBe(
            "Stream processing failed",
          );

          // Check that we still got at least one chunk
          expect(snapshot.context.chunks).toEqual(["Hello"]);

          // Check that parent received at least one chunk event
          expect(mockParentActor.send).toHaveBeenCalledWith({
            type: "textStream.chunk",
            content: "Hello",
          });

          subscription.unsubscribe();
          resolve();
        }
      });
    });
  });

  it("should forward chunk events to parent actor", async () => {
    // Test with custom chunks
    const customChunks = ["First", " part", " of", " message"];
    const successActor = createMockConsumeStreamSuccessActor(customChunks);

    const testMachine = aiTextStreamMachine.provide({
      actors: {
        consumeStream: successActor,
      },
    });

    const testActor = createActor(testMachine, {
      input: {
        streamResponse: mockStreamResponse as AiTextStreamResult,
        parent: mockParentActor,
      },
    });

    testActor.start();

    return new Promise<void>((resolve) => {
      const subscription = testActor.subscribe((snapshot) => {
        if (snapshot.matches("Complete")) {
          // Check that all chunks were sent to parent
          expect(mockParentActor.send).toHaveBeenCalledTimes(4);

          // Check that chunks were appended in order
          expect(snapshot.context.chunks).toEqual(customChunks);

          for (const chunk of customChunks) {
            expect(mockParentActor.send).toHaveBeenCalledWith({
              type: "textStream.chunk",
              content: chunk,
            });
          }

          testActor.stop();
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  });
});
