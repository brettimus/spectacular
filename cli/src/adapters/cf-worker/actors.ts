import type {
  SaveApiActorInput,
  SaveFollowUpActorInput,
  SaveSchemaInput,
  SaveSpecActorInput,
} from "@/machines";
import { fromPromise } from "xstate";

export const saveFollowUpMessagesToApiActor = fromPromise<
  void,
  SaveFollowUpActorInput
>(async ({ input }) => {
  // TODO - Save the spec to the API
  console.log("[NOT YET IMPLEMENTED] Saving follow up messages", input);
});

export const saveSpecToApiActor = fromPromise<void, SaveSpecActorInput>(
  async ({ input }) => {
    // TODO - Save the spec to the API
    console.log("[NOT YET IMPLEMENTED] Saving spec to API", input);
  },
);

export const saveSchemaToApiActor = fromPromise<void, SaveSchemaInput>(
  async ({ input: { schema } }) => {
    // TODO - Save the schema to the API
    console.log("[NOT YET IMPLEMENTED] Saving schema to API", {
      schema,
    });
  },
);

export const saveApiIndexToApiActor = fromPromise<void, SaveApiActorInput>(
  async ({ input: { indexTs } }) => {
    // TODO - Save the API index to the API
    console.log("[NOT YET IMPLEMENTED] Saving API index to API", {
      indexTs,
    });
  },
);
