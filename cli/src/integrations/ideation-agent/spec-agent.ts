import type { Context } from "@/context";
import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";

export async function routerAgent(ctx: Context) {
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
    system: `
    You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

    The user has approached you with an idea for a software project.

    Look at the conversation history and determine what we need to do next.

    Either we have sufficient information to generate an implementation plan, or we need to ask the user a follow-up question.

    Consider the user's intent, as well as the following checklist:

    - Do we have a clear idea of the domain of the project?
    - Do we have an idea of features like auth, email, etc?
    `,
  });

  return {
    nextStep: classification.nextStep,
  };
}

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
export const IDEATING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

You only develop data APIs. YOU DO NOT DEVELOP UI.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Be sure to determine if the project needs:

- User Authentication
- Email
- Relational Database
- File Storage

Remember, only one question at a time.

Here's the idea:
`;

export async function askFollowUpQuestion(ctx: Context) {
  return streamText({
    model: openai("gpt-4o"),
    system: IDEATING_SYSTEM_PROMPT,
    messages: ctx.messages,
  });
}

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
export const IMPLEMENTATION_PLAN_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform a software specification to implement a software project.

The user has approached you with an idea for a software project.

You have already asked the user a series of questions to develop a thorough, step-by-step spec for this idea.

Now, you need to generate an implementation plan for the user's idea.

The implementation plan should read like a handoff document for a developer.

It should be detailed and include all the information needed to implement the project.

Certain technology choices are already made:

- Hono for the API
- Cloudflare Workers for the runtime

This is important to my career.
`;

export async function generateImplementationPlan(ctx: Context) {
  return generateObject({
    model: openai("o3-mini"),
    system: IMPLEMENTATION_PLAN_SYSTEM_PROMPT,
    messages: ctx.messages,
    mode: "json",
    schema: z.object({
      title: z.string().describe("A title for the project."),
      plan: z
        .string()
        .describe(
          "A detailed implementation plan / handoff document for a developer to implement the project (in markdown).",
        ),
    }),
  });
}
