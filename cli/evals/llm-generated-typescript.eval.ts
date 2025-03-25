import { randomUUID } from "node:crypto";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { evalite } from "evalite";
import { TypeScriptValidity } from "./scorers/typescript-validity";

// Prompts for generating TypeScript code
const prompts = [
  {
    prompt: "Write a TypeScript function that calculates the factorial of a number.",
  },
  {
    prompt: "Create a TypeScript class for a Todo item with methods to mark it complete and update its description.",
  },
  {
    prompt: "Write a TypeScript utility that formats a date in ISO format.",
  },
  {
    prompt: "Create a TypeScript interface for API responses with generic data typing and proper error handling.",
  },
  {
    prompt: "Write a TypeScript function that validates an email address using regular expressions.",
  },
];

evalite("LLM-Generated TypeScript Validity Evaluation", {
  // A function that returns an array of test data
  data: async () => {
    return prompts.map(item => ({
      input: {
        prompt: item.prompt,
        id: randomUUID()
      },
      expected: null,
      metadata: {
        prompt: item.prompt
      }
    }));
  },
  // The task to perform - generate TypeScript code with an LLM
  task: async (input: { prompt: string; id: string }) => {
    const llmResponse = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a TypeScript expert. Write high-quality, idiomatic TypeScript code for the following request. Only return the code, no explanations or comments outside the code:

${input.prompt}`,
      maxTokens: 1000,
    });
    
    // Extract code from the LLM response (in case there's text before/after the code)
    const responseText = String(llmResponse);
    let code = responseText;
    
    // If the response includes markdown code blocks, extract the content
    const codeBlockMatch = responseText.match(/```(?:typescript|ts)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch?.[1]) {
      code = codeBlockMatch[1];
    }
    
    // The TypeScriptValidity scorer expects an object with 'code' and 'id' properties
    return { code, id: input.id };
  },
  // The scoring methods for the eval
  scorers: [TypeScriptValidity],
}); 