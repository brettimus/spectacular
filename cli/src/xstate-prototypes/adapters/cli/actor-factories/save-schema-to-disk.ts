import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaveSchemaInput } from "@/xstate-prototypes/machines";
import { fromPromise } from "xstate";

export const createSaveSchemaToDiskActor = (projectDir: string) =>
  fromPromise<void, SaveSchemaInput>(async ({ input: { schema } }) => {
    await saveSchemaToDisk(projectDir, schema);
  });

async function saveSchemaToDisk(
  projectDir: string,
  schema: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "db", "schema.ts"), schema);
}
