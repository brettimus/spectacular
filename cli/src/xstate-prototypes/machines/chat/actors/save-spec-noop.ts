import { fromPromise } from "xstate";

// NOTE - This actor is a no-op because it is expected that if you need persistence,
//        you will use `.provide({ actors: { saveSpec: saveSpecSomewhereActor } })`
//        to override this adapter.
export const saveSpecNoopActor = fromPromise<
  void,
  { spec: string; specLocation: string }
>(async () => {});
