import { appendResponseMessages, type Message } from "ai";
import { setup, assign } from "xstate";
import { createUserMessage } from "@/agents/utils";

import { routeRequestActor } from "./router";
import type { RouterResponse, QuestionTextStreamResult } from "./types";
import { generatePlanActor } from "./actors/generate-plan";
import { askNextQuestionActor } from "./actors/next-question";
import { savePlanToDiskActor } from "./actors/save-plan-to-disk";
import { pathFromInput } from "@/utils/utils";
import { textStreamMachine } from "./streaming/text-stream-machine";
import { withLogging } from "../utils/with-logging";
import type { ResponseMessage } from "./streaming/types";

interface ChatMachineInput {
  cwd: string;
}

interface ChatMachineContext {
  messages: Message[];
  cwd: string;
  spec: string | null;
  specLocation: string | null;
  title: string;
  streamResponse: QuestionTextStreamResult | null;
}

const chatMachine = setup({
  types: {
    context: {} as ChatMachineContext,
    input: {} as ChatMachineInput,
    events: {} as { type: "promptReceived"; prompt: string },
  },
  actors: {
    routeRequest: routeRequestActor,
    nextQuestion: askNextQuestionActor,
    generatePlan: generatePlanActor,
    savePlanToDisk: savePlanToDiskActor,
    processQuestionStream: textStreamMachine,
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
    logProcessQuestionStreamDone: () => {
      console.log("Process question stream done");
    },
    updateMessagesWithQuestionResponse: assign({
      messages: (
        { context },
        params: { responseMessages: ResponseMessage[] },
      ) =>
        appendResponseMessages({
          messages: context.messages,
          responseMessages: params.responseMessages,
        }),
      streamResponse: null, // Clear the streaming response
    }),
  },
}).createMachine({
  id: "ideation-agent",
  initial: "idle",
  context: ({ input }) => ({
    messages: [],
    cwd: input.cwd,
    spec: null,
    specLocation: null,
    title: "spec.md",
    streamResponse: null,
  }),
  states: {
    idle: {
      on: {
        promptReceived: {
          // Transition to "responding"
          target: "routing",
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
    routing: {
      invoke: {
        id: "routing",
        src: "routeRequest",
        input: ({ context }) => ({ messages: context.messages }),
        onDone: [
          {
            // Transition to asking a follow up question depending on the router actor's response
            //
            // NOTE - This does not give a type error even if you remove the corresponding state
            // TODO - Look up if we can cause type errors for targeting undefined states!
            target: "followingUp",
            guard: {
              type: "shouldAskFollowUp",
              params: ({ event }) => event.output,
            },
          },
          {
            target: "generatingPlan",
            guard: {
              type: "shouldGeneratePlan",
              params: ({ event }) => event.output,
            },
          },
        ],
      },
    },
    followingUp: {
      invoke: {
        id: "following-up",
        src: "nextQuestion",
        input: ({ context }) => ({ messages: context.messages }),
        onDone: {
          target: "yieldingQuestionStream",
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
    yieldingQuestionStream: {
      invoke: {
        id: "process-question-stream",
        src: "processQuestionStream",
        input: ({ context }) => ({
          // HACK - It's hard to strongly type this stuff without adding a lot of complexity
          streamResponse: context.streamResponse as QuestionTextStreamResult,
        }),
        onDone: {
          target: "idle",
          actions: [
            { type: "logProcessQuestionStreamDone" },
            {
              type: "updateMessagesWithQuestionResponse",
              params: ({ event }) => {
                console.log("--> event that triggered updateMessagesWithQuestionResponse:", event);
                return ({
                  responseMessages: event.output.responseMessages,
                })
              },
            },
          ],
        },
      },
      // TODO - Implement this by consuming the streaming response, progressively updating
    },
    generatingPlan: {
      invoke: {
        id: "generate-plan",
        src: "generatePlan",
        input: ({ context }) => ({ messages: context.messages }),
        onDone: {
          actions: [
            assign({
              spec: ({ event }) => event.output.plan,
              title: ({ event }) => event.output.title,
            }),
          ],
          target: "savingPlan",
        },
      },
    },
    savingPlan: {
      invoke: {
        id: "save-plan-to-disk",
        src: "savePlanToDisk",
        input: ({ context, event }) => {
          console.log("--> event that triggered saving plan to disk:", event);

          return {
            // HACK - We can't strongly type the `plan` here without adding
            //        a lot of complexity to the onDone handler of the
            //        savePlanToDisk actor
            spec: context.spec ?? "",
            specLocation: pathFromInput(context.title, context.cwd),
          }
        },
        onDone: {
          target: "done",
          actions: assign({
            specLocation: ({ context }) =>
              pathFromInput(context.title, context.cwd),
          }),
        },
      },
    },
    done: {
      type: "final",
    },
  },
});

export { chatMachine };
