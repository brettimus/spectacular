import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { SchemaData, AnalysisResult } from '../types';

/**
 * Generate a prompt for the AI to analyze schema errors
 */
export function generateErrorAnalysisPrompt(data: SchemaData): string {
  return `
I'm trying to create a Drizzle ORM schema based on this specification:

${data.spec}

Here's my current schema.ts file:

${data.schemaTs}

However, I'm getting these TypeScript errors:

${JSON.stringify(data.schemaErrors, null, 2)}

What's causing these errors and how should I fix my schema.ts file?

Please search the internet for the latest Drizzle ORM documentation on how to define SQLite schemas properly.
`;
}

/**
 * Analyze schema errors using OpenAI and web search
 */
export async function analyzeSchemaErrors(data: SchemaData): Promise<AnalysisResult | null> {
  try {
    console.log(`Analyzing schema errors for report: ${data.reportPath}`);
    
    const prompt = generateErrorAnalysisPrompt(data);
    
    const result = await generateText({
      model: openai.responses("gpt-4o"),
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
    });

    return {
      text: result.text,
      sources: result.sources
    };
  } catch (error) {
    console.error("Error analyzing schema errors:", error);
    return null;
  }
} 