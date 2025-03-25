import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const IDEATION_AGENT_SYSTEM_PROMPT = `You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user has approached you with an idea for a software project.

Look at the conversation history and determine what we need to do next.

Either we have sufficient information to generate an implementation plan, or we need to ask the user a follow-up question.

Consider the user's intent, as well as the following:

- Do we have a clear idea of the domain of the project?
- Have we asked about user authentication yet? We should always ask about auth, just to be sure, unless it's obvious that the user doesn't need it.
- Do we have an idea of features like auth, email, realtime, etc?`;

export async function routerAgent(ctx: Context) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o-mini");

  // First step: Classify the query type
  const { object: classification } = await generateObject({
    model,
    schema: z.object({
      reasoning: z
        .string()
        .describe(
          "A brief explanation of your reasoning for the classification.",
        ),
      nextStep: z.enum([
        "ask_follow_up_question",
        "generate_implementation_plan",
      ]),
    }),
    messages: ctx.messages,
    system: IDEATION_AGENT_SYSTEM_PROMPT,
  });

  return {
    nextStep: classification.nextStep,
  };
}
