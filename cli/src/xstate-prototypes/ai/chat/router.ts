import { generateObject, type Message } from "ai";
import { z } from "zod";
import { aiModelFactory, type FpModelProvider } from "../ai-model-factory";

const OPENAI_STRATEGY = {
  modelName: "gpt-4o-mini",
  modelProvider: "openai",
} as const;

const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-5-haiku-20241022",
  modelProvider: "anthropic",
} as const;

export type RouterResponse = {
  nextStep: "ask_follow_up_question" | "generate_implementation_plan";
  reasoning: string;
};

// TODO - Use different prompts for different model providers
const ROUTER_SYSTEM_PROMPT = `You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user has approached you with an idea for a software project.

Look at the conversation history and determine what we need to do next.

Either we have sufficient information to generate an implementation plan, or we need to ask the user a follow-up question.

Consider the user's intent, as well as the following:

- Do we have a clear idea of the domain of the project?
- Have we asked about user authentication yet? We should always ask about auth, just to be sure, unless it's obvious that the user doesn't need it.
- Do we have an idea of features like auth, email, realtime, etc?`;

// Schema remains the same
const RouterSchema = z.object({
  reasoning: z
    .string()
    .describe("A brief explanation of your reasoning for the classification."),
  nextStep: z.enum(["ask_follow_up_question", "generate_implementation_plan"]),
});

export async function routeRequest(
  apiKey: string,
  messages: Message[],
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<RouterResponse> {
  const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

  const { object: classification } = await generateObject({
    model,
    schema: RouterSchema,
    messages: messages,
    system: ROUTER_SYSTEM_PROMPT,
    abortSignal: signal,
  });

  return {
    nextStep: classification.nextStep,
    reasoning: classification.reasoning,
  };
}

function fromModelProvider(
  aiProvider: FpModelProvider,
  apiKey: string,
  aiGatewayUrl?: string,
) {
  switch (aiProvider) {
    case "openai":
      return aiModelFactory({
        apiKey,
        modelDetails: OPENAI_STRATEGY,
        aiGatewayUrl,
      });
    case "anthropic":
      return aiModelFactory({
        apiKey,
        modelDetails: ANTHROPIC_STRATEGY,
        aiGatewayUrl,
      });
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
