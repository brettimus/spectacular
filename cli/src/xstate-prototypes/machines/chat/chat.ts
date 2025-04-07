import { type Message, appendResponseMessages } from "ai";
import { assign, setup } from "xstate";
import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "../../ai";
import { createUserMessage } from "../../utils";
import {
  type AiResponseMessage,
  type AiTextStreamResult,
  aiTextStreamMachine,
} from "../streaming";
import type { ChunkEvent } from "../streaming";
import {
  type RouterResponse,
  askNextQuestionActor,
  saveFollowUpNoopActor,
  generateSpecActor,
  routeRequestActor,
  saveSpecNoopActor,
} from "./actors";
import { log } from "@/xstate-prototypes/utils/logging";

type SpecDetails = {
  title: string;
  filename: "spec.md";
  content: string;
};

type ChatMachineInput = {
  apiKey: string;
  aiProvider?: FpModelProvider;
  aiGatewayUrl?: string;
  messages?: Message[];
};

type ChatMachineOutput = {
  messages: Message[];
  errors: unknown[];
  spec: SpecDetails | null;
};

export interface ChatMachineContext {
  aiConfig: FpAiConfig;
  messages: Message[];
  followUpMessages: AiResponseMessage[] | null;
  error: unknown | null;
  errorHistory: unknown[];
  spec: SpecDetails | null;
  /** NOTE - This is only used to make it easier to consume the stream in the CLI */
  streamResponse: AiTextStreamResult | null;
}

type ChatMachineEvent =
  | { type: "user.message"; content: string }
  | { type: "cancel" }
  | ChunkEvent;

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
    saveFollowUp: saveFollowUpNoopActor,
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
      //         It's a way to stream responses
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
    logEmptyFollowUpMessagesWarning: ({ context }) => {
      if (!context.followUpMessages || !context.followUpMessages?.length) {
        log("warn", "Follow up messages is empty - nothing will be saved", {
          followUpMessages: context.followUpMessages,
        });
      }
    },
    updateFollowUpQuestionMessages: assign({
      followUpMessages: (_, params: AiResponseMessage[]) => params,
    }),
    clearFollowUpMessages: assign({
      followUpMessages: () => null,
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
    followUpMessages: null,
    error: null,
    errorHistory: [],
    spec: null,
    streamResponse: null,
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
            target: "InitializingFollowUpQuestion",
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
    InitializingFollowUpQuestion: {
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
          target: "StreamingFollowUpQuestion",
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
    StreamingFollowUpQuestion: {
      on: {
        cancel: {
          target: "AwaitingUserInput",
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
          target: "SavingFollowUpQuestion",
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
              type: "updateFollowUpQuestionMessages",
              params: ({ event }) => event.output.responseMessages,
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
    SavingFollowUpQuestion: {
      entry: [
        {
          type: "logEmptyFollowUpMessagesWarning",
        },
      ],
      invoke: {
        id: "saveFollowUp",
        src: "saveFollowUp",
        input: ({ context }) => {
          return {
            // HACK - Fallback to [], since strong typing is hard for this kind of state
            followUpMessages: context.followUpMessages ?? [],
          };
        },
        onDone: {
          target: "AwaitingUserInput",
          actions: "clearFollowUpMessages",
        },
        onError: {
          target: "Error",
          actions: [
            "clearFollowUpMessages",
            {
              type: "recordError",
              params: ({ event }) => ({ error: event.error }),
            },
          ],
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
              spec: ({ context, event }) => ({
                ...context.spec,
                filename: "spec.md",
                title: event.output.title,
                content: event.output.plan,
              }),
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
            // We can't strongly type the `spec` here without adding
            // a lot of complexity to the onDone handler of the `savePlan` actor
            content: context.spec?.content ?? "",
            filename: context.spec?.filename ?? "spec.md",
            title: context.spec?.title ?? "spec.md",
          };
        },
        onDone: {
          target: "Done",
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
    spec: context.spec,
    messages: context.messages,
    errors: context.errorHistory,
  }),
});

export { chatMachine };
