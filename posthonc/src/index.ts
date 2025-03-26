import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

const result = await generateText({
  model: openai.responses("gpt-4o-mini"),
  prompt:
    "How do I write an index in Drizzle ORM for sqlite? Give me code samples (look at docs on https://orm.drizzle.team)",
  tools: {
    web_search_preview: openai.tools.webSearchPreview(),
  },
});

console.log(result.text);
console.log(result.sources);
