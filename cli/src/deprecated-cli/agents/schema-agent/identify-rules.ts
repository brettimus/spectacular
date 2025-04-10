import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/deprecated-cli/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { createUserMessage } from "../utils";

// NOTE - THERE ARE NO RULES FOR NOW - This is mean to be a stopgap for a knowledge base

const RULES_SYSTEM_PROMPT = `
You are an expert in database schema design specializing in selecting the appropriate database rules.
Your task is to analyze a list of database tables and operations and determine which rules should be applied.

A rule is a guideline or pattern for implementing specific database features like authentication, real-time data, etc.
`;

export async function identifyRelevantRules(
  ctx: Context,
  schemaSpecification: string,
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  // Load available rules - assumed to be in the rules directory in the project
  const rulesDir = ctx.rulesDir;
  if (!rulesDir) {
    throw new Error("Rules directory is required for rule identification");
  }

  let rules: string[] = [];

  try {
    if (fs.existsSync(rulesDir)) {
      rules = fs
        .readdirSync(rulesDir)
        .filter((file) => !file.startsWith("_"))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
        .map((file) => file.replace(/\.(ts|js)$/, ""));
    }
  } catch (error) {
    console.error("Error reading rules directory:", error);
  }

  // List all available rule files with full paths (mostly for logging)
  const rulePaths = rules.map((rule) => resolveRulePath(rule, rulesDir));
  console.log(
    `Found ${rules.length} rules in ${rulesDir}: ${rulePaths.length > 0 ? rulePaths.join(", ") : "none"}`,
  );

  if (rulePaths.length === 0) {
    return {
      object: {
        reasoning: "No rules found",
        selectedRules: [],
      },
    };
  }

  return generateObject({
    model,
    schema: z.object({
      reasoning: z
        .string()
        .describe("Your reasoning for selecting these rules"),
      selectedRules: z.array(
        z.object({
          ruleName: z.string().describe("Name of the rule to apply"),
          priority: z.number().describe("Priority order (1 is highest)"),
          reason: z.string().describe("Why this rule is relevant"),
        }),
      ),
    }),
    messages: [
      createUserMessage(`Based on this database schema, which rules should be applied?
[DATABASE SCHEMA SPECIFICATION]
${schemaSpecification}
[END DATABASE SCHEMA SPECIFICATION]
***
[AVAILABLE RULES]
${rules.join(", ")}
[END AVAILABLE RULES]
`),
    ],
    system: RULES_SYSTEM_PROMPT,
    temperature: 0,
  });
}

/**
 * Helper function to resolve rule file paths
 */
function resolveRulePath(ruleName: string, rulesDir: string): string {
  return path.join(rulesDir, `${ruleName}.ts`);
}
