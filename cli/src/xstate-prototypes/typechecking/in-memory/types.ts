import type * as ts from "typescript";
import type { ErrorInfo } from "../types";

/**
 * Represents a TypeScript file in memory
 */
export type InMemoryFile = {
  fileName: string;
  content: string;
};

/**
 * Input parameters for the in-memory TypeScript validation
 */
export type ValidateTypescriptInMemoryInputs = {
  files: InMemoryFile[];
  compilerOptions?: ts.CompilerOptions;
};

// Re-export ErrorInfo from parent module
export type { ErrorInfo };
