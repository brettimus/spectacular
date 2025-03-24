import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
const IMPLEMENTATION_PLAN_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform a software specification to implement a software project.

The user has approached you with an idea for a software project.

You have already asked the user a series of questions to develop a thorough, step-by-step spec for this idea.

Now, you need to generate an implementation plan for the user's idea.

The implementation plan should read like a handoff document for a developer.

It should be detailed and include all the information needed to implement the project.

Unless otherwise specified, make the following technology choices are already made:

- Hono - A lightweight TypeScript API framework with syntax similar to Express.js
- Cloudflare Workers - Edge runtime platform from Cloudflare

If we need a relational database, specify:

- Cloudflare D1 - Serverless sqlite edge database from Cloudflare
- Drizzle - Type-safe SQL query builder and ORM, used to define database schema and craft queries

If we need authentication, specify Clerk.

If we need email, suggest Resend.

If we need blob storage, suggest Cloudflare R2.

If we need realtime updates, suggest Cloudflare Durable Objects.

This is important to my career.
`;

export async function generateImplementationPlan(ctx: Context) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });

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
