import { evalite } from "evalite";
import { SchemaTypeScriptValidity } from "./scorers/typescript-validity";
import { getAllSpectacularSpecFiles, type SpectacularSpecFile } from "./utils";
import { SchemaAgentService } from "../src/agents/schema-agent";

// Prompts for generating TypeScript code

function getTestData(): { input: SpectacularSpecFile }[] {
  return getAllSpectacularSpecFiles().map((spec) => ({
    input: spec,
  }));
}

// Current working directory should be path to `cli` dir - since that is where PNPM executes the script...

evalite("LLM-Generated TypeScript Validity Evaluation", {
  // A function that returns an array of test data
  data: async () => {
    return getTestData();
  },
  // The task to perform - generate Drizzle ORM `schema.ts` code with an LLM
  task: async (input: SpectacularSpecFile) => {
    const agent = new SchemaAgentService();
    const { code } = await agent.getSchemaFromSpec(input.spec);

    // TODO - Cache result in case we are watching!

    return { code };
  },
  // The scoring methods for the eval
  scorers: [SchemaTypeScriptValidity],
});
