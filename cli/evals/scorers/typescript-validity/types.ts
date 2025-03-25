export interface TypeScriptValidityResult {
  score: number;
  metadata: {
    valid: boolean;
    errors: Array<{
      message: string;
      severity: 'error' | 'warning';
      location?: string;
    }>;
    errorCount: number;
    warningCount: number;
  };
} 