import fs from "node:fs";
import path from "node:path";

export type LogEntryType =
  | "input_schema"
  | "output_schema"
  | "input_api"
  | "output_api"
  | "error"
  | "info";

export interface LogEntry {
  timestamp: string;
  type: LogEntryType;
  data: unknown;
  scope: string;
}

export class EvalLogger {
  private filePath: string;
  private projectDir: string;
  // private runId: string;
  private scope: string;

  constructor(projectDir: string, runId: string, scope = "default") {
    this.projectDir = projectDir;
    // this.runId = runId;
    this.scope = scope;
    this.filePath = path.join(projectDir, `spectacular-eval-${runId}.json`);
    this.initLogFile();
  }

  private initLogFile() {
    if (!fs.existsSync(this.projectDir)) {
      fs.mkdirSync(this.projectDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  private appendToLog(entry: Omit<LogEntry, "scope">) {
    try {
      const logs = JSON.parse(
        fs.readFileSync(this.filePath, "utf-8"),
      ) as LogEntry[];
      logs.push({
        ...entry,
        scope: this.scope,
      });
      fs.writeFileSync(this.filePath, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error(`Failed to append to log file: ${error}`);
    }
  }

  logSchemaInput(input: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "input_schema",
      data: input,
    });
  }

  logSchemaOutput(output: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "output_schema",
      data: output,
    });
  }

  logApiInput(input: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "input_api",
      data: input,
    });
  }

  logApiOutput(output: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "output_api",
      data: output,
    });
  }

  logError(error: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "error",
      data: error,
    });
  }

  logInfo(info: unknown) {
    this.appendToLog({
      timestamp: new Date().toISOString(),
      type: "info",
      data: info,
    });
  }
}

/**
 * Gets or creates a logger for a specific project and run ID.
 *
 * @param projectDir - The directory of the project
 * @param runId - The run ID
 * @param scope - Optional scope for the logger
 * @returns An EvalLogger instance
 */
export function getProjectLogger(
  projectDir: string,
  runId: string,
  scope = "default",
): EvalLogger {
  return new EvalLogger(projectDir, runId, scope);
}
