import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaveApiActorInput } from "../../../machines";
import { fromPromise } from "xstate";

export const createSaveApiIndexToDiskActor = (projectDir: string) =>
  fromPromise<void, SaveApiActorInput>(async ({ input: { indexTs } }) => {
    await saveApiIndexToDisk(projectDir, indexTs);
  });

async function saveApiIndexToDisk(
  projectDir: string,
  indexTs: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "index.ts"), indexTs);
}
