import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import type {
  ApiAgentInterface,
  ApiGenerationOptions,
  ApiVerificationOptions,
  ApiVerificationResult,
} from "./types";

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

export class ApiAgentService implements ApiAgentInterface {
  async generateApiRoutes(
    context: Context,
    options: ApiGenerationOptions,
  ): Promise<string> {
    const result = await this.generateApiWithReasoning(context, options);
    return result.indexTs;
  }

  async generateApiWithReasoning(
    context: Context,
    options: ApiGenerationOptions,
  ): Promise<{ indexTs: string; reasoning: string }> {
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai("o3-mini"));

    const dbSchema = options.schema;
    const apiPlan =
      context.specContent ||
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

${this.getDrizzleOrmExamples()}

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
app.get("/", (c) => {
  const DATABASE_URL = c.env.DATABASE_URL;
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
`.trim();

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
      temperature: 0.25,
    });

    return {
      indexTs: result.object.indexTs,
      reasoning: result.object.reasoning,
    };
  }

  async verifyApi(
    context: Context,
    options: ApiVerificationOptions,
  ): Promise<ApiVerificationResult> {
    // Use o3-mini model for verification
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai("o3-mini"));

    const VERIFICATION_PROMPT = `
You are a code reviewer examining a generated API for a Hono.js application.
The API is intended to work with a database schema using Drizzle ORM.

Database Schema:
\`\`\`typescript
${options.schema}
\`\`\`

Generated API:
\`\`\`typescript
${options.apiCode}
\`\`\`

Carefully review the generated API and identify any issues related to:
1. Correctness (syntax errors, type errors, missing imports)
2. Completeness (are all necessary CRUD operations implemented?)
3. Best practices (follows Hono and Drizzle ORM conventions)
4. Security concerns (e.g., input validation missing, potential SQL injection)
5. Performance issues

DO NOT suggest stylistic changes or minor optimizations.
Only report actual problems that would prevent the API from working correctly.
`.trim();

    const result = await generateObject({
      model,
      schema: z.object({
        valid: z.boolean().describe("Whether the api is valid"),
        issues: z.array(z.string()).describe("List of issues found, if any"),
        reasoning: z
          .string()
          .describe("Your step by step thought process for reviewing the api"),
      }),
      prompt: VERIFICATION_PROMPT,
      temperature: 0.1,
    });

    return {
      valid: result.object.valid,
      issues: result.object.issues,
    };
  }

  private getDrizzleOrmExamples(): string {
    return `
<drizzle-orm-example description="Count the number of users in the database">
import { count, eq, sql } from "drizzle-orm";
// ...

  // Rename destructured property to avoid name collision
  const [ { count: usersCount } ] = await db.select({ count: count() }).from(schema.users);

// ...
</drizzle-orm-example>

<drizzle-orm-example description="Order items by createdAt field in descending order">
import { desc } from "drizzle-orm";
// ...

  const orderedItems = await db.select().from(schema.items).orderBy(desc(schema.items.createdAt));

// ...
</drizzle-orm-example>

<drizzle-orm-example description="Select a user by id using the eq operator">
import { eq, sql } from "drizzle-orm";
// ...

const [user] = await db.select().from(schema.users).where(eq(schema.users.id, "some-user-id"));

// ...
</drizzle-orm-example>

<drizzle-orm-example description="Use greater than or equal to operator to find expensive products">
import { gte } from "drizzle-orm";
// ...

const expensiveProducts = await db.select().from(schema.products).where(gte(schema.products.price, 1000));

// ...
</drizzle-orm-example>

<drizzle-orm-example description="Use the db.delete method to remove a user from the database">
// ...

  // WRONG! This will delete all entries in the users table
  // await db.delete().where(eq(schema.users.id, id)).from(schema.users);

  // CORRECT!
  await db.delete(schema.users).where(eq(schema.users.id, id));

// ...
</drizzle-orm-example>
`.trim();
  }
}
