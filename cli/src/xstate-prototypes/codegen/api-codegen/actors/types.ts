export interface ApiVerificationOptions {
  schema: string;
  apiCode: string;
}

export interface ApiVerificationResult {
  valid: boolean;
  issues: string[];
}

export interface ApiErrorAnalysisResult {
  text: string;
  sources?: Record<string, unknown>[];
}

export interface ApiFixResult {
  code: string;
}
