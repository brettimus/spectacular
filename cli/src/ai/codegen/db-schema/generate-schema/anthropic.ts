import { drizzleSchemaRules } from "../../../../spectacular-knowledge/rules";
import { getD1SchemaExample } from "./examples--deprecated";

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

******

Here is the library documentation for Drizzle ORM, as it may be relevant to the schema generation:
[BEGIN DRIZZLE LIBRARY DOCUMENTATION]
${drizzleSchemaRules.map((rule) => `<drizzle_rule id="${rule.id}">\n${rule.content}\n</drizzle_rule>`).join("\n\n")}
[END DRIZZLE LIBRARY DOCUMENTATION]

******

[ADDITIONAL INSTRUCTIONS]
- Make sure all dependencies were properly imported
`;
}
