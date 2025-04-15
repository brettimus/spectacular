import { fromPromise } from "xstate";

export type SaveApiActorInput = { indexTs: string };

export const saveApiIndexNoopActor = fromPromise<void, SaveApiActorInput>(
  async () => {},
);
