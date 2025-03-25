import type { Context } from "@/context";
import { note, spinner } from "@clack/prompts";
import pico from "picocolors";
import { loadExistingSchema } from "./load-existing-schema";
import { saveApiCode } from "./save-api-code";
import { ApiAgentService } from "@/agents/api-agent";

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

  s.start("Verifying API code");
  const verificationResult = await apiAgent.verifyApi(context, {
    schema,
    apiCode: indexTsContent,
  });
  s.stop("Verified API code");

  if (verificationResult.issues.length > 0) {
    note(
      pico.yellow(
        `Found ${verificationResult.issues.length} potential issues with the generated API:`,
      ),
    );

    verificationResult.issues.forEach((issue: string, index: number) => {
      console.log(`${index + 1}. ${pico.yellow(issue)}`);
    });
  }

  // TODO: In the future, we will build verification by trying to compile or test the API

  s.start("Writing API code to index.ts");
  const saveResult = await saveApiCode(
    context,
    indexTsContent,
    generationResult.reasoning,
  );

  if (saveResult.reasoningPath) {
    s.stop(
      `API code written to ${pico.cyan(saveResult.indexTsPath)}, reasoning saved to ${pico.cyan(saveResult.reasoningPath)}`,
    );
  } else {
    s.stop(
      `API code successfully written to ${pico.cyan(saveResult.indexTsPath)}`,
    );
  }
}
