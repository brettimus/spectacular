export {
  generateSchema,
  type GenerateSchemaOptions,
  type GenerateSchemaResult,
} from "./generate-schema";
export {
  analyzeErrors,
  type AnalyzeSchemaErrorsResult,
  type AnalyzeSchemaErrorsOptions,
} from "./analyze-schema-errors";
export {
  fixSchema,
  type FixSchemaOptions,
  type FixSchemaResult,
} from "./fix-schema";
// HACK - My typescript language server needed this import to use ./index for some reason?
export { identifyRules } from "./identify-rules/index";
export { analyzeTables } from "./analyze-tables";
export type {
  AnalyzeTablesResult,
  AnalyzeTablesOptions,
} from "./analyze-tables";
