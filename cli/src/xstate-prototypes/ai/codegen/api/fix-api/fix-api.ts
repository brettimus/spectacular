import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { aiModelFactory } from "../../../ai-model-factory";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type FixApiErrorsResult = {
  code: string;
};

export type FixApiErrorsOptions = {
  fixContent: string;
  originalApiCode: string;
};

/**
 * Generate a fixed API code based on the analysis results
 *
 * NOTE - Cannot use experimental predictive outputs with a tool call,
 *        so we just use generateText
 */
export async function fixApiErrors(
  aiConfig: FpAiConfig,
  options: FixApiErrorsOptions,
  signal?: AbortSignal,
): Promise<FixApiErrorsResult | null> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    const { fixContent, originalApiCode } = options;
    log("debug", "Fixing API errors", {
      fixContentLength: fixContent.length,
      originalApiCodeLength: originalApiCode.length,
    });

    const userPrompt = `
I need you to generate a fixed version of a Hono.js API file. The original code had TypeScript errors that were analyzed, and I'm providing you with the analysis results.

Here's the original API code:

\`\`\`typescript
${originalApiCode}
\`\`\`

Here's the analysis of the errors:

${fixContent}

Based on this analysis, generate a corrected index.ts file that fixes all the issues identified.

Return only the fixed code. It should be valid TypeScript code. DO NOT INCLUDE A CHAT MESSAGE WITH THE FIXED CODE IN MARKDOWN!
`;

    const result = await generateText({
      model,
      system: getSystemPrompt(),
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature,
      // TODO - Only use this for openai
      providerOptions: {
        openai: {
          prediction: {
            type: "content",
            content: originalApiCode,
          },
        },
      },
      abortSignal: signal,
    });

    log("info", "API error fixing complete", {
      resultLength: result.text.length,
    });

    return { code: result.text };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in fix API errors"),
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
