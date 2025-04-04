import { appendResponseMessages, type Message } from "ai";
import { setup, assign } from "xstate";
import {
  generateSpecActor,
  askNextQuestionActor,
  saveSpecToDiskActor,
  routeRequestActor,
  type RouterResponse,
} from "./actors";
import {
  aiTextStreamMachine,
  type AiTextStreamResult,
  type AiResponseMessage,
} from "../streaming";
import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "../../ai";
import { createUserMessage, pathFromInput } from "../../utils";

interface ChatMachineInput {
  apiKey: string;
  aiProvider?: FpModelProvider;
  aiGatewayUrl?: string;
  cwd: string;
}

export interface ChatMachineContext {
  aiConfig: FpAiConfig;
  messages: Message[];
  cwd: string;
  spec: string | null;
  projectDir: string | null;
  specLocation: string | null;
  title: string;
  streamResponse: AiTextStreamResult | null;
}

interface ChatMachineOutput {
  messages: Message[];
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
    events: {} as { type: "user.message"; prompt: string },
    output: {} as ChatMachineOutput,
  },
  actors: {
    routeRequest: routeRequestActor,
    askNextQuestion: askNextQuestionActor,
    generateSpec: generateSpecActor,
    saveSpec: saveSpecToDiskActor,
    processQuestionStream: aiTextStreamMachine,
  },
  guards: {
    shouldAskFollowUp: (_context, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "ask_follow_up_question";
    },
    shouldGenerateSpec: (_context, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "generate_implementation_plan";
    },
  },
  actions: {
    addUserMessage: assign({
      messages: ({ context }, params: { prompt: string }) => [
        ...context.messages,
        createUserMessage(params.prompt),
      ],
    }),
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
    messages: [],
    cwd: input.cwd,
    spec: null,
    specLocation: null,
    title: "spec.md",
    streamResponse: null,
    // TODO - set project dir
    projectDir: input.cwd,
  }),
  states: {
    AwaitingUserInput: {
      on: {
        "user.message": {
          description: "The user has sent a message to the chat agent",
          target: "Routing",
          // Update the internal messages state
          actions: {
            type: "addUserMessage",
            params: ({ event }) => {
              return {
                prompt: event.prompt,
              };
            },
          },
        },
      },
    },
    Routing: {
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
      },
    },
    FollowingUp: {
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
        // TODO - Add onError handler
      },
    },
    ProcessingAiResponse: {
      invoke: {
        id: "processQuestionStream",
        src: "processQuestionStream",
        input: ({ context }) => ({
          // HACK - It's hard to strongly type this stuff without adding a lot of complexity
          // TODO - Investigate if we can assert the type on `entry` somehow
          streamResponse: context.streamResponse as AiTextStreamResult,
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
          ],
        },
        // TODO - Add onError handler
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
      },
    },
    Done: {
      type: "final",
    },
  },
  output: ({ context }) => ({
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
