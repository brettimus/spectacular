import { generateObject } from "ai";
import { z } from "zod";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import { OPENAI_STRATEGY } from "./openai";
import { log } from "../../../../utils/logging";
import {
  drizzleQueryRules,
  honoRules,
} from "../../../../spectacular-knowledge/rules";

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
import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
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

  const [newUser] = await db.insert(schema.users).values({
    name: name,
    email: email,
  }).returning();

  return c.json({ user: newUser });
});

/**
 * Serve a simplified api specification for your API
 * As of writing, this is just the list of routes and their methods.
 */
app.get("/openapi.json", c => {
  return c.json(createOpenAPISpec(app, {
    info: {
      title: "Honc D1 App",
      version: "1.0.0",
    },
  }))
});

/**
 * Mount the Fiberplane api explorer to be able to make requests against your API.
 *
 * Visit the explorer at \`/fp\`
 */
app.use("/fp/*", createFiberplane({
  app,
  openapi: { url: "/openapi.json" }
}));


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

    const drizzleOrmExamples = drizzleQueryRules
      .map(
        (rule) =>
          `<drizzle_query_rule id="${rule.id}">\n${rule.content}\n</drizzle_query_rule>`,
      )
      .join("\n\n");
    const honoApiRules = honoRules
      .map(
        (rule) =>
          `<hono_api_rule id="${rule.id}">\n${rule.content}\n</hono_api_rule>`,
      )
      .join("\n\n");
    const templateExample = TEMPLATE_EXAMPLE;

    const SYSTEM_PROMPT = getSystemPrompt(
      dbSchema,
      templateExample,
      drizzleOrmExamples,
      honoApiRules,
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
