import type { Message } from "ai";
import { getPackageManager, randomId } from "./utils/utils";
import { getApiKey } from "./utils/credentials";

export interface Context {
  apiKey?: string;

  cwd: string;

  /**
   * The path to the project folder
   */
  projectPath?: string;

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
   * The contents of the schema file
   */
  schemaFile?: string;

  /**
   * The path to the rules directory
   */
  rulesDir?: string;

  /**
   * A random id for the current session.
   * Can be useful for saving log files or other metadata.
   */
  sessionId: string;
}

export function initContext(): Context {
  return {
    // First try environment variable, then try saved credentials
    apiKey: process.env.OPENAI_API_KEY || getApiKey(),
    cwd: process.env.SPECTACULAR_CWD || process.cwd(),
    packageManager: getPackageManager() ?? "npm",

    messages: [],

    sessionId: randomId(),
  };
}
