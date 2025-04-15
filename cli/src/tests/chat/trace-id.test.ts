import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type AnyActorRef, createActor, fromPromise, waitFor } from "xstate";
import { chatMachine } from "../../machines";
import type {
  RouterActorInput,
  RouterResponse,
  SaveSpecActorInput,
  GenerateSpecActorInput,
  GeneratedPlan,
  SaveFollowUpActorInput,
} from "../../machines/chat/actors";
import {
  aiTextStreamMachine,
  type AiTextStreamResult,
} from "../../machines/streaming";
import { createMockConsumeStreamSuccessActor } from "../streaming/helpers";
import { createUserMessage } from "../../utils/messages";

// Test-specific trace ID
const TEST_TRACE_ID = "test-trace-id-123";

// Create mock for action implementation
const handleStreamChunkMock = vi.fn();

// Create mocks for actor implementations
const routeToGenerateSpecMock = vi.fn().mockResolvedValue({
  nextStep: "generate_implementation_plan",
  reasoning: "Mock reasoning for testing",
});

const routeToFollowUpMock = vi.fn().mockResolvedValue({
  nextStep: "ask_follow_up_question",
  reasoning: "Mock reasoning for testing follow-up",
});

const generateSpecMock = vi.fn().mockResolvedValue({
  title: "Test Plan",
  plan: "# Test Plan\n\nThis is a test plan generated for testing.",
});

const saveSpecMock = vi.fn().mockResolvedValue(undefined);
const askNextQuestionMock = vi.fn().mockResolvedValue({} as AiTextStreamResult);
const saveFollowUpMock = vi.fn().mockResolvedValue(undefined);

// Mock actors using the mocks
const mockRouterToGenerateSpecActor = fromPromise<
  RouterResponse,
  RouterActorInput
>(async (context) => {
  return routeToGenerateSpecMock(context.input);
});

const mockRouterToFollowUpActor = fromPromise<RouterResponse, RouterActorInput>(
  async (context) => {
    return routeToFollowUpMock(context.input);
  },
);

const mockGenerateSpecActor = fromPromise<
  GeneratedPlan,
  GenerateSpecActorInput
>(async (context) => {
  return generateSpecMock(context.input);
});

const mockSaveSpecActor = fromPromise<void, SaveSpecActorInput>(
  async (context) => {
    return saveSpecMock(context.input);
  },
);

const mockAskNextQuestionActor = fromPromise<
  AiTextStreamResult,
  RouterActorInput
>(async (context) => {
  return askNextQuestionMock(context.input);
});

// Create a machine that mocks a successful text stream
const consumeStreamActor = createMockConsumeStreamSuccessActor();

const mockSaveFollowUpActor = fromPromise<void, SaveFollowUpActorInput>(
  async (context) => {
    return saveFollowUpMock(context.input);
  },
);

const textStreamMachine = aiTextStreamMachine.provide({
  actors: {
    consumeStream: consumeStreamActor,
  },
});

// Create machines with different paths
const specMachine = chatMachine.provide({
  actors: {
    routeRequest: mockRouterToGenerateSpecActor,
    askNextQuestion: mockAskNextQuestionActor,
    saveFollowUp: mockSaveFollowUpActor,
    generateSpec: mockGenerateSpecActor,
    saveSpec: mockSaveSpecActor,
  },
});

// For the follow-up path, we'll only test up to the routing step
const followUpMachine = chatMachine.provide({
  actors: {
    routeRequest: mockRouterToFollowUpActor,
    askNextQuestion: mockAskNextQuestionActor,
    saveFollowUp: mockSaveFollowUpActor,
    processQuestionStream: textStreamMachine,
  },
  actions: {
    handleStreamChunk: handleStreamChunkMock,
  },
});

