export { generateSchema } from "./generate-schema";
export { analyzeErrors } from "./analyze-schema-errors";
export { fixSchema } from "./fix-schema";
// HACK - My typescript language server needed this for some reason?
export { identifyRules } from "./identify-rules/index";
export { analyzeTables } from "./analyze-tables";
export type { SchemaGenerationOptions, SchemaGenerationResult } from "./types";
export type {
  AnalyzeTablesResult,
  AnalyzeTablesOptions,
} from "./analyze-tables";
