import { fromPromise } from "xstate";

export const saveApiIndexNoopActor = fromPromise<
  void,
  { projectDir: string; indexTs: string }
>(async () => {});
