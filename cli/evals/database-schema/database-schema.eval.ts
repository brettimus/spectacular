import { evalite } from "evalite";
import { SchemaTypeScriptValidity } from "../scorers/typescript-validity";
import { getAllSpectacularSpecFiles } from "../utils";
import { SchemaAgentService } from "../../src/agents/schema-agent";
import type { DatabaseSchemaEvalInput } from "./types";
import path from "node:path";
import { getEvalRunProjectDir } from "../runner-utils";

// Use a timestamp as the run ID
const runId = new Date().toISOString().replace(/[:.]/g, "_");

/**
 * Get the test data for the eval - In this case we want to use a bunch of pre existing specs
 */
function getTestData(
  runDirectory: string,
): { input: DatabaseSchemaEvalInput }[] {
  return getAllSpectacularSpecFiles().map((specFileDetails) => ({
    input: {
      runId,
      runDirectory,
      specFileDetails,
    },
  }));
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
    const agent = new SchemaAgentService();
    const { code } = await agent.getSchemaFromSpec(input.specFileDetails.spec);

    // TODO - Cache result in case we are watching files!!!

    return { code };
  },
  // The scoring methods for the eval
  scorers: [SchemaTypeScriptValidity],
});
