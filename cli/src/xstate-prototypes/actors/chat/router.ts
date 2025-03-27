import { streamText, type Message } from "ai";
import { setup, fromPromise, assign } from "xstate"
import { ollama } from "ollama-ai-provider";
import type { GeneratedPlan } from "@/agents/ideation-agent/generate-spec";

type RouterResponseType = "ask_follow_up_question" | "generate_implementation_plan"

interface ChatRouterMachineContext {
  messages: Message[];
  responseType?: RouterResponseType;
  response?: GeneratedPlan | ReadableStream;
}

type ChatRouterMachineOutput = ChatRouterMachineContext;

type RouterResponse = {
  nextStep: RouterResponseType;
  reasoning: string;
}

const routeRequestActor = fromPromise<RouterResponse, { messages: Message[] }>(
  async ({ input }) => {
    console.log("routing user input! i have this many messages:", input.messages.length)
    await new Promise(r => setTimeout(r, 2000));
    return { nextStep: "ask_follow_up_question", reasoning: "hardcoded" }
  }
)

function askOllama(messages: Message[]) {
  const model = ollama('gemma3:4b');
  const response = streamText({
    model,
    system: "You are a goose, behave like a goose",
    messages
  })
  return response.textStream;
}

// This is tricky, we will need to stream the response
const askNextQuestionActor = fromPromise<ReadableStream, { messages: Message[] }>(
  async ({ input }) => {
    console.log("--> asking next question!")
    await new Promise(r => setTimeout(r, 2000));
    // TODO - Mocking a text stream might be nicer?
    return askOllama(input.messages)
  }
)

const generatePlanActor = fromPromise<GeneratedPlan, { messages: Message[] }>(async () => {
  console.log("--> generating the plan!")
  await new Promise(r => setTimeout(r, 5000));
  return {
    title: "Hi",
    plan: "# This is a plan\nnvm wait i got lost",
  }
});



/**
 * Machine that routes the user's input and executes the step indicated by the router
 * Either asks follow up question, or generates the spec
 */
const routerMachine = setup({
  types: {
    context: {} as ChatRouterMachineContext,
    input: {} as { messages: Message[] },
    events: {} as
      | { type: 'userResponse'; messages: Message[]; },
    output: {} as ChatRouterMachineOutput
  },
  actors: {
    routeRequest: routeRequestActor,
    askNextQuestion: askNextQuestionActor,
    generatePlan: generatePlanActor,
  },
  guards: {
    shouldAskFollowUp: (_context, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "ask_follow_up_question";
    },
    shouldGeneratePlan: (_context, routerResponse: RouterResponse) => {
      return routerResponse.nextStep === "generate_implementation_plan";
    }
  },
}).createMachine({
  id: "chat-message-agent",
  initial: "routing",
  // Initialize 
  context: ({ input }) => ({
    messages: input.messages,
  }),
  states: {
    routing: {
      invoke: {
        src: 'routeRequest',
        input: ({ context }) => ({ messages: context.messages }),
        onDone: [
          {
            // Transition to asking a follow up question depending on the router actor's response
            //
            // NOTE - This does not give a type error even if you remove the corresponding state
            // TODO - Look up if we can cause type errors for targeting undefined states!
            target: 'followingUp',
            guard: {
              type: 'shouldAskFollowUp',
              params: ({ event }) => event.output
            },
          },
          {
            target: 'generatingPlan',
            guard: {
              type: 'shouldGeneratePlan',
              params: ({ event }) => event.output
            }
          }
        ],
      }
    },
    followingUp: {
      invoke: {
        src: 'askNextQuestion',
        input: ({ context }) => ({ messages: context.messages }),
        // TODO - handle stream?
        onDone: {
          target: 'done',
          actions: assign({
            response: (({ event }) => event.output)
          })
        }
      }
    },
    generatingPlan: {
      invoke: {
        src: 'generatePlan',
        input: ({ context }) => ({ messages: context.messages }),
        onDone: {
          target: 'done',
          actions: assign({
            response: (({ event }) => event.output)
          })
        }
      }
    },
    done: {
      type: 'final',
    },
  },
  output: ({ context }) => context,
})

/**
 * Machine that routes the user's input and executes the step indicated by the router
 * Either asks follow up question, or generates the spec
 */
export { routerMachine };