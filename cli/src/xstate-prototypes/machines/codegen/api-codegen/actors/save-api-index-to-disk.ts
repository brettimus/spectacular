import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fromPromise } from "xstate/actors";

export const saveApiIndexToDiskActor = fromPromise<
  void,
  { projectDir: string; indexTs: string }
>(async ({ input: { projectDir, indexTs } }) => {
  await saveApiIndexToDisk(projectDir, indexTs);
});

export async function saveApiIndexToDisk(
  projectDir: string,
  indexTs: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "index.ts"), indexTs);
}
