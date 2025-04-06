import { type Message, appendResponseMessages } from "ai";
import { assign, setup } from "xstate";
import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "../../ai";
import { createUserMessage, pathFromInput } from "../../utils";
import {
  type AiResponseMessage,
  type AiTextStreamResult,
  aiTextStreamMachine,
} from "../streaming";
import type { ChunkEvent } from "../streaming";
import {
  type RouterResponse,
  askNextQuestionActor,
  generateSpecActor,
  routeRequestActor,
  saveSpecNoopActor,
} from "./actors";

interface ChatMachineInput {
  apiKey: string;
  aiProvider?: FpModelProvider;
  aiGatewayUrl?: string;
  cwd: string;
  messages?: Message[];
}

export interface ChatMachineContext {
  aiConfig: FpAiConfig;
  messages: Message[];
  error: unknown | null;
  errorHistory: unknown[];
  cwd: string;
  spec: string | null;
  projectDir: string | null;
  specLocation: string | null;
  title: string;
  streamResponse: AiTextStreamResult | null;
}

type ChatMachineEvent =
  | { type: "user.message"; content: string }
  | { type: "cancel" }
  | ChunkEvent;

interface ChatMachineOutput {
  messages: Message[];
  errorHistory: unknown[];
  cwd: string;
  spec: string | null;
  specLocation: string | null;
  title: string;
  projectDir: string;
}

