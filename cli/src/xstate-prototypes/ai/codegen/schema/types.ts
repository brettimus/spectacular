export interface SelectedRule {
  ruleName: string;
  reason: string;
}

export interface SchemaGenerationOptions {
  schemaSpecification: string;
  relevantRules: SelectedRule[];
}

export interface SchemaVerificationOptions {
  schema: string;
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
