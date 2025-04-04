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

export type {
  AnalyzeTablesResult,
  AnalyzeTablesOptions,
  AnalyzeSchemaErrorsOptions,
  AnalyzeSchemaErrorsResult,
} from "./codegen/schema";

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
export { identifyRules } from "./codegen/schema/identify-rules/identify-rules";
