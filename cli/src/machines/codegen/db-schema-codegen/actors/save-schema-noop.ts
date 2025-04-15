import { fromPromise } from "xstate";

export type SaveSchemaInput = { schema: string };

export const saveSchemaNoopActor = fromPromise<void, SaveSchemaInput>(
  async () => {},
);
