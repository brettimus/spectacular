import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fromPromise } from "xstate/actors";

export const saveSchemaToDiskActor = fromPromise<
  void,
  { projectDir: string; schema: string }
>(async ({ input: { projectDir, schema } }) => {
  await saveSchemaToDisk(projectDir, schema);
});

export async function saveSchemaToDisk(
  projectDir: string,
  schema: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "db", "schema.ts"), schema);
}
