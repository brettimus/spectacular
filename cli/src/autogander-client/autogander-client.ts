// Types for the Fix API
interface FixPayload {
  type: string;
  originalCode: string;
  errors: Record<string, unknown>;
  analysis: string;
  fixedCode: string;
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

interface GetFixesResponse {
  page: number;
  pageSize: number;
  total: number;
  fixes: Record<string, unknown>[];
}

/**
 * Autogander API client for interacting with the fixes API
 */
export class AutoganderClient {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:4008") {
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
    payload: FixPayload,
  ): Promise<FixResponse> {
    const response = await fetch(
      `${this.baseUrl}/sessions/${sessionId}/fixes`,
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
  ): Promise<GetFixesResponse> {
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

    const url = `${this.baseUrl}/sessions/${sessionId}/fixes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
    originalCode: string,
    errors: ErrorsInput,
    analysis: string,
    fixedCode: string,
  ): Promise<FixResponse> {
    return this.submitFix(sessionId, {
      type: "schemaTs",
      originalCode,
      errors: this.normalizeErrors(errors),
      analysis,
      fixedCode,
    });
  }

  /**
   * Helper to submit an API fix
   */
  async submitApiFix(
    sessionId: string,
    originalCode: string,
    errors: ErrorsInput,
    analysis: string,
    fixedCode: string,
  ): Promise<FixResponse> {
    return this.submitFix(sessionId, {
      type: "indexTs",
      originalCode,
      errors: this.normalizeErrors(errors),
      analysis,
      fixedCode,
    });
  }
}
