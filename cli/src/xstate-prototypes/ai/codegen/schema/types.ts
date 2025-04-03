import type { ErrorInfo } from "@/utils/typechecking/types";
import type { SelectedRule } from "@/agents/schema-agent/types";

export interface SchemaAnalysisOptions {
  specContent: string;
}

export interface SchemaGenerationOptions {
  schemaSpecification: string;
  relevantRules: SelectedRule[];
}

export interface SchemaVerificationOptions {
  schema: string;
}

export interface SchemaFixOptions {
  fixContent: string;
  originalSchema: string;
}

export interface TypescriptErrorAnalysisOptions {
  schema: string;
  schemaSpecification: string;
  errors: ErrorInfo[];
}

export interface SchemaAnalysisResult {
  reasoning: string;
  schemaSpecification: string;
}

export interface SchemaGenerationResult {
  explanation: string;
  dbSchemaTs: string;
}

export interface SchemaVerificationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  fixedSchema: string;
}

export interface SchemaErrorAnalysisResult {
  text: string;
  sources?: Record<string, unknown>[];
}

export interface SchemaFixResult {
  code: string;
}
