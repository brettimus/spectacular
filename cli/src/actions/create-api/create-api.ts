import { ApiAgentService } from "@/agents/api-agent";
import type { Context } from "@/context";
import { note, spinner } from "@clack/prompts";
import pico from "picocolors";
import { loadExistingSchema } from "./load-existing-schema";
import { saveApiCode } from "./save-api-code";
import { validateTypeScript } from "@/utils/typechecking";
import type { ErrorInfo } from "@/utils/typechecking/types";

export async function actionCreateApi(context: Context): Promise<void> {
  const s = spinner();
  s.start("Loading existing database schema");

  const { schemaPath, schema } = await loadExistingSchema(context);

  s.stop("Loaded existing schema");

  note(`Found schema at ${pico.cyan(schemaPath)}
The agent will use this schema to generate API endpoints.`);

  const apiAgent = new ApiAgentService();

  s.start("Generating API routes");
  const generationResult = await apiAgent.generateApiWithReasoning(context, {
    schema,
  });
  const indexTsContent = generationResult.indexTs;

  s.stop("Generated API routes");

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
  } else {
    s.stop(`TypeScript validation found ${apiErrors.length} errors`);
    
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
      } else {
        // Save the fixed API code
        s.start("Writing fixed API code to index.ts");
        const fixedSaveResult = await saveApiCode(
          context,
          fixResult.code,
          `${generationResult.reasoning}\n\n## Fix Applied\n\n${fixResult.explanation}`,
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
        } else {
          s.stop(`Fixed API code still has ${fixedApiErrors.length} TypeScript errors`);
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
    "Your API has been generated successfully! You can now start the service to test it."
  );
}
