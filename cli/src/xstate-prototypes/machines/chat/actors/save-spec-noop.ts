import { fromPromise } from "xstate";

// NOTE - This actor is a no-op because it is expected that if you need persistence,
//        you will use `.provide({ actors: { saveSpec: saveSpecSomewhereActor } })`
//        to override this adapter.

export type SaveSpecActorInput = {
  /**
   * I'm actually not certain the filename is relevant as an input,
   * or if that detail should be left to the actor implementation
   */
  filename: string;
  title: string;
  content: string;
};

export const saveSpecNoopActor = fromPromise<void, SaveSpecActorInput>(
  async () => {},
);
