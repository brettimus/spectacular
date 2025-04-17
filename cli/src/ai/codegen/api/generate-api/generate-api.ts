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
import { TEMPLATE_EXAMPLE } from "./examples";

export type GenerateApiOptions = {
  spec: string;
  schema: string;
};

export type GenerateApiResult = z.infer<typeof GenerateApiSchema>;

const GenerateApiSchema = z.object({
  explanation: z
    .string()
    .describe("Your step by step thought process for designing the api"),
  indexTs: z
    .string()
    .describe(
      "The generated api routes file `index.ts`, in typescript, THIS IS REQUIRED",
    ),
});

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
      templateExample,
      drizzleOrmExamples,
      honoApiRules,
    );

    log("debug", "Generating API with following plan and schema:", {
      apiPlan,
      dbSchema,
    });

    const result = await generateObject({
      model,
      schema: GenerateApiSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: createUserPrompt({ dbSchema, apiPlan }),
        },
      ],
      temperature,
      abortSignal: signal,
    });

    log("info", "API generation complete", {
      codeLength: result.object.indexTs.length,
      explanationLength: result.object.explanation.length,
    });

    return {
      indexTs: result.object.indexTs,
      explanation: result.object.explanation,
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

const createUserPrompt = ({
  dbSchema,
  apiPlan,
}: { dbSchema: string; apiPlan: string }) => `
I have a Drizzle schema for my database, which is already correctly imported in the template api routes file:

<file language=typescript path=src/db/schema.ts>
${dbSchema}
</file>

Please generate api routes in an index.ts file for me, according to the following specification:\n\n${apiPlan}
`;

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
