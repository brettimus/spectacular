import type { Context } from "@/context";
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

export interface SchemaAgentInterface {
  analyzeTables(
    context: Context,
    options: SchemaAnalysisOptions,
  ): Promise<SchemaAnalysisResult>;

  identifyRules(
    context: Context,
    schemaSpecification: string,
  ): Promise<{ relevantRules: SelectedRule[] }>;

  generateSchema(
    context: Context,
    options: SchemaGenerationOptions,
  ): Promise<SchemaGenerationResult>;

  verifySchema(
    context: Context,
    options: SchemaVerificationOptions,
  ): Promise<SchemaVerificationResult>;

  analyzeErrors(
    context: Context,
    options: TypescriptErrorAnalysisOptions,
  ): Promise<SchemaErrorAnalysisResult | null>;

  fixSchema(
    context: Context,
    options: SchemaFixOptions,
  ): Promise<SchemaFixResult | null>;
}
