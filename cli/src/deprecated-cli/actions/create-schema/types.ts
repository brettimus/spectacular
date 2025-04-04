// Define interfaces matching the schema agent response types
export interface TableField {
  name: string;
  type: string;
  isPrimary: boolean;
  isRequired: boolean;
  isForeignKey: boolean;
  references?: string;
  description: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  fields: TableField[];
}

export interface DatabaseOperation {
  name: string;
  description: string;
  affectedTables: string[];
  complexity: "simple" | "medium" | "complex";
}

export interface SelectedRule {
  ruleName: string;
  priority: number;
  reason: string;
}

// Step tracking interface for state management
export interface SchemaGenerationStep {
  step: string;
  status: "pending" | "in-progress" | "completed" | "error";
  message?: string;
  data: {
    operations: DatabaseOperation[];
    relevantRules: SelectedRule[];
    tableSchemas: Array<{
      tableName: string;
      schema: string;
      explanation: string;
    }>;
    finalSchema: string;
    schemaSpecification: string;
  };
}
