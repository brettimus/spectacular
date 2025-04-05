import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type ErrorInfo,
  type ValidateTypescriptInputs,
  validateTypeScriptOnDisk,
} from "@/xstate-prototypes/typechecking";
import { fromPromise } from "xstate";

export const validateTypeScriptOnDiskActor = fromPromise<
  ErrorInfo[],
  ValidateTypescriptInputs
>(({ input, signal }) =>
  validateTypeScriptOnDisk(input.projectDir, input.packageManager, signal),
);

export const saveSpecToDiskActor = fromPromise<
  void,
  { spec: string; specLocation: string }
>(async ({ input }) => {
  await writeFile(input.specLocation, input.spec);
});

export const saveSchemaToDiskActor = fromPromise<
  void,
  { projectDir: string; schema: string }
>(async ({ input: { projectDir, schema } }) => {
  await saveSchemaToDisk(projectDir, schema);
});

async function saveSchemaToDisk(
  projectDir: string,
  schema: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "db", "schema.ts"), schema);
}

export const saveApiIndexToDiskActor = fromPromise<
  void,
  { projectDir: string; indexTs: string }
>(async ({ input: { projectDir, indexTs } }) => {
  await saveApiIndexToDisk(projectDir, indexTs);
});

async function saveApiIndexToDisk(
  projectDir: string,
  indexTs: string,
): Promise<void> {
  await writeFile(path.join(projectDir, "src", "index.ts"), indexTs);
}
