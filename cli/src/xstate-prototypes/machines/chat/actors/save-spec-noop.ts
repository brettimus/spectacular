import { fromPromise } from "xstate";

// NOTE - This actor is a no-op because it is expected that if you need persistence,
//        you will use `.provide({ actors: { saveSpec: saveSpecSomewhereActor } })`
//        to override this adapter.

// Export the input type for the actor to be reused in tests
export interface SaveSpecActorInput {
  spec: string;
  specLocation: string;
}

export const saveSpecNoopActor = fromPromise<void, SaveSpecActorInput>(
  async () => {},
);
