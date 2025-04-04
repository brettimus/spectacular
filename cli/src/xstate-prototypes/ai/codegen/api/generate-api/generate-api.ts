import { generateObject } from "ai";
import { z } from "zod";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type GenerateApiResult = z.infer<typeof GenerateApiSchema>;

const GenerateApiSchema = z.object({
  reasoning: z
    .string()
    .describe("Your step by step thought process for designing the api"),
  indexTs: z
    .string()
    .describe("The generated api routes file, in typescript, THIS IS REQUIRED"),
});

// Keep prompts and examples within this module
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
  return c.text(\`user: \${name} inserted\`);
});

export default app;
`;

export type GenerateApiOptions = {
  spec: string;
  schema: string;
};

/**
 * Generate API code using AI
 */
export async function generateApi(
  aiConfig: FpAiConfig,
  options: GenerateApiOptions,
  signal?: AbortSignal,
): Promise<GenerateApiResult> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { temperature, getSystemPrompt } = getStrategyForProvider(aiProvider);

    const { spec, schema } = options;
    const dbSchema = schema;
    const apiPlan =
      spec ||
      "Create a simple REST API with CRUD operations for all tables in the schema.";

    const drizzleOrmExamples = getDrizzleOrmExamples();
    const commonHonoMistakes = getCommonHonoMistakes();
    const templateExample = TEMPLATE_EXAMPLE;

    const SYSTEM_PROMPT = getSystemPrompt(
      dbSchema,
      templateExample,
      drizzleOrmExamples,
      commonHonoMistakes,
    );

    log("debug", "Generating API with reasoning", { apiPlan, dbSchema });

    const result = await generateObject({
      model,
      schema: GenerateApiSchema,
      system: SYSTEM_PROMPT,
      prompt: `Please generate the api routes file for me, according to the following plan:\n\n${apiPlan}`,
      temperature,
      abortSignal: signal,
    });

    log("info", "API generation complete", {
      codeLength: result.object.indexTs.length,
      reasoningLength: result.object.reasoning.length,
    });

    return {
      indexTs: result.object.indexTs,
      reasoning: "", // result.object.reasoning,
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
}

function getStrategyForProvider(aiProvider: FpModelProvider) {
  switch (aiProvider) {
    case "openai":
      return {
        temperature: OPENAI_STRATEGY.temperature,
        getSystemPrompt: OPENAI_STRATEGY.getSystemPrompt,
      };
    case "anthropic":
      return {
        temperature: ANTHROPIC_STRATEGY.temperature,
        getSystemPrompt: ANTHROPIC_STRATEGY.getSystemPrompt,
      };
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
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

function getDrizzleOrmExamples() {
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
}

function getCommonHonoMistakes() {
  return `
1. Don't use process.env, use c.env to access environment variables inside request handlers
2. Don't forget to add async/await for database operations
3. Don't include results of D1 queries with the .changed property, D1 queries don't have that
4. Remember to parse request bodies with await c.req.json()
5. Use proper error handling with try/catch blocks for database operations
6. Remember to return the response from each route handler
`;
}
