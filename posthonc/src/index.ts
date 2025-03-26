import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

// biome-ignore lint/suspicious/noExplicitAny: centralize any for quickness
type Any = any;

console.log("Reading eval report");

const posthoncDir = process.cwd();
const evalReport = JSON.parse(
  fs.readFileSync(
    path.join(
      posthoncDir,
      "data",
      "schema-generation",
      "spectacular-eval-2025-03-26T01_09_54_726Z.json",
    ),
    "utf8",
  ),
);

const inputSchema = evalReport.find((r: Any) => r.type === "input_schema");
if (!inputSchema) {
  throw new Error("No input for schema generation found");
}

const spec = inputSchema.data.specFileDetails.spec;
if (!spec) {
  throw new Error("No spec found");
}

const outputSchema = evalReport.find((r: Any) => r.type === "output_schema");
if (!outputSchema) {
  throw new Error("No output for schema generation found");
}

const schemaTs = outputSchema.data.code;
if (!schemaTs) {
  throw new Error("No schemaTs found");
}

const typescriptValidity = evalReport.find(
  (r: Any) => r.scope === "typescript-validity",
);
if (!typescriptValidity) {
  throw new Error("No typescript validity found");
}

const typescriptErrors = typescriptValidity?.data?.errors;

if (!typescriptErrors) {
  console.log("No typescript errors found");
  process.exit(0);
}



const result = await generateText({
  model: openai.responses("gpt-4o"),
  prompt:
    "How do I write an index in Drizzle ORM for sqlite? Give me code samples (look at docs on https://orm.drizzle.team)",
  tools: {
    web_search_preview: openai.tools.webSearchPreview(),
  },
});

console.log(result.text);
console.log(result.sources);
