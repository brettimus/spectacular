import fs from "node:fs";
import path from "node:path";
import { createScorer } from "evalite";
import type { SpectacularSpecFile } from "../../utils";
import { validateTypeScript } from "../../../src/utils/typechecking";
import type { TypeScriptValidityResult } from "./types";

/**
 * TypeScript Validity scorer that uses the TypeScript compiler to check for errors.
 */
export const SchemaTypeScriptValidity = createScorer<
  SpectacularSpecFile,
  { code: string }
>({
  name: "TypeScript Validity",
  // For reference:
  // `input` comes from `data` and contains the code to validate and a unique ID
  // `expected` also comes from `data` but is not used in this scorer
  // `output` is the output of `task` but not used in this scorer
  scorer: async ({ input: _input, expected: _expected, output }) => {
    // if (!input?.fullPath) {
    //   throw new Error(
    //     "Full path is required to score (and cache the score of) the TypeScript code.",
    //   );
    // }

    const result = await typecheckCode({
      code: output.code,
    });

    return result;
  },
});

/**
 * Validates TypeScript code by writing it to a file in the project directory and running the TypeScript compiler.
 */
const typecheckCode = async (opts: {
  code: string;
}): Promise<TypeScriptValidityResult> => {
  // Current working directory because it should be path to `cli` dir
  // since that is where PNPM executes the eval script.
  const cliDir = process.cwd();
  const projectDir = path.join(cliDir, "..", "eval-repos", "schema-validation");

  if (!fs.existsSync(projectDir)) {
    throw new Error("Directory to store project does not exist");
  }

  const dbSchemaFilePath = path.join(projectDir, "src", "db", "schema.ts");

  try {
    console.log(
      "[SchemaTypeScriptValidity] Writing code to db/schema.ts",
      opts.code.slice(0, 100),
      "...",
    );
    // Write the code to the `db/schema.ts` file
    fs.writeFileSync(dbSchemaFilePath, opts.code);

    const validationResult = await validateTypeScript(projectDir);

    console.log(
      "[SchemaTypeScriptValidity] validationResult",
      validationResult,
    );

    const schemaErrors = validationResult.filter((e) =>
      e.location?.includes("schema.ts"),
    );

    // If there's no stderr, the code is valid
    if (!schemaErrors.length) {
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
    // const errors = parseTypeScriptErrors(stderr);
    const errorCount = schemaErrors.filter(
      (e) => e.severity === "error",
    ).length;
    const warningCount = schemaErrors.filter(
      (e) => e.severity === "warning",
    ).length;

    // Calculate score based on error count (0 if there are errors, 1 if valid)
    const score = errorCount > 0 ? 0 : 1;

    return {
      score,
      metadata: {
        valid: errorCount === 0,
        errors: schemaErrors,
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
        errors: [
          {
            message: `Failed to validate TypeScript: ${error instanceof Error ? error.message : String(error)}`,
            severity: "error",
          },
        ],
        errorCount: 1,
        warningCount: 0,
      },
    };
  } finally {
    // Clean up validation file
    try {
      if (fs.existsSync(dbSchemaFilePath)) {
        // fs.unlinkSync(dbSchemaFilePath);
      }
    } catch (error) {
      console.error("Error cleaning up validation file:", error);
    }
  }
};

/**
 * Parses TypeScript compiler error output into structured error objects.
 */
// function parseTypeScriptErrors(stderr: string): ErrorInfo[] {
//   const lines = stderr.split("\n").filter(Boolean);
//   const errors: ErrorInfo[] = [];

//   for (const line of lines) {
//     // Ignore summary lines (like "Found 3 errors")
//     if (line.startsWith("Found ") && line.includes(" error")) {
//       continue;
//     }

//     // Parse error lines
//     // Example format: file.ts(5,10): error TS2551: Property 'foo' does not exist on type 'Bar'.
//     const match = line.match(
//       /([^(]+)\((\d+),(\d+)\): (error|warning) (TS\d+): (.+)/,
//     );

//     if (match) {
//       const [, filePath, lineNum, column, severityText, code, message] = match;
//       errors.push({
//         message: `${code}: ${message}`,
//         severity: severityText as "error" | "warning",
//         location: `${path.basename(filePath)}:${lineNum}:${column}`,
//       });
//     } else {
//       // For lines that don't match the expected format
//       errors.push({
//         message: line,
//         severity: "error",
//       });
//     }
//   }

//   return errors;
// }
