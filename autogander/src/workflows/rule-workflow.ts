
import { generateObject } from "ai";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { drizzle } from "drizzle-orm/d1";
import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
// import { handleAIError } from "./errors";
import { asc, eq, isNull } from "drizzle-orm";
import { fixes, fixRules } from "../db/schema";
import { z } from "zod";
import type { Bindings } from "../types";

/**
 * curl -X POST https://gateway.ai.cloudflare.com/v1/.../autogander/workers-ai/@cf/meta/llama-3.1-8b-instruct \
 --header 'Authorization: Bearer CF_TOKEN' \
 --header 'Content-Type: application/json' \
 --data '{"prompt": "What is Cloudflare?"}'
 */

// Define OpenAI model type and constants
type OpenAIModel = Parameters<OpenAIProvider>[0];
const OPENAI_MODEL: OpenAIModel = "gpt-4o";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;
const BATCH_SIZE = 10;

// Define the rule schema for validation
const RuleSchema = z.object({
  rules: z.array(
    z.object({
      rule: z.string().min(5).max(500),
      explanation: z.string().min(10).max(1000),
      additionalData: z.string(),
    })
  ),
});

/**
 * RuleWorkflow - Generates rules for fixes that don't have associated rules yet
 * This workflow runs on a scheduled basis via cron trigger
 */


// biome-ignore lint/complexity/noBannedTypes: <explanation>
type  Params = {};

export class RuleWorkflow extends WorkflowEntrypoint<Bindings, Params> {
  // Using any types due to missing Cloudflare types
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
            .from(fixes)
            .leftJoin(fixRules, eq(fixes.id, fixRules.fixId))
            .where(isNull(fixRules.id))
            .orderBy(asc(fixes.id))
            .limit(BATCH_SIZE);
          
          console.log("fixesWithoutRules", result);
          // Return only the fixes without their joins
          return result.map(row => row.fixes).map(fix => ({
            ...fix,
            errors: fix.errors as null | object
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
      
      for (const fix of fixesWithoutRules) {
        // Step 2: Generate rules for the fix
        const rulesResult = await step.do(
          `generate-rules-for-fix-${fix.id}`,
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
              const prompt = `
              You are an expert code analyzer. Your task is to analyze a code fix and extract general rules that could be applied to similar situations.
              
              Original Code:
              ${fix.originalCode}
              
              Errors:
              ${JSON.stringify(fix.errors)}
              
              Fixed Code:
              ${fix.fixedCode || "No fixed code provided"}
              
              Analysis:
              ${fix.analysis}
              
              Please extract a list of rules that can be derived from this fix. Each rule should:
              1. Be concise and specific
              2. Describe a pattern to follow or avoid
              3. Explain why this rule is important
              4. Be generally applicable to similar situations
              
              Format your response as a JSON array of objects with 'rule' (a short rule statement) and 'explanation' (detailed explanation) properties.
              Include a markdown-style code snippet to illustrate the rule.
              If possible, write WRONG and CORRECT code snippets to illustrate the rule.
              `;
              
              const { object } = await generateObject({
                model: openai(OPENAI_MODEL),
                schema: RuleSchema,
                prompt,
              });
              
              return object;
            } catch (error) {
              console.error("Error in rule generation:", error);
              // handleAIError(error as Error, {
              //   stage: "rule_generation",
              //   model: OPENAI_MODEL,
              //   userStory: `Fix ID: ${fix.id}`,
              //   prompt: "Rule generation prompt",
              // });
              throw error;
            }
          }
        );
        
        // Step 3: Save the generated rules
        if (rulesResult?.rules?.length > 0) {
          await step.do(
            `save-rules-for-fix-${fix.id}`,
            {
              retries: {
                limit: MAX_RETRIES,
                delay: BASE_DELAY_MS,
                backoff: "exponential",
              },
              timeout: "30 seconds",
            },
            async () => {
              // Insert each rule as a separate record
              for (const rule of rulesResult.rules) {
                await db.insert(fixRules).values({
                  fixId: fix.id,
                  rule: rule.rule,
                  additionalData: rule.additionalData || { explanation: rule.explanation },
                });
              }
              
              processedCount++;
              return { fixId: fix.id, rulesCount: rulesResult.rules.length };
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
