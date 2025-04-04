/**
 * In-memory TypeScript type checking
 *
 * This module provides type checking using the TypeScript compiler API directly,
 * without relying on file system operations or running external commands.
 */

export {
  validateTypeScriptInMemory,
  validateTypeScriptInMemoryActor,
} from "./typecheck";

export { runInMemoryTypecheckExample } from "./example";

export type { InMemoryFile, ValidateTypescriptInMemoryInputs } from "./types";
