import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { SelectedRule } from "@/agents/schema-agent/types";

// System prompt for rule identification
const RULES_SYSTEM_PROMPT = `
You are an expert in database schema design specializing in selecting the appropriate database rules.
Your task is to analyze a list of database tables and operations and determine which rules should be applied.

A rule is a guideline or pattern for implementing specific database features like authentication, real-time data, etc.
`;

export const identifyRulesActor = fromPromise<
  { relevantRules: SelectedRule[] },
  { apiKey: string; schemaSpecification: string, noop: boolean }
>(async ({ input, signal }) => {
  if (input.noop) {
    return { relevantRules: [] as SelectedRule[], reasoning: "N/A" };
  }
  try {
    const { apiKey, schemaSpecification } = input;
    const openai = createOpenAI({ apiKey });
    const model = traceAISDKModel(openai("gpt-4o"));

    // In a real implementation, you would load rules from a directory
    // For this prototype, we'll assume a fixed set of example rules
    // const rules = ["authentication", "real-time", "audit-trail", "versioning"];
    const rules: Array<string> = [];

    log("debug", "Identifying rules for schema", {
      schemaSpecLength: schemaSpecification.length,
      availableRules: rules,
    });

    const result = await generateObject({
      model,
      schema: z.object({
        reasoning: z
          .string()
          .describe("Your reasoning for selecting these rules"),
        selectedRules: z.array(
          z.object({
            ruleName: z.string().describe("Name of the rule to apply"),
            reason: z.string().describe("Why this rule is relevant"),
          }),
        ),
      }),
      messages: [
        {
          role: "user",
          content: `Based on this database schema, which rules should be applied?
[DATABASE SCHEMA SPECIFICATION]
${schemaSpecification}
[END DATABASE SCHEMA SPECIFICATION]
***
[AVAILABLE RULES]
${rules.join(", ")}
[END AVAILABLE RULES]`,
        },
      ],
      system: RULES_SYSTEM_PROMPT,
      temperature: 0,
      abortSignal: signal,
    });

    log("info", "Rule identification complete", {
      rulesSelected: result.object.selectedRules.length,
    });

    return {
      relevantRules: result.object.selectedRules,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in identify rules"),
    );
    throw error;
  }
});
