import type { Message } from "ai";
import { getPackageManager } from "./utils";

export interface Context {
  apiKey?: string;

  cwd: string;
  packageManager: string;

  /**
   * The messages from the current chat
   */
  messages: Message[];

  /**
   * The initial description of the project from the user
   */
  description?: string;

  /**
   * The spec of the project
   */
  specContent?: string;

  /**
   * The name of the spec file
   */
  specName?: string;

  /**
   * Where we should write the spec file
   */
  specPath?: string;

  /**
   * A random id for the current session.
   * Can be useful for saving log files or other metadata.
   */
  sessionId: string;
}

export function initContext(): Context {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    cwd: process.cwd(),
    packageManager: getPackageManager() ?? "npm",

    messages: [],

    sessionId: Math.random().toString(36).substring(2),
  };
}

/**
 * Parses the --hatch flag from command line arguments.
 *
 * @param args - An array of command line arguments.
 * @returns
 *   - `false` if the --hatch flag is not present.
 *   - A `string` value if a valid value is provided with the flag.
 *   - `true` if the flag is present but without a valid value.
 *
 * @description
 * This function searches for the --hatch flag in the command line arguments and interprets its value:
 *
 * 1. If the flag is not found, it returns `false`.
 * 2. If the flag is found with a value (e.g., --hatch=abc123), it returns the value if it's alphanumeric with hyphens.
 * 3. If the flag is found without a value but the next argument is alphanumeric with hyphens, it returns that next argument.
 * 4. In all other cases where the flag is present, it returns `true`.
 *
 * Valid values for the flag are strings containing only letters, numbers, and hyphens.
 *
 * @example
 * parseHatchFlag(["--hatch=abc123"]) // Returns "abc123"
 * parseHatchFlag(["--hatch", "def-456"]) // Returns "def-456"
 * parseHatchFlag(["--hatch"]) // Returns true
 * parseHatchFlag(["--other-flag"]) // Returns false
 */
export function parseHatchFlag(args: string[]): string | boolean {
  const hatchIndex = args.findIndex((arg) => arg.startsWith("--hatch"));

  if (hatchIndex === -1) {
    return false;
  }

  const hatchArg = args[hatchIndex];
  const parts = hatchArg.split("=");

  if (parts.length > 1) {
    // If there's a value after =, use it
    return parts[1].match(/^[a-zA-Z0-9-]+$/) ? parts[1] : true;
  }
  if (args[hatchIndex + 1] && /^[a-zA-Z0-9-]+$/.test(args[hatchIndex + 1])) {
    // If the next argument is alphanumeric with hyphens, use it
    return args[hatchIndex + 1];
  }
  // Otherwise, just set it to true
  return true;
}
