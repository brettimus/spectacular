export { aiModelFactory } from "./ai-model-factory";
export type { FpModelDetails, FpModelProvider, FpAiConfig } from "./types";
export { DEFAULT_AI_PROVIDER } from "./constants";

export {
  askNextQuestion,
  generateSpec,
  GeneratedPlanSchema,
  type GeneratedPlan,
  routeRequest,
  type RouterResponse,
} from "./chat";

export {
  analyzeTables,
  type AnalyzeTablesResult,
  type AnalyzeTablesOptions,
  analyzeErrors,
  type AnalyzeSchemaErrorsOptions,
  type AnalyzeSchemaErrorsResult,
  fixSchema,
  type FixSchemaOptions,
  type FixSchemaResult,
  generateSchema,
  type GenerateSchemaOptions,
  type GenerateSchemaResult,
} from "./codegen/db-schema";

export {
  generateApi,
  type GenerateApiResult,
  type GenerateApiOptions,
  analyzeApiErrors,
  type AnalyzeApiErrorsResult,
  fixApiErrors,
  type FixApiErrorsResult,
} from "./codegen/api";

// TODO - Implement rule identification
//
export type { SelectedRule } from "./codegen/types";
export { identifyRules } from "./codegen/db-schema";
