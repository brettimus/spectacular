export class CodeGenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodeGenError";
  }
}

export const isError = (error: unknown): error is Error | CodeGenError => {
  return error instanceof Error || error instanceof CodeGenError;
};
