import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import type { ErrorInfo } from "./types";
import { isExecError } from "./types";
import { fromPromise } from "xstate";

const execPromise = util.promisify(exec);

type ValidateTypescriptInputs = {
  projectDir: string;
  packageManager?: string;
};

// type PromiseArgs<InputsType = unknown> = Parameters<Parameters<typeof fromPromise>[0]>[0] & { input: InputsType }

export const validateTypeScriptActor = fromPromise<
  ErrorInfo[],
  ValidateTypescriptInputs
>(({ input, signal }) =>
  validateTypeScript(input.projectDir, input.packageManager, signal),
);

/**
 * Validates TypeScript code by writing it to a file in the project directory and running the TypeScript compiler.
 */
export async function validateTypeScript(
  projectDir: string,
  packageManager = "npm",
  signal?: AbortSignal,
): Promise<ErrorInfo[]> {
  if (!fs.existsSync(projectDir)) {
    throw new Error("Directory to project does not exist");
  }

  try {
    let output = "";
    let result: Awaited<ReturnType<typeof execPromise>>;

    try {
      // Execute the typecheck command - only works on *nix systems
      result = await execPromise(`${packageManager} run typecheck`, {
        cwd: projectDir,
        signal,
      });
      // Capture both stdout and stderr
      output =
        (result.stdout?.toString() || "") + (result.stderr?.toString() || "");
    } catch (execError) {
      // When tsc finds type errors, it exits with non-zero code, which causes exec to throw
      if (isExecError(execError)) {
        const stdout = execError.stdout?.toString() || "";
        const stderr = execError.stderr?.toString() || "";
        output = stdout + stderr;
      } else {
        console.error(
          "[validateTypeScript] Not a recognized exec error:",
          execError,
        );
        throw execError; // Re-throw if it's not the expected error format
      }
    }

    // Parse the TypeScript compiler errors
    return parseTypeScriptErrors(output);
  } catch (error) {
    console.error("[validateTypeScript] error", error);
    throw error;
  }
}

/**
 * Parses TypeScript compiler error output into structured error objects.
 */
function parseTypeScriptErrors(output: string): ErrorInfo[] {
  const lines = output.split("\n").filter(Boolean);
  const errors: ErrorInfo[] = [];

  let currentError: Partial<ErrorInfo> | null = null;
  let indentedErrorContinuation = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignore summary lines (like "Found 3 errors")
    if (line.startsWith("Found ") && line.includes(" error")) {
      continue;
    }

    // Ignore npm script output lines (like "> typecheck" or "> tsc --noEmit")
    if (line.startsWith("> ")) {
      continue;
    }

    // Check if this line is an indented continuation of a previous error
    if (line.startsWith("  ")) {
      if (currentError) {
        // Append this line to the current error message
        currentError.message = `${currentError.message}\n${line}`;
        indentedErrorContinuation = true;
      }
      continue;
    }

    // If we were processing a multi-line error and now hit a non-indented line,
    // push the completed error to the array
    if (indentedErrorContinuation && currentError) {
      errors.push(currentError as ErrorInfo);
      currentError = null;
      indentedErrorContinuation = false;
    }

    // Parse error lines
    // Example format: file.ts(5,10): error TS2551: Property 'foo' does not exist on type 'Bar'.
    const match = line.match(
      /([^(]+)\((\d+),(\d+)\): (error|warning) (TS\d+): (.+)/,
    );

    if (match) {
      const [, filePath, lineNum, column, severityText, code, message] = match;

      // If we have a pending error, add it first
      if (currentError && !indentedErrorContinuation) {
        errors.push(currentError as ErrorInfo);
      }

      // Create a new error
      currentError = {
        message: `${code}: ${message}`,
        severity: severityText as "error" | "warning",
        location: `${path.basename(filePath)}:${lineNum}:${column}`,
      };

      // Check if the next line is indented (part of this error)
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      if (!nextLine.startsWith("  ")) {
        // No continuation, so add this error to the list immediately
        errors.push(currentError as ErrorInfo);
        currentError = null;
      }
    } else if (line.includes("error TS")) {
      // Try to handle other TS error formats that might not match the regex above
      const tsErrorMatch = line.match(/error (TS\d+): (.+)/);
      if (tsErrorMatch) {
        const [, code, message] = tsErrorMatch;

        // If we have a pending error, add it first
        if (currentError && !indentedErrorContinuation) {
          errors.push(currentError as ErrorInfo);
        }

        currentError = {
          message: `${code}: ${message}`,
          severity: "error",
        };

        // Check for continuation
        const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
        if (!nextLine.startsWith("  ")) {
          errors.push(currentError as ErrorInfo);
          currentError = null;
        }
      } else {
        // For lines that don't match the expected format but still seem to be errors
        if (currentError && !indentedErrorContinuation) {
          errors.push(currentError as ErrorInfo);
        }

        currentError = {
          message: line,
          severity: "error",
        };

        // Check for continuation
        const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
        if (!nextLine.startsWith("  ")) {
          errors.push(currentError as ErrorInfo);
          currentError = null;
        }
      }
    }
  }

  // Don't forget to add the last error if we have one pending
  if (currentError) {
    errors.push(currentError as ErrorInfo);
  }

  return errors;
}
