import { fromPromise } from "xstate";
import type { AiResponseMessage } from "../../streaming";
import type { WithTrace } from "../../types";

export type SaveFollowUpActorInput = WithTrace<{
  followUpMessages: AiResponseMessage[];
}>;

/**
 *  NOTE - This actor is a no-op because it is expected that if you need persistence,
 *         you will use `.provide({ actors: { saveFollowUp: SaveFollowUpActorInput } })`
 *         to override this.
 */
export const saveFollowUpNoopActor = fromPromise<void, SaveFollowUpActorInput>(
  async () => {},
);
