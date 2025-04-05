import { fromPromise } from "xstate";

export const saveSpecToApiActor = fromPromise<
  void,
  { spec: string; specLocation: string }
>(async ({ input }) => {
  // TODO - Save the spec to the API
  console.log("[NOT YET IMPLEMENTED] Saving spec to API", input);
});

export const saveSchemaToApiActor = fromPromise<
  void,
  { projectDir: string; schema: string }
>(async ({ input: { projectDir, schema } }) => {
  // TODO - Save the schema to the API
  console.log("[NOT YET IMPLEMENTED] Saving schema to API", {
    projectDir,
    schema,
  });
});

export const saveApiIndexToApiActor = fromPromise<
  void,
  { projectDir: string; indexTs: string }
>(async ({ input: { projectDir, indexTs } }) => {
  // TODO - Save the API index to the API
  console.log("[NOT YET IMPLEMENTED] Saving API index to API", {
    projectDir,
    indexTs,
  });
});
