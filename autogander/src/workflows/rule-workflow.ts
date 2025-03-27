import { generateObject } from "ai";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { drizzle } from "drizzle-orm/d1";
import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
import { asc, eq, isNull } from "drizzle-orm";
import { fixEvents, rules } from "../db/schema";
import { z } from "zod";
import type { Bindings } from "../types";
import { createRuleGenerationMessages } from "./prompts";

// Define OpenAI model type and constants
type OpenAIModel = Parameters<OpenAIProvider>[0];
const OPENAI_MODEL: OpenAIModel = "gpt-4o";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;
const BATCH_SIZE = 10;

// biome-ignore lint/complexity/noBannedTypes: There are no params, it is fine
type Params = {};

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
          const result = await db.select()
            .from(fixEvents)
            .leftJoin(rules, eq(fixEvents.id, rules.fixEventId))
            .where(isNull(rules.id))
            .orderBy(asc(fixEvents.id))
            .limit(BATCH_SIZE);
          
          console.log(`Found ${result.length} fixes without rules, processing...`);

          // Return only the fixes without their joins
          return result.map(row => row.fix_events).map(fixEvent => ({
            ...fixEvent,
            sourceCompilerErrors: fixEvent.sourceCompilerErrors as null | object,
            fixedCompilerErrors: fixEvent.fixedCompilerErrors as null | object
          }));
        }
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
                fixEvent.fixedCompilerErrors as Array<object> || []
              );
              
              // Capture the generated MDC content
              const { object: ruleResult } = await generateObject({
                model: openai(OPENAI_MODEL),
                schema: z.object({
                  reasoning: z.string().describe("The reasoning for the rule"),
                  rule: z.string().describe("The rule in mdc formatting to learn from the fix"),
                }),
                messages,
              });
              
              return ruleResult;
            } catch (error) {
              console.error("Error in rule generation:", error);
              throw error;
            }
          }
        );
        
        // Step 3: Save the generated rule
        if (ruleResult.rule) {
          await step.do(
            `save-rule-for-fix-${fixEvent.id}`,
            {
              retries: {
                limit: MAX_RETRIES,
                delay: BASE_DELAY_MS,
                backoff: "exponential",
              },
              timeout: "30 seconds",
            },
            async () => {
              await db.insert(rules).values({
                fixEventId: fixEvent.id,
                rule: ruleResult.rule,
                reasoning: ruleResult.reasoning || null,
                additionalData: null,
              });
              
              processedCount++;
              return { fixId: fixEvent.id };
            }
          );
        }
      }
      
      // Return summary of the workflow execution
      return {
        processed: processedCount,
        totalFixes: fixesWithoutRules.length,
        message: `Successfully processed ${processedCount} out of ${fixesWithoutRules.length} fixes`
      };
    } catch (error) {
      console.error("Error in rule workflow:", error);
      throw error;
    }
  }
}
