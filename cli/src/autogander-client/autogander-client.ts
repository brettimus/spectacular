// Types for the Fix API
interface FixEventPayload {
  type: string;
  sourceCode: string;
  sourceCompilerErrors: Record<string, unknown>;
  analysis: string;
  fixedCode: string;
  fixedCompilerErrors?: Record<string, unknown>;
}

// Added more detailed types for error messages
interface ErrorMessage {
  message: string;
  severity?: string;
  location?: string;
}

// Helper type for handling different error formats
type ErrorsInput = string | ErrorMessage[] | Record<string, unknown>;

interface FixResponse {
  message: string;
  result: Record<string, unknown>;
}

interface GetFixesParams {
  type?: string;
  page?: number;
  pageSize?: number;
}

interface GetFixEventsResponse {
  page: number;
  pageSize: number;
  total: number;
  fixEvents: Record<string, unknown>[];
}

// Use http://localhost:4008 for local development
const DEFAULT_BASE_URL =
  process.env.AUTOGANDER_BASE_URL || "https://autogander.fp.dev";

/**
 * Autogander API client for interacting with the fixes API
 */
export class AutoganderClient {
  private baseUrl: string;

  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Normalize different error formats into a consistent Record
   */
  private normalizeErrors(errors: ErrorsInput): Record<string, unknown> {
    if (typeof errors === "string") {
      return { message: errors };
    }

    if (Array.isArray(errors)) {
      return { messages: errors };
    }

    return errors;
  }

  /**
   * Submit a fix to the API
   */
  async submitFix(
    sessionId: string,
    payload: FixEventPayload,
  ): Promise<FixResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${sessionId}/fix-events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Failed to submit fix: ${errorData.error || response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get fixes for a session
   */
  async getFixes(
    sessionId: string,
    params: GetFixesParams = {},
  ): Promise<GetFixEventsResponse> {
    const queryParams = new URLSearchParams();

    if (params.type) {
      queryParams.append("type", params.type);
    }
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const url = `${this.baseUrl}/api/sessions/${sessionId}/fix-events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Failed to get fixes: ${errorData.error || response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Helper to submit a schema fix
   */
  async submitSchemaFix(
    sessionId: string,
    sourceCode: string,
    sourceCompilerErrors: ErrorsInput,
    analysis: string,
    fixedCode: string,
    fixedCompilerErrors?: ErrorsInput,
  ): Promise<FixResponse> {
    return this.submitFix(sessionId, {
      type: "schemaTs",
      sourceCode,
      sourceCompilerErrors: this.normalizeErrors(sourceCompilerErrors),
      analysis,
      fixedCode,
      fixedCompilerErrors: fixedCompilerErrors ? this.normalizeErrors(fixedCompilerErrors) : undefined,
    });
  }

  /**
   * Helper to submit an API fix
   */
  async submitApiFix(
    sessionId: string,
    sourceCode: string,
    sourceCompilerErrors: ErrorsInput,
    analysis: string,
    fixedCode: string,
    fixedCompilerErrors?: ErrorsInput,
  ): Promise<FixResponse> {
    return this.submitFix(sessionId, {
      type: "indexTs",
      sourceCode,
      sourceCompilerErrors: this.normalizeErrors(sourceCompilerErrors),
      analysis,
      fixedCode,
      fixedCompilerErrors: fixedCompilerErrors ? this.normalizeErrors(fixedCompilerErrors) : undefined,
    });
  }
}
