import fs from "node:fs";
import path from "node:path";
import { createScorer } from "evalite";
import { validateTypeScript } from "../../../src/utils/typechecking";
import {
  createNewProject,
  getProjectLogger,
  getProjectNameFromSpecFile,
} from "../../runner-utils";
import type { EvalLogger } from "../../runner-utils";
import type { TypeScriptValidityResult } from "./types";
import type { ApiRoutesEvalInput } from "../../api-routes";

/**
 * TypeScript Validity scorer that uses the TypeScript compiler to check for errors.
 */
export const ApiTypeScriptValidity = createScorer<
  ApiRoutesEvalInput,
  { code: string }
>({
  name: "TypeScript Validity",
  // For reference:
  // `input` comes from `data` and contains the code to validate and a unique ID
  // `expected` also comes from `data` but is not used in this scorer
  // `output` is the output of `task` but not used in this scorer
  scorer: async ({ input, expected: _expected, output }) => {
    const { runDirectory, specFileDetails, runId } = input;
    const projectName = getProjectNameFromSpecFile(specFileDetails);
    const projectDir = await createNewProject(runDirectory, projectName);

    // Create a logger for the validation process
    const logger = getProjectLogger(
      projectDir,
      runId,
      "api-typescript-validity",
    );

    const result = await typecheckCode({
      schemaTs: input.schemaFileDetails.schema,
      indexTs: output.code,
      projectDir,
      logger,
    });

    return result;
  },
});

/**
 * Validates TypeScript code by writing it to a file in the project directory and running the TypeScript compiler.
 */
const typecheckCode = async (opts: {
  schemaTs: string;
  indexTs: string;
  projectDir: string;
  logger: EvalLogger;
}): Promise<TypeScriptValidityResult> => {
  const { schemaTs, indexTs, projectDir, logger } = opts;

  if (!fs.existsSync(projectDir)) {
    throw new Error("Directory to store project does not exist");
  }

  const dbSchemaFilePath = path.join(projectDir, "src", "db", "schema.ts");
  const indexTsFilePath = path.join(projectDir, "src", "index.ts");

  try {
    console.log(
      "[ApiTypeScriptValidity] Writing code to db/schema.ts",
      schemaTs.slice(0, 100),
      "...",
    );
    // Write the code to the `db/schema.ts` file
    fs.writeFileSync(dbSchemaFilePath, schemaTs);

    console.log(
      "[ApiTypeScriptValidity] Writing code to index.ts",
      indexTs.slice(0, 100),
      "...",
    );
    // Write the code to the `index.ts` file
    fs.writeFileSync(indexTsFilePath, indexTs);

    const validationResult = await validateTypeScript(projectDir);

    console.log("[ApiTypeScriptValidity] validationResult", validationResult);

    const apiErrors = validationResult.filter(
      (e) =>
        e.location?.includes("schema.ts") || e.location?.includes("index.ts"),
    );

    // Log the validation errors
    if (apiErrors.length > 0) {
      logger.logError({
        context: "api_validation",
        errors: apiErrors,
      });
    }

    // If there's no stderr, the code is valid
    if (!apiErrors.length) {
      logger.logInfo({
        message: "TypeScript validation passed with no errors",
      });
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
    const errorCount = apiErrors.filter((e) => e.severity === "error").length;
    const warningCount = apiErrors.filter(
      (e) => e.severity === "warning",
    ).length;

    // Calculate score based on error count (0 if there are errors, 1 if valid)
    const score = errorCount > 0 ? 0 : 1;

    return {
      score,
      metadata: {
        valid: errorCount === 0,
        errors: apiErrors,
        errorCount,
        warningCount,
      },
    };
  } catch (error) {
    // Log and handle execution errors
    logger.logError({
      context: "api_validation_error",
      message: `Failed to validate TypeScript: ${error instanceof Error ? error.message : String(error)}`,
      error,
    });

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
  }
};
