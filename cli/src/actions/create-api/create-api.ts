import { ApiAgentService } from "@/agents/api-agent";
import type { Context } from "@/context";
import { note, spinner } from "@clack/prompts";
import pico from "picocolors";
import { loadExistingSchema } from "./load-existing-schema";
import { saveApiCode } from "./save-api-code";
import { validateTypeScript } from "@/utils/typechecking";
import type { ErrorInfo } from "@/utils/typechecking/types";
import { initCommandLogSession, logActionExecution } from "../../utils/logging";
import { removeCwd } from "@/utils";

export async function actionCreateApi(context: Context): Promise<void> {
  // Initialize log session for this command
  initCommandLogSession(context, "create-api");

  const s = spinner();
  s.start("Loading existing database schema");

  // Log action start
  logActionExecution(context, "create-api-start", {
    cwd: context.cwd,
    timestamp: new Date().toISOString(),
  });

  const { schemaPath, schema } = await loadExistingSchema(context);

  s.stop("Loaded existing schema");

  let relativeSchemaPath = removeCwd(context, schemaPath);
  if (relativeSchemaPath?.startsWith("/")) {
    relativeSchemaPath = relativeSchemaPath.slice(1);
  }
  note(`Found schema at ${pico.cyan(relativeSchemaPath)}
The agent will use this schema to generate API endpoints.`);

  const apiAgent = new ApiAgentService();

  s.start("Generating API routes");
  const generationResult = await apiAgent.generateApiWithReasoning(context, {
    schema,
  });
  const indexTsContent = generationResult.indexTs;

  s.stop("Generated API routes");

  // Log API routes generation
  logActionExecution(context, "create-api-routes-generated", {
    schemaPath,
    reasoningLength: generationResult.reasoning.length,
    codeLength: indexTsContent.length,
  });

  // s.start("Verifying API code");
  // const verificationResult = await apiAgent.verifyApi(context, {
  //   schema,
  //   apiCode: indexTsContent,
  // });
  // s.stop("Verified API code");

  // if (verificationResult.issues.length > 0) {
  //   note(
  //     pico.yellow(
  //       `Found ${verificationResult.issues.length} potential issues with the generated API:`,
  //     ),
  //   );

  //   verificationResult.issues.forEach((issue: string, index: number) => {
  //     console.log(`${index + 1}. ${pico.yellow(issue)}`);
  //   });
  // }

  s.start("Writing API code to index.ts");
  const firstSaveResult = await saveApiCode(
    context,
    indexTsContent,
    generationResult.reasoning,
  );

  if (firstSaveResult.reasoningPath) {
    s.stop(
      `API code written to ${pico.cyan(firstSaveResult.indexTsPath)}, reasoning saved to ${pico.cyan(firstSaveResult.reasoningPath)}`,
    );
  } else {
    s.stop(
      `API code successfully written to ${pico.cyan(firstSaveResult.indexTsPath)}`,
    );
  }

  // Log API code save
  logActionExecution(context, "create-api-code-saved", {
    indexTsPath: firstSaveResult.indexTsPath,
    reasoningPath: firstSaveResult.reasoningPath,
  });

  // Validate with TypeScript compiler
  s.start("Running TypeScript validation");
  const typescriptErrors = await validateTypeScript(
    context.cwd,
    context.packageManager,
  );
  const apiErrors = typescriptErrors.filter((e: ErrorInfo) =>
    e?.location?.includes("index.ts"),
  );

  if (apiErrors.length === 0) {
    s.stop("TypeScript validation passed successfully");

    // Log successful validation
    logActionExecution(context, "create-api-validation-success", {
      timestamp: new Date().toISOString(),
    });
  } else {
    s.stop(`TypeScript validation found ${apiErrors.length} errors`);

    // Log validation errors
    logActionExecution(context, "create-api-validation-errors", {
      errorCount: apiErrors.length,
      errors: apiErrors.map((e) => ({
        message: e.message,
        severity: e.severity,
        location: e.location,
      })),
    });

    note(
      pico.yellow(
        `Found ${apiErrors.length} TypeScript errors in the generated API. Attempting to fix...`,
      ),
    );

    // Analyze the TypeScript errors
    s.start("Analyzing TypeScript errors");
    const errorAnalysis = await apiAgent.analyzeApiErrors(
      context,
      indexTsContent,
      apiErrors,
    );
    s.stop("TypeScript errors analyzed");

    if (!errorAnalysis) {
      note(
        pico.red(
          "Failed to analyze TypeScript errors.\nPlease check the generated code manually.",
        ),
      );

      // Log analysis failure
      logActionExecution(context, "create-api-error-analysis-failed", {
        timestamp: new Date().toISOString(),
      });
    } else {
      // Fix the API code
      s.start("Fixing API code");
      const fixResult = await apiAgent.fixApiErrors(
        context,
        errorAnalysis.text,
        indexTsContent,
      );
      s.stop("Generated fixed API code");

      if (!fixResult) {
        note(
          pico.red(
            "Failed to fix TypeScript errors. Please check the generated code manually.",
          ),
        );

        // Log fix failure
        logActionExecution(context, "create-api-fix-failed", {
          timestamp: new Date().toISOString(),
        });
      } else {
        // Save the fixed API code
        s.start("Writing fixed API code to index.ts");
        const fixedSaveResult = await saveApiCode(
          context,
          fixResult.code,
          `${generationResult.reasoning}\n\n## Fix Applied\n\n${fixResult.code}`,
        );

        if (fixedSaveResult.reasoningPath) {
          s.stop(
            `Fixed API code written to ${pico.cyan(fixedSaveResult.indexTsPath)}, reasoning saved to ${pico.cyan(fixedSaveResult.reasoningPath)}`,
          );
        } else {
          s.stop(
            `Fixed API code successfully written to ${pico.cyan(fixedSaveResult.indexTsPath)}`,
          );
        }

        // Log fixed code save
        logActionExecution(context, "create-api-fixed-code-saved", {
          indexTsPath: fixedSaveResult.indexTsPath,
          reasoningPath: fixedSaveResult.reasoningPath,
        });

        // Validate fixed code with TypeScript again
        s.start("Validating fixed API code");
        const fixedTypescriptErrors = await validateTypeScript(
          context.cwd,
          context.packageManager,
        );
        const fixedApiErrors = fixedTypescriptErrors.filter((e: ErrorInfo) =>
          e?.location?.includes("index.ts"),
        );

        if (fixedApiErrors.length === 0) {
          s.stop("Fixed API code compiles successfully");

          // Log successful validation after fix
          logActionExecution(context, "create-api-fixed-validation-success", {
            timestamp: new Date().toISOString(),
          });
        } else {
          s.stop(
            `Fixed API code still has ${fixedApiErrors.length} TypeScript errors`,
          );

          // Log remaining errors after fix
          logActionExecution(context, "create-api-fixed-validation-errors", {
            errorCount: fixedApiErrors.length,
            errors: fixedApiErrors.map((e) => ({
              message: e.message,
              severity: e.severity,
              location: e.location,
            })),
          });

          note(
            pico.yellow(
              "Some TypeScript errors could not be automatically fixed. Please review and fix the generated code manually.",
            ),
          );
        }
      }
    }
  }

  note(
    "Your API has been generated successfully! You can now start the service to test it.",
  );

  // Log action completion
  logActionExecution(context, "create-api-complete", {
    timestamp: new Date().toISOString(),
  });
}
