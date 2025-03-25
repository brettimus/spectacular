import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { createScorer } from "evalite";
import { cacheResult, getCachedResult } from "./cache";
import type { TypeScriptValidityResult } from "./types";

const execPromise = util.promisify(exec);

interface ErrorInfo {
  message: string;
  severity: 'error' | 'warning';
  location?: string;
}

/**
 * TypeScript Validity scorer that uses the TypeScript compiler to check for errors.
 */
export const TypeScriptValidity = createScorer<{ code: string; id: string }, never>({
  name: "TypeScript Validity",
  // For reference:
  // `input` comes from `data` and contains the code to validate and a unique ID
  // `expected` also comes from `data` but is not used in this scorer
  // `output` is the output of `task` but not used in this scorer
  scorer: async ({ input, expected: _expected, output: _output }) => {
    if (!input?.id) {
      throw new Error(
        "Code ID is required to score (and cache the score of) the TypeScript code.",
      );
    }

    // Check if we have a cached result for this code ID
    const cachedResult = getCachedResult(input.id);
    if (cachedResult) {
      console.log(`Using cached result for code ID: ${input.id}`);
      return cachedResult;
    }

    // No cached result, perform the validation
    const result = await validateTypeScript({
      code: input.code,
    });

    // Cache the result if we have a code ID
    if (input?.id) {
      return cacheResult(input.id, result);
    }

    return result;
  },
});

/**
 * Validates TypeScript code by writing it to a file in the project directory and running the TypeScript compiler.
 */
const validateTypeScript = async (opts: {
  code: string;
}): Promise<TypeScriptValidityResult> => {
  // Get the project directory (assuming we're in cli/evals)
  const currentDir = process.cwd();
  const projectDir = path.resolve(currentDir, '../'); // Go up one level to the project root
  
  // Create validation directory if it doesn't exist
  const validationDir = path.join(currentDir, 'validation');
  if (!fs.existsSync(validationDir)) {
    fs.mkdirSync(validationDir, { recursive: true });
  }
  
  // Create a unique filename for this validation
  const validationFile = path.join(validationDir, `validation-${Date.now()}.ts`);
  
  try {
    // Write the code to a file in the project directory
    fs.writeFileSync(validationFile, opts.code);
    
    let stderr = "";
    
    try {
      // First try using npm run typecheck
      const result = await execPromise(`cd ${projectDir} && npm run typecheck -- ${validationFile}`);
      stderr = result.stderr;
    } catch (_error) {
      console.log("npm run typecheck failed, falling back to direct tsc usage");
      
      try {
        // Fallback to direct tsc usage
        const fallbackResult = await execPromise(`cd ${projectDir} && npx tsc --noEmit ${validationFile}`);
        stderr = fallbackResult.stderr;
      } catch (fallbackError) {
        if (fallbackError instanceof Error && 'stderr' in fallbackError) {
          // If the command fails but still provides stderr output, we can use that for error detection
          stderr = (fallbackError as unknown as { stderr: string }).stderr;
        } else {
          // If we can't get stderr from the error, rethrow it
          throw fallbackError;
        }
      }
    }
    
    // If there's no stderr, the code is valid
    if (!stderr.trim()) {
      return {
        score: 1,
        metadata: {
          valid: true,
          errors: [],
          errorCount: 0,
          warningCount: 0,
        },
      };
    }
    
    // Parse the TypeScript compiler errors
    const errors = parseTypeScriptErrors(stderr);
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;
    
    // Calculate score based on error count (0 if there are errors, 1 if valid)
    const score = errorCount > 0 ? 0 : 1;
    
    return {
      score,
      metadata: {
        valid: errorCount === 0,
        errors,
        errorCount,
        warningCount,
      },
    };
  } catch (error) {
    // Handle execution errors
    return {
      score: 0,
      metadata: {
        valid: false,
        errors: [{
          message: `Failed to validate TypeScript: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        }],
        errorCount: 1,
        warningCount: 0,
      },
    };
  } finally {
    // Clean up validation file
    try {
      if (fs.existsSync(validationFile)) {
        fs.unlinkSync(validationFile);
      }
    } catch (error) {
      console.error("Error cleaning up validation file:", error);
    }
  }
};

/**
 * Parses TypeScript compiler error output into structured error objects.
 */
function parseTypeScriptErrors(stderr: string): ErrorInfo[] {
  const lines = stderr.split('\n').filter(Boolean);
  const errors: ErrorInfo[] = [];
  
  for (const line of lines) {
    // Ignore summary lines (like "Found 3 errors")
    if (line.startsWith('Found ') && line.includes(' error')) {
      continue;
    }
    
    // Parse error lines
    // Example format: file.ts(5,10): error TS2551: Property 'foo' does not exist on type 'Bar'.
    const match = line.match(/([^(]+)\((\d+),(\d+)\): (error|warning) (TS\d+): (.+)/);
    
    if (match) {
      const [, filePath, lineNum, column, severityText, code, message] = match;
      errors.push({
        message: `${code}: ${message}`,
        severity: severityText as 'error' | 'warning',
        location: `${path.basename(filePath)}:${lineNum}:${column}`,
      });
    } else {
      // For lines that don't match the expected format
      errors.push({
        message: line,
        severity: 'error',
      });
    }
  }
  
  return errors;
} 