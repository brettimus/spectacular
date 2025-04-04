import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type FixSchemaOptions = {
  fixContent: string;
  originalSchema: string;
};

export type FixSchemaResult = {
  code: string;
};

/**
 * Fix schema errors using AI
 */
export async function fixSchema(
  aiConfig: FpAiConfig,
  options: FixSchemaOptions,
  signal?: AbortSignal,
): Promise<FixSchemaResult | null> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    log("debug", "Fixing schema errors", {
      fixContentLength: options.fixContent.length,
      originalSchemaLength: options.originalSchema.length,
    });

    const result = await generateText({
      model,
      system: getSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `
I need you to generate a fixed version of a Drizzle ORM schema.ts file. The original schema had TypeScript errors that were analyzed, and I'm providing you with the analysis results.

Here's the analysis of the schema errors:

${options.fixContent}

Based on this analysis, generate a corrected schema.ts file that fixes all the issues identified.

Return only the fixed schema code. It should be valid TypeScript code. DO NOT INCLUDE A CHAT MESSAGE WITH THE FIXED CODE IN MARKDOWN!
`,
        },
      ],
      temperature,
      abortSignal: signal,
    });

    log("info", "Schema fix complete", {
      responseLength: result.text.length,
    });

    return {
      code: result.text,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error ? error : new Error("Unknown error in fix schema"),
    );
    return null;
  }
}

function getStrategyForProvider(aiProvider: FpModelProvider) {
  switch (aiProvider) {
    case "openai":
      return {
        getSystemPrompt: OPENAI_STRATEGY.getSystemPrompt,
        temperature: OPENAI_STRATEGY.temperature,
      };
    case "anthropic":
      return {
        getSystemPrompt: ANTHROPIC_STRATEGY.getSystemPrompt,
        temperature: ANTHROPIC_STRATEGY.temperature,
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
