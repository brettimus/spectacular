export class UnknownError extends Error {
  originalError: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = "UnknownError";
    this.originalError = originalError;
  }
}

export function normalizeError(error: unknown) {
  return error instanceof Error
    ? error
    : new UnknownError("Unknown error", error);
}
