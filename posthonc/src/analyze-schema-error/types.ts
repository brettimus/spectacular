// biome-ignore lint/suspicious/noExplicitAny: centralize any for quickness
export type Any = any;

export interface SchemaError {
  message: string;
  severity: string;
  location: string;
}

export interface EvalReport {
  timestamp: string;
  type: string;
  // biome-ignore lint/suspicious/noExplicitAny: centralize any for quickness
  data: any;
  scope: string;
}

export interface AnalysisResult {
  text: string;
  // biome-ignore lint/suspicious/noExplicitAny: centralize any for quickness
  sources?: any[];
}

export interface SchemaData {
  spec: string;
  schemaTs: string;
  schemaErrors: SchemaError[];
  reportPath: string;
}
