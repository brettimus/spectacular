import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Context } from "../context";

const SPECTACULAR_HOME_DIR_NAME = ".spectacular_stuff";
const SPECTACULAR_HOME_DIR_PATH = path.join(
  os.homedir(),
  SPECTACULAR_HOME_DIR_NAME,
);

/**
 * Ensure the spectacular directory exists
 */
function ensureSpectacularHomeDir(): void {
  if (!fs.existsSync(SPECTACULAR_HOME_DIR_PATH)) {
    fs.mkdirSync(SPECTACULAR_HOME_DIR_PATH, { recursive: true });
  }
}

/**
 * Generate a filename-safe timestamp string (YYYY-MM-DD-HHMMSS)
 */
export function getTimestampForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Create a session log directory name with timestamp and project name
 */
export function createSessionDirName(context: Context): string {
  const timestamp = getTimestampForFilename();
  const projectName =
    context.specName?.replace(/[^\w-]/g, "-") || "unknown-project";

  return `${timestamp}_${projectName}`;
}

/**
 * Get or create a session log directory for the current context
 */
export function getSessionLogDir(context: Context): string {
  ensureSpectacularHomeDir();

  // Use sessionId to ensure same directory is used for the entire session
  if (!context.sessionId) {
    throw new Error("Context must have a sessionId for logging");
  }

  // Store the session directory in the context if it doesn't exist yet
  if (!context._logSessionDir) {
    context._logSessionDir = createSessionDirName(context);
  }

  const sessionDir = path.join(
    SPECTACULAR_HOME_DIR_PATH,
    context._logSessionDir,
  );

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  return sessionDir;
}

/**
 * Create a log filename with a prefix
 */
export function createLogFilename(prefix: string, extension = "json"): string {
  return `${prefix}.${extension}`;
}

/**
 * Log AI call inputs and outputs to a file in the session directory
 */
export function logAIInteraction(
  context: Context,
  actionName: string,
  stepName: string,
  input: unknown,
  output: unknown,
): void {
  try {
    const sessionDir = getSessionLogDir(context);
    const filename = createLogFilename(`${actionName}-${stepName}`);

    const logData = {
      timestamp: new Date().toISOString(),
      actionName,
      stepName,
      sessionId: context.sessionId,
      input,
      output,
    };

    const logPath = path.join(sessionDir, filename);
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), "utf-8");
  } catch (error) {
    console.error(
      `Error logging AI interaction for ${actionName}/${stepName}:`,
      error,
    );
  }
}

/**
 * Log action execution to a file in the session directory
 */
export function logActionExecution(
  context: Context,
  actionName: string,
  data: unknown,
): void {
  try {
    const sessionDir = getSessionLogDir(context);
    const filename = createLogFilename(`action-${actionName}`);

    const logData = {
      timestamp: new Date().toISOString(),
      actionName,
      sessionId: context.sessionId,
      contextInfo: {
        cwd: context.cwd,
        packageManager: context.packageManager,
        specPath: context.specPath,
      },
      data,
    };

    const logPath = path.join(sessionDir, filename);
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error logging action execution for ${actionName}:`, error);
  }
}

/**
 * Initialize a new session log directory for a command
 * This should be called at the beginning of each command
 */
export function initCommandLogSession(
  context: Context,
  commandName: string,
): void {
  try {
    // Create session log directory
    const sessionDir = getSessionLogDir(context);

    // Log the command start
    const filename = createLogFilename(`command-${commandName}-start`);
    const logPath = path.join(sessionDir, filename);

    const logData = {
      timestamp: new Date().toISOString(),
      command: commandName,
      sessionId: context.sessionId,
      contextInfo: {
        cwd: context.cwd,
        packageManager: context.packageManager,
        specPath: context.specPath,
        specName: context.specName,
      },
    };

    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), "utf-8");

    // Create a README.md explaining this directory
    const readmePath = path.join(sessionDir, "README.md");
    const readmeContent = `# ${context.specName || "Spectacular"} Log Session

Session ID: ${context.sessionId}
Generated: ${new Date().toISOString()}
Command: ${commandName}

This directory contains logs from a spectacular CLI command. 
The logs include inputs/outputs of AI interactions and command executions.
`;

    fs.writeFileSync(readmePath, readmeContent, "utf-8");
  } catch (error) {
    console.error("Error initializing command log session:", error);
  }
}
