import path from "node:path";
import { validateTypeScript } from "./typecheck";

manuallyCheckTypeScript();

/**
 * Manually check the TypeScript code in the schema-validation project.
 */
export async function manuallyCheckTypeScript() {
  // Current working directory because it should be path to `cli` dir
  // since that is where PNPM executes the eval script.
  const cliDir = process.cwd();
  const projectDir = path.join(cliDir, "..", "eval-repos", "schema-validation");

  const dbSchemaFilePath = path.join(projectDir, "src", "db", "schema.ts");

  const result = await validateTypeScript(projectDir, dbSchemaFilePath);

  console.log(JSON.stringify(result, null, 2));
}