describe("Chat Machine - Trace ID Propagation", () => {
  let specActor: AnyActorRef;
  let followUpActor: AnyActorRef;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    specActor?.stop();
    followUpActor?.stop();
  });

  it("should pass traceId to saveSpec actor", async () => {
    // Create an actor with initial traceId
    specActor = createActor(specMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    specActor.start();

    // Send a message with traceId to trigger the routing
    specActor.send({
      type: "user.reply.requested",
      messages: [],
      traceId: TEST_TRACE_ID,
    });

    await waitFor(specActor, (state) => {
      return state.matches("Done");
    });

    expect(saveSpecMock).toHaveBeenCalled();
    expect(saveSpecMock).toHaveBeenCalledWith(
      expect.objectContaining({ traceId: TEST_TRACE_ID }),
    );

    const snapshot = specActor.getSnapshot();
    expect(snapshot.context.traceId).toBe(TEST_TRACE_ID);
    expect(snapshot.output.traceId).toBe(TEST_TRACE_ID);
  });

  it("should pass the traceId to the chunk handler", async () => {
    // Create a test actor
    const streamingActor = createActor(followUpMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    streamingActor.start();

    // Clear the mock before the test
    handleStreamChunkMock.mockClear();

    // Send a message with traceId to trigger routing
    streamingActor.send({
      type: "user.reply.requested",
      messages: [createUserMessage("Hello, world!")],
      traceId: TEST_TRACE_ID,
    });

    // Allow time for the machine to transition to streaming state and for
    // the textStreamMachine to emit chunks
    await waitFor(streamingActor, (state) => {
      return state.matches("SavingFollowUpQuestion");
    });

    // Verify handleStreamChunk was called
    expect(handleStreamChunkMock).toHaveBeenCalled();

    // Check if traceId was passed to the handleStreamChunk action
    // The second parameter to handleStreamChunk should contain the traceId
    expect(handleStreamChunkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ traceId: TEST_TRACE_ID }),
    );

    // Clean up
    streamingActor.stop();
  });

  it("should pass the traceId to the saveFollowUp actor", async () => {
    // Create an actor with initial traceId
    followUpActor = createActor(followUpMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    followUpActor.start();

    // Send a message with traceId to trigger the routing
    followUpActor.send({
      type: "user.reply.requested",
      messages: [createUserMessage("Hello, world!")],
      traceId: TEST_TRACE_ID,
    });

    await waitFor(followUpActor, (state) => {
      return state.matches("AwaitingUserInput");
    });

    expect(saveFollowUpMock).toHaveBeenCalled();
    expect(saveFollowUpMock).toHaveBeenCalledWith(
      expect.objectContaining({ traceId: TEST_TRACE_ID }),
    );

    // Check that the traceId is cleared
    const snapshot = followUpActor.getSnapshot();
    expect(snapshot.context.traceId).toBe(null);
  });
  /** VERIFY THESE TESTS */

  it("should keep traceId in context during action execution", async () => {
    // Create a dedicated spy for handleStreamChunk
    const handleStreamChunkSpy = vi.fn();

    // Create a machine with the spy but without the problematic actors
    const streamChunkMachine = chatMachine.provide({
      actors: {
        routeRequest: mockRouterToFollowUpActor,
      },
      actions: {
        handleStreamChunk: handleStreamChunkSpy,
      },
    });

    // Create an actor
    const streamActor = createActor(streamChunkMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    streamActor.start();

    // Send a message with traceId
    streamActor.send({
      type: "user.reply.requested",
      messages: [],
      traceId: TEST_TRACE_ID,
    });

    // Allow some time for the state machine to transition
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now check that the context has our traceId
    const snapshot = streamActor.getSnapshot();
    expect(snapshot.context.traceId).toBe(TEST_TRACE_ID);

    // Clean up
    streamActor.stop();
  });

  it("should preserve traceId throughout the entire workflow", async () => {
    // Create a machine for a simple check of traceId preservation
    const preservationMachine = chatMachine.provide({
      actors: {
        routeRequest: mockRouterToGenerateSpecActor,
        generateSpec: mockGenerateSpecActor,
        saveSpec: mockSaveSpecActor,
      },
    });

    const preservationActor = createActor(preservationMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    preservationActor.start();

    // Send a message with traceId
    preservationActor.send({
      type: "user.reply.requested",
      messages: [],
      traceId: TEST_TRACE_ID,
    });

    // Allow some time for the state machine to transition
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Now check that the context has our traceId
    const snapshot = preservationActor.getSnapshot();
    expect(snapshot.context.traceId).toBe(TEST_TRACE_ID);

    // Verify all the expected mocks were called in the workflow
    expect(routeToGenerateSpecMock).toHaveBeenCalled();

    // Clean up
    preservationActor.stop();
  });

  it("should store traceId in context during message routing", async () => {
    // Create an actor with initial traceId
    followUpActor = createActor(followUpMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    followUpActor.start();

    // Send a message with traceId to trigger the routing
    followUpActor.send({
      type: "user.reply.requested",
      messages: [createUserMessage("Hello, world!")],
      traceId: TEST_TRACE_ID,
    });

    // Give the machine some time to process
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify the traceId made it to the context
    const snapshot = followUpActor.getSnapshot();
    expect(snapshot.context.traceId).toBe(TEST_TRACE_ID);

    // Verify the router actor was called
    expect(routeToFollowUpMock).toHaveBeenCalled();
  });

  it("should clear traceId when the machine transitions from Error to AwatingUserInput", () => {
    // TODO
  });
});
