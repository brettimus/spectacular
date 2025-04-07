// This should be a version of the chat machine that assets the spec generation actor is called
// when the router says it is time to generate the spec

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createActor, type AnyActorRef, fromPromise } from "xstate";
import { chatMachine } from "@/xstate-prototypes/machines";
import type {
  RouterResponse,
  RouterActorInput,
  SaveSpecActorInput,
  GenerateSpecActorInput,
  GeneratedPlan,
} from "@/xstate-prototypes/machines/chat";

// Router actor that always routes to generating implementation plan
const mockRouterToGenerateSpecActor = fromPromise<
  RouterResponse,
  RouterActorInput
>(async () => {
  return {
    nextStep: "generate_implementation_plan",
    reasoning: "Mock reasoning for testing",
  };
});

// Generate spec actor that succeeds
const mockGenerateSpecSuccessActor = fromPromise<
  GeneratedPlan,
  GenerateSpecActorInput
>(async () => {
  return {
    title: "Test Plan",
    plan: "# Test Plan\n\nThis is a test plan generated for testing.",
  };
});

// Generate spec actor that fails
const mockGenerateSpecFailureActor = fromPromise<
  GeneratedPlan,
  GenerateSpecActorInput
>(async () => {
  throw new Error("Failed to generate spec");
});

// Save spec actor that does nothing
const mockSaveSpecActor = fromPromise<void, SaveSpecActorInput>(async () => {
  // No-op implementation
});

// Create a machine that routes to generating a spec
const generateSpecMachine = chatMachine.provide({
  actors: {
    routeRequest: mockRouterToGenerateSpecActor,
    generateSpec: mockGenerateSpecSuccessActor,
    saveSpec: mockSaveSpecActor,
  },
});

// Create a machine that fails when generating a spec
const generateSpecFailMachine = chatMachine.provide({
  actors: {
    routeRequest: mockRouterToGenerateSpecActor,
    generateSpec: mockGenerateSpecFailureActor,
    saveSpec: mockSaveSpecActor,
  },
});

describe("Chat Machine - Generate Spec", () => {
  let generateSpecActor: AnyActorRef;
  let generateSpecFailActor: AnyActorRef;

  beforeEach(() => {
    // HACK - Spy on console.error to check for errors
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    generateSpecActor?.stop();
    generateSpecFailActor?.stop();
  });

  it("should route to generating spec and complete successfully", async () => {
    // Create an actor from the machine
    generateSpecActor = createActor(generateSpecMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    generateSpecActor.start();

    // Send a message to trigger the routing
    generateSpecActor.send({
      type: "user.message",
      content: "Create a spec for my project",
    });

    // Wait for the machine to reach the Done state (use a helper to avoid race conditions)
    return new Promise<void>((resolve) => {
      const subscription = generateSpecActor.subscribe((snapshot) => {
        if (snapshot.matches("Done")) {
          expect(snapshot.context.spec).toBeTruthy();
          expect(snapshot.context.title).toBe("Test Plan");
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  });

  it("should handle errors when generate spec fails", async () => {
    // Create an actor from the machine that fails during spec generation
    generateSpecFailActor = createActor(generateSpecFailMachine, {
      input: {
        apiKey: "test-api-key",
      },
    });

    // Start the actor
    generateSpecFailActor.start();

    // Send a message to trigger the routing
    generateSpecFailActor.send({
      type: "user.message",
      content: "Create a spec for my project",
    });

    // Wait for the machine to reach the Error state
    return new Promise<void>((resolve) => {
      const subscription = generateSpecFailActor.subscribe((snapshot) => {
        if (snapshot.matches("Error")) {
          expect(snapshot.context.error).toBeDefined();
          expect(snapshot.context.errorHistory).toHaveLength(1);
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  });
});
