import path from "node:path";
import { evalite } from "evalite";
import { SchemaAgentService } from "../../src/agents/schema-agent";
import {
  getEvalRunProjectDir,
  getProjectLogger,
  getProjectNameFromSpecFile,
} from "../runner-utils";
import { SchemaTypeScriptValidity } from "../scorers/typescript-validity";
import { getAllSpectacularSpecFiles } from "../utils";
import type { DatabaseSchemaEvalInput } from "./types";

// Use a timestamp as the run ID
const runId = new Date().toISOString().replace(/[:.]/g, "_");

/**
 * Get the test data for the eval - In this case we want to use a bunch of pre existing specs
 */
function getTestData(
  runDirectory: string,
): { input: DatabaseSchemaEvalInput }[] {
  return getAllSpectacularSpecFiles().map((specFileDetails) => {
    const projectName = getProjectNameFromSpecFile(specFileDetails);
    const projectDir = path.join(runDirectory, projectName);

    // Create a logger and log the input data
    const logger = getProjectLogger(projectDir, runId, "setup");
    const input = {
      runId,
      runDirectory,
      specFileDetails,
      projectDir,
    };
    logger.logSchemaInput(input);

    return { input };
  });
}

evalite("LLM-Generated TypeScript Validity Evaluation", {
  // A function that returns an array of test data
  // **Side effect**:
  //   Will create a directory for the run
  //   which helps us store project files to execute the task
  data: async () => {
    // cwd should be the root of the eval repo, since that's where pnpm runs the eval script
    const evalReposDir = path.join(process.cwd(), "..", "eval-repos");

    const runDirectory = await getEvalRunProjectDir(evalReposDir, runId);

    return getTestData(runDirectory);
  },
  // The task to perform - generate Drizzle ORM `schema.ts` code with an LLM
  task: async (input: DatabaseSchemaEvalInput) => {
    // Create a project-specific logger
    const projectName = path.basename(
      input.specFileDetails.fileName,
      path.extname(input.specFileDetails.fileName),
    );
    const projectDir = path.join(input.runDirectory, projectName);
    const logger = getProjectLogger(projectDir, runId, "task");

    const agent = new SchemaAgentService();
    const { code } = await agent.getSchemaFromSpec(input.specFileDetails.spec);

    // Log the output of the task
    const output = { code };
    logger.logSchemaOutput(output);

    // TODO - Cache result in case we are watching files!!!

    return output;
  },
  // The scoring methods for the eval
  scorers: [SchemaTypeScriptValidity],
});
