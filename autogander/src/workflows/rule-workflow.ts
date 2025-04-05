import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { asc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { fixEvents, rules } from "../db/schema";
import type { Bindings } from "../types";
import { createRuleGenerationMessages } from "./prompts";

// Define OpenAI model type and constants
type OpenAIModel = Parameters<OpenAIProvider>[0];
const OPENAI_MODEL: OpenAIModel = "o3-mini";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;
const BATCH_SIZE = 10;

// biome-ignore lint/complexity/noBannedTypes: There are no params, it is fine
type Params = {};

// Define type for rule items to be saved
type RuleToSave = {
  fixEventId: number;
  rule: string;
  reasoning: string | null;
  additionalData: Record<string, unknown> | null;
};

/**
 * RuleWorkflow - Generates rules for fixes that don't have associated rules yet
 * This workflow runs on a scheduled basis via cron trigger
 */
export class RuleWorkflow extends WorkflowEntrypoint<Bindings, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const db = drizzle(this.env.DB);

    try {
      // Step 1: Find fixes without rules
      const fixesWithoutRules = await step.do(
        "find-fixes-without-rules",
        {
          retries: {
            limit: MAX_RETRIES,
            delay: BASE_DELAY_MS,
            backoff: "exponential",
          },
          timeout: "30 seconds",
        },
        async () => {
          // Get fixes that don't have associated rules yet
          const result = await db
            .select()
            .from(fixEvents)
            .leftJoin(rules, eq(fixEvents.id, rules.fixEventId))
            .where(isNull(rules.id))
            .orderBy(asc(fixEvents.id))
            .limit(BATCH_SIZE);

          console.log(
            `Found ${result.length} fixes without rules, processing...`,
          );

          // Return only the fixes without their joins
          return result
            .map((row) => row.fix_events)
            .map((fixEvent) => ({
              ...fixEvent,
              sourceCompilerErrors: fixEvent.sourceCompilerErrors as
                | null
                | object,
              fixedCompilerErrors: fixEvent.fixedCompilerErrors as
                | null
                | object,
            }));
        },
      );

      if (!fixesWithoutRules || fixesWithoutRules.length === 0) {
        return { processed: 0, message: "No fixes without rules found" };
      }

      // Configure OpenAI
      const openai = createOpenAI({
        apiKey: this.env.OPENAI_API_KEY,
        baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/${this.env.CLOUDFLARE_AI_GATEWAY_ID}/openai`,
      });

      // Process each fix
      let processedCount = 0;

      // Collect all rules to be saved in a batch
      const rulesToSave: RuleToSave[] = [];

      for (const fixEvent of fixesWithoutRules) {
        // Step 2: Generate rules for the fix
        const ruleResult = await step.do(
          `generate-rule-for-fix-${fixEvent.id}`,
          {
            retries: {
              limit: MAX_RETRIES,
              delay: BASE_DELAY_MS,
              backoff: "exponential",
            },
            timeout: "1 minute",
          },
          async () => {
            try {
              // Create messages using the function from prompts.ts
              const messages = createRuleGenerationMessages(
                fixEvent.sourceCode,
                fixEvent.sourceCompilerErrors as Array<object>,
                fixEvent.analysis,
                fixEvent.fixedCode || "",
                (fixEvent.fixedCompilerErrors as Array<object>) || [],
              );

              // Capture the generated MDC content
              const { object: rulesResult } = await generateObject({
                model: openai(OPENAI_MODEL),
                schema: z.object({
                  rules: z
                    .array(
                      z.object({
                        reasoning: z
                          .string()
                          .describe("The reasoning for the rule"),
                        rule: z
                          .string()
                          .describe(
                            "The specific rule in mdc formatting to learn from the fix",
                          ),
                      }),
                    )
                    .describe(
                      "The rules in mdc formatting to learn from the fix",
                    ),
                }),
                messages,
              });

              return rulesResult;
            } catch (error) {
              console.error("Error in rule generation:", error);
              throw error;
            }
          },
        );

        // Collect rules to be saved in batch
        if (ruleResult && ruleResult.rules.length > 0) {
          // Add each rule from the array to our collection
          for (const ruleItem of ruleResult.rules) {
            rulesToSave.push({
              fixEventId: fixEvent.id,
              rule: ruleItem.rule,
              reasoning: ruleItem.reasoning || null,
              additionalData: null,
            });
          }
          processedCount++;
        }
      }

      // Step 3: Batch save all collected rules
      if (rulesToSave.length > 0) {
        await step.do(
          "batch-save-rules",
          {
            retries: {
              limit: MAX_RETRIES,
              delay: BASE_DELAY_MS,
              backoff: "exponential",
            },
            timeout: "30 seconds",
          },
          async () => {
            await db.insert(rules).values(rulesToSave);
            return { savedRulesCount: rulesToSave.length };
          },
        );
      }

      // Return summary of the workflow execution
      return {
        processed: processedCount,
        totalFixes: fixesWithoutRules.length,
        rulesCreated: rulesToSave.length,
        message: `Successfully processed ${processedCount} out of ${fixesWithoutRules.length} fixes, created ${rulesToSave.length} rules`,
      };
    } catch (error) {
      console.error("Error in rule workflow:", error);
      throw error;
    }
  }
}
