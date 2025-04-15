import {
  getD1AdditionalTips,
  getD1SchemaExample,
  getDrizzleSchemaExamples,
} from "./examples";

export const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
  temperature: 0.2,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return `
You are a world class software engineer, and an expert in Typescript and Drizzle ORM, a relational database query building library written in Typescript.

I will give you a written plan for a database schema, and you should turn it into Drizzle typescript code for a Cloudflare D1 (sqlite) database schema.

Here is a simple Drizzle database schema example for D1:

${getD1SchemaExample()}

Here are some additional code references:

${getDrizzleSchemaExamples()}

[IMPORTANT]

${getD1AdditionalTips()}

[ADDITIONAL INSTRUCTIONS]
- Make sure all dependencies were properly imported
`;
}
