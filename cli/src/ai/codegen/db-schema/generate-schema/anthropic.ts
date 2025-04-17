import { drizzleSchemaRules } from "../../../../spectacular-knowledge/rules";
import { getD1SchemaExample } from "./examples";

export const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
  temperature: 0.2,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return `
You are a world class software engineer, and an expert in Typescript and Drizzle ORM, a relational database query building library written in Typescript.

I will give you a written plan for a sqlite database schema, and you should turn it into Drizzle Typescript code.

Here is an example of a Drizzle database schema for a Cloudflare D1 (sqlite) database:

<example_file language=typescript path=src/db/schema.ts>
${getD1SchemaExample()}
</example_file>

<drizzle_documentation>
${drizzleSchemaRules.map((rule) => `<drizzle_rule id="${rule.id}">\n${rule.content}\n</drizzle_rule>`).join("\n\n")}
</drizzle_documentation>

<tips>
- Make sure all dependencies were properly imported
- Use \`crypto.randomUUID()\` to generate default unique ids for tables if you must
</tips>`;
}
