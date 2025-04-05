import { fromPromise } from "xstate";

export const saveSchemaNoopActor = fromPromise<
  void,
  { projectDir: string; schema: string }
>(async () => {});
