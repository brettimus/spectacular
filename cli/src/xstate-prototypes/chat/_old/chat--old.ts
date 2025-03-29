import type { Message } from "ai";
import { setup, assign } from "xstate";
import { createUserMessage } from "@/agents/utils";

import { routerMachine } from "./router";

interface ChatMachineContext {
  messages: Message[];
}

const chatMachine = setup({
  types: {
    context: {} as ChatMachineContext,
    events: {} as { type: "promptReceived"; prompt: string },
  },
  actors: {
    handleUserInput: routerMachine,
  },
}).createMachine({
  id: "ideation-agent",
  initial: "idle",
  context: {
    messages: [],
  },
  states: {
    idle: {
      on: {
        promptReceived: {
          // Transition to "responding"
          target: "responding",
          // Update the internal messages state
          actions: assign({
            messages: ({ event, context }) => [
              ...context.messages,
              createUserMessage(event.prompt),
            ],
          }),
        },
      },
    },
    responding: {
      // SOOOO I think we'll want to spawn an actor here
      //   And keep a ref to it on context?,
      //   then the actor can pass messages back to the parent
      //   which the parent could use to indicate "hey it's loading time"
      //
      //
      invoke: {
        src: "handleUserInput",
        input: ({ context }) => ({ messages: context.messages }),
        onDone: {
          // TODO - Provide...
        },
      },
    },
  },
});

export { chatMachine };