const chatMachine = setup({
  types: {
    context: {} as ChatMachineContext,
    input: {} as ChatMachineInput,
    events: {} as ChatMachineEvent,
    output: {} as ChatMachineOutput,
  },
  actors: {
    routeRequest: routeRequestActor,
    askNextQuestion: askNextQuestionActor,
    generateSpec: generateSpecActor,
    saveSpec: saveSpecNoopActor,
    processQuestionStream: aiTextStreamMachine,
  },
  guards: {
    shouldAskFollowUp: (_, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "ask_follow_up_question";
    },
    shouldGenerateSpec: (_, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "generate_implementation_plan";
    },
  },
  actions: {
    addUserMessage: assign({
      messages: ({ context }, params: { content: string }) => [
        ...context.messages,
        createUserMessage(params.content),
      ],
    }),
    handleStreamChunk: (_, _params: { chunk: string }) => {
      // NOTE - `handleStreamChunk` is a noop by default,
      //         but it can be overridden with `.provide`
    },
    handleNewAssistantMessages: (
      _,
      _params: { responseMessages: AiResponseMessage[] },
    ) => {
      // NOTE - This is a noop by default, but it's a good place to add logic to handle new assistant messages via `.provide`
    },
    updateAssistantMessages: assign({
      messages: (
        { context },
        params: { responseMessages: AiResponseMessage[] },
      ) => {
        return appendResponseMessages({
          messages: context.messages,
          responseMessages: params.responseMessages,
        });
      },
      streamResponse: null, // Clear the raw streaming response
    }),
    recordError: assign({
      error: (_, event: { error: unknown }) => event.error,
      errorHistory: ({ context }, event: { error: unknown }) => [
        ...context.errorHistory,
        event.error,
      ],
    }),
    resetError: assign({
      error: () => null,
    }),
  },
}).createMachine({
  id: "ideation-agent",
  description:
    "A chat agent that ideates on a software project idea to produce a spec",
  initial: "AwaitingUserInput",
  context: ({ input }) => ({
    aiConfig: {
      apiKey: input.apiKey,
      aiProvider: input.aiProvider ?? DEFAULT_AI_PROVIDER,
      aiGatewayUrl: input.aiGatewayUrl,
    },
    messages: input.messages ?? [],
    error: null,
    errorHistory: [],
    cwd: input.cwd,
    spec: null,
    specLocation: null,
    title: "spec.md",
    streamResponse: null,
    projectDir: input.cwd,
  }),
  states: {
    AwaitingUserInput: {
      on: {
        "user.message": {
          description: "The user sends a message to the chat agent",
          target: "Routing",
          actions: [
            {
              type: "addUserMessage",
              params: ({ event }) => {
                return {
                  content: event.content,
                };
              },
            },
          ],
        },
      },
    },
    Routing: {
      on: {
        cancel: {
          target: "AwaitingUserInput",
        },
      },
      invoke: {
        id: "routeRequest",
        src: "routeRequest",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          messages: context.messages,
        }),
        onDone: [
          {
            // Transition to asking a follow up question depending on the router actor's response
            //
            // NOTE - This does not give a type error even if you remove the corresponding state
            // TODO - Look up if we can cause type errors for targeting not-defined states!
            target: "FollowingUp",
            guard: {
              type: "shouldAskFollowUp",
              params: ({ event }) => event.output,
            },
          },
          {
            // Transition to generating a spec depending on the router actor's response
            target: "GeneratingSpec",
            guard: {
              type: "shouldGenerateSpec",
              params: ({ event }) => event.output,
            },
          },
        ],
        onError: {
          target: "Error",
          actions: {
            type: "recordError",
            params: ({ event }) => ({ error: event.error }),
          },
        },
      },
    },
    FollowingUp: {
      on: {
        cancel: {
          target: "AwaitingUserInput",
        },
      },
      invoke: {
        id: "askNextQuestion",
        src: "askNextQuestion",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          messages: context.messages,
        }),
        onDone: {
          target: "ProcessingAiResponse",
          actions: assign({
            streamResponse: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "Error",
          actions: {
            type: "recordError",
            params: ({ event }) => ({ error: event.error }),
          },
        },
      },
    },
    ProcessingAiResponse: {
      on: {
        cancel: {
          target: "AwaitingUserInput",
          // TODO - Flush message somehow?
          actions: ({ self }) => {
            const processQuestionStream =
              self.getSnapshot().children.processQuestionStream;
            if (processQuestionStream) {
              const cancelledActorContext =
                processQuestionStream.getSnapshot().context;
              console.log("cancelledActorContext", cancelledActorContext);
            } else {
              console.log("no processQuestionStream upon cancellation");
            }
          },
        },
        "textStream.chunk": {
          actions: {
            type: "handleStreamChunk",
            params: ({ event }) => ({ chunk: event.content }),
          },
        },
      },
      invoke: {
        id: "processQuestionStream",
        src: "processQuestionStream",
        input: ({ context, self }) => ({
          // HACK - It's hard to strongly type this stuff without adding a lot of complexity
          // TODO - Investigate if we can assert the type on `entry` somehow
          // TODO - Try to remove this reference to the streamResponse, it's only useful for the CLI
          streamResponse: context.streamResponse as AiTextStreamResult,
          parent: self,
        }),
        onDone: {
          target: "AwaitingUserInput",
          actions: [
            {
              type: "updateAssistantMessages",
              params: ({ event }) => {
                return {
                  responseMessages: event.output.responseMessages,
                };
              },
            },
            {
              type: "handleNewAssistantMessages",
              params: ({ event }) => {
                return {
                  responseMessages: event.output.responseMessages,
                };
              },
            },
          ],
        },
        onError: {
          target: "Error",
          actions: {
            type: "recordError",
            params: ({ event }) => ({ error: event.error }),
          },
        },
      },
    },
    GeneratingSpec: {
      invoke: {
        id: "generateSpec",
        src: "generateSpec",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          messages: context.messages,
        }),
        onDone: {
          actions: [
            assign({
              spec: ({ event }) => event.output.plan,
              title: ({ event }) => event.output.title,
            }),
          ],
          target: "SavingSpec",
        },
        onError: {
          target: "Error",
          actions: {
            type: "recordError",
            params: ({ event }) => ({ error: event.error }),
          },
        },
      },
    },
    SavingSpec: {
      invoke: {
        id: "saveSpec",
        src: "saveSpec",
        input: ({ context }) => {
          return {
            // HACK - We can't strongly type the `plan` here without adding
            //        a lot of complexity to the onDone handler of the
            //        savePlan actor
            spec: context.spec ?? "",
            specLocation: pathFromInput(context.title, context.cwd),
          };
        },
        onDone: {
          target: "Done",
          actions: assign({
            specLocation: ({ context }) =>
              pathFromInput(context.title, context.cwd),
          }),
        },
        onError: {
          target: "Error",
          actions: {
            type: "recordError",
            params: ({ event }) => ({ error: event.error }),
          },
        },
      },
    },
    Done: {
      type: "final",
    },
    Error: {
      on: {
        "user.message": {
          target: "Routing",
          actions: [
            // Flush error state
            {
              type: "resetError",
            },
            {
              type: "addUserMessage",
              params: ({ event }) => {
                return {
                  content: event.content,
                };
              },
            },
          ],
        },
      },
    },
  },
  output: ({ context }) => ({
    errorHistory: context.errorHistory,
    spec: context.spec,
    specLocation: context.specLocation,
    messages: context.messages,
    cwd: context.cwd,
    // HACK - Default to emptystring
    // IMPROVEMENT - If missing necessary data, return a different output type
    projectDir: context.projectDir ?? "",
    title: context.title,
  }),
});

export { chatMachine };
