import { appendResponseMessages, type Message } from "ai";
import { setup, assign } from "xstate";
import { createUserMessage } from "@/agents/utils";

import { routeRequestActor } from "./actors/router";
import type { RouterResponse } from "./types";
import { generateSpecActor } from "./actors/generate-spec";
import { askNextQuestionActor } from "./actors/next-question";
import { savePlanToDiskActor } from "./actors/save-plan-to-disk";
import { aiTextStreamMachine } from "../streaming/ai-text-stream-machine";
import { pathFromInput } from "@/utils/utils";
import type {
  QuestionTextStreamResult,
  ResponseMessage,
} from "../streaming/types";

interface ChatMachineInput {
  apiKey: string;
  cwd: string;
}

export interface ChatMachineContext {
  apiKey: string;
  messages: Message[];
  cwd: string;
  spec: string | null;
  projectDir: string | null;
  specLocation: string | null;
  title: string;
  streamResponse: QuestionTextStreamResult | null;
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
    generatePlan: generateSpecActor,
    savePlan: savePlanToDiskActor,
    processQuestionStream: aiTextStreamMachine,
  },
  guards: {
    shouldAskFollowUp: (_context, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "ask_follow_up_question";
    },
    shouldGeneratePlan: (_context, routerResponse: RouterResponse) => {
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
    updateMessagesWithQuestionResponse: assign({
      messages: (
        { context },
        params: { responseMessages: ResponseMessage[] },
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
  initial: "Idle",
  context: ({ input }) => ({
    apiKey: input.apiKey,
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
    Idle: {
      on: {
        "user.message": {
          // Transition to "responding"
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
          apiKey: context.apiKey,
          messages: context.messages,
        }),
        onDone: [
          {
            // Transition to asking a follow up question depending on the router actor's response
            //
            // NOTE - This does not give a type error even if you remove the corresponding state
            // TODO - Look up if we can cause type errors for targeting undefined states!
            target: "FollowingUp",
            guard: {
              type: "shouldAskFollowUp",
              params: ({ event }) => event.output,
            },
          },
          {
            target: "GeneratingPlan",
            guard: {
              type: "shouldGeneratePlan",
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
          apiKey: context.apiKey,
          messages: context.messages,
        }),
        onDone: {
          target: "YieldingQuestionStream",
          // TODO - Refactor to use dynamic params
          // params: ({ event }) => ({
          //   streamResponse: event.output,
          // }),
          actions: assign({
            streamResponse: ({ event }) => event.output,
          }),
        },
      },
    },
    YieldingQuestionStream: {
      invoke: {
        id: "process-question-stream",
        src: "processQuestionStream",
        input: ({ context }) => ({
          // HACK - It's hard to strongly type this stuff without adding a lot of complexity
          streamResponse: context.streamResponse as QuestionTextStreamResult,
        }),
        onDone: {
          target: "Idle",
          actions: [
            {
              type: "updateMessagesWithQuestionResponse",
              params: ({ event }) => {
                return {
                  responseMessages: event.output.responseMessages,
                };
              },
            },
          ],
        },
      },
    },
    GeneratingPlan: {
      invoke: {
        id: "generate-plan",
        src: "generatePlan",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          messages: context.messages,
        }),
        onDone: {
          actions: [
            assign({
              spec: ({ event }) => event.output.plan,
              title: ({ event }) => event.output.title,
            }),
          ],
          target: "SavingPlan",
        },
      },
    },
    SavingPlan: {
      invoke: {
        id: "save-plan",
        src: "savePlan",
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
