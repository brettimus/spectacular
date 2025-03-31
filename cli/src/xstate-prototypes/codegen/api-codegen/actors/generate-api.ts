import { type Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { ApiGenerationOptions, ApiGenerationResult } from "./types";

const TEMPLATE_EXAMPLE = `
import { instrument } from "@fiberplane/hono-otel";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "./db/schema";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/users", async (c) => {
  const db = drizzle(c.env.DB);
  const users = await db.select().from(schema.users);
  return c.json({ users });
});

app.post("/api/user", async (c) => {
  const db = drizzle(c.env.DB);
  const { name, email } = await c.req.json();

  await db.insert(schema.users).values({
    name: name,
    email: email,
  });
  return c.text(\`user: \${ name } inserted\`);
});

export default app;
`;

const getDrizzleOrmExamples = () => {
  return `
// Example of inserting a new record:
await db.insert(schema.users).values({
  name: "John Doe",
  email: "john@example.com",
});

// Example of selecting records:
const users = await db.select().from(schema.users);

// Example of selecting with a filter:
const user = await db.select()
  .from(schema.users)
  .where(eq(schema.users.id, userId));

// Example of updating a record:
await db.update(schema.users)
  .set({ name: "Jane Doe" })
  .where(eq(schema.users.id, userId));

// Example of deleting a record:
await db.delete(schema.users)
  .where(eq(schema.users.id, userId));
`;
};

const getCommonHonoMistakes = () => {
  return `
1. Don't use process.env, use c.env to access environment variables inside request handlers
2. Don't forget to add async/await for database operations
3. Don't include results of D1 queries with the .changed property, D1 queries don't have that
4. Remember to parse request bodies with await c.req.json()
5. Use proper error handling with try/catch blocks for database operations
6. Remember to return the response from each route handler
`;
};

export const generateApiActor = fromPromise<
  ApiGenerationResult,
  {
    context: Context;
    options: ApiGenerationOptions;
    spec: string;
  }
>(async ({ input, signal }) => {
  try {
    const { context, options, spec } = input;
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai("o3-mini"));

    const dbSchema = options.schema;
    const apiPlan =
      spec ||
      "Create a simple REST API with CRUD operations for all tables in the schema.";

    const PROMPT = `
You are a friendly, expert full-stack typescript engineer and an API building assistant for apps that use Hono,
a typescript web framework similar to express.

You are using the HONC stack:

- Hono for the API
- Cloudflare D1 for the relational database (sqlite)
- Drizzle ORM for the database query builder
- Cloudflare Workers for the deployment target (serverless v8 isolates)

I just created a new HONC project from a template,
and I am ready to start building an API for my idea.

I will give you the database schema I wrote,
and example of how to use Drizzle ORM with HONC,
and a plan for the API routes for my api.

Design a simple CRUD api for key resources in the app. 
Expose a REST api for creating, reading, updating, and deleting resources.

For streaming or realtime apis, add a TODO comment with a link to the following documentation:

Streaming:
- https://hono.dev/docs/helpers/streaming#streaming-helper

Realtime:
- https://developers.cloudflare.com/durable-objects/
- https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/

===

Here is the Drizzle schema for the database,
which is already imported in the template api routes file:

<file language=typescript path=src/db/schema.ts>
${dbSchema}
</file>

===

To make database queries, use these examples of how the Drizzle ORM and query builder work:

${getDrizzleOrmExamples()}

===

There are some common mistakes you make when writing Hono apis on Cloudflare Workers.
Avoid these mistakes:

${getCommonHonoMistakes()}

===

Here is my current template file:

<file language=typescript path=src/index.ts>
${TEMPLATE_EXAMPLE}
</file>

A few tips:

- Modify the template file to match the plan for my api.
- Do not return the file unchanged.
- Remove existing code from this file that is no longer needed.
- Prefer Number.parseInt over parseInt
- All import paths are correct, so don't modify import paths
- Add new imports from the Drizzle ORM if you need new sql helper functions (like { sql }, { gte }, etc)

IMPORTANT: 
For Hono apis on Cloudflare Workers, you must access environment variables from a context parameter 
within the request handler functions.

So, in "index.ts", you might see something like this:

\`\`\`typescript
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  const OPENAI_API_KEY = c.env.OPENAI_API_KEY;
  const model = createOpenAI({ apiKey: OPENAI_API_KEY });
  const result = await generateText({
    model,
    prompt: "Hello, world!",
  });
  // ...
});
\`\`\`

That is correct, do not modify it to use process.env!

Please generate the api routes file for me, according to the following plan:

${apiPlan}

Think step by step in this order:

- What are the relevant tables?
- What are the relevant columns in the database for this api?
- How do I use the Drizzle ORM to query the database?
- What are the endpoints that I need to implement?

Things you usually screw up (things to avoid):
- result of a d1 query with drizzle does not have a \`.changed\` property
- do not include example code in the generated api routes file unless it is for unimplemented features
`.trim();

    log("debug", "Generating API with reasoning", { apiPlan, dbSchema });

    const result = await generateObject({
      model,
      schema: z.object({
        reasoning: z
          .string()
          .describe("Your step by step thought process for designing the api"),
        indexTs: z
          .string()
          .describe("The generated api routes file, in typescript"),
      }),
      prompt: PROMPT,
      temperature: 0.2,
      abortSignal: signal,
    });

    log("info", "API generation complete", {
      codeLength: result.object.indexTs.length,
      reasoningLength: result.object.reasoning.length,
    });

    return {
      indexTs: result.object.indexTs,
      reasoning: result.object.reasoning,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in generate API"),
    );
    throw error;
  }
});
