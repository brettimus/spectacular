import {
  apiCodegenMachine,
  chatMachine,
  dbSchemaCodegenMachine,
} from "@/xstate-prototypes/machines";
import {
  saveFollowUpMessagesToApiActor,
  saveApiIndexToApiActor,
  saveSchemaToApiActor,
  saveSpecToApiActor,
} from "./actors";

export const cfChatMachine = chatMachine.provide({
  actors: {
    saveSpec: saveSpecToApiActor,
    saveFollowUp: saveFollowUpMessagesToApiActor,
  },
  actions: {
    handleStreamChunk: (_, _params) => {
      // NOOP - But this is a good place to add logic to handle chunks of text from the streaming response
    },
  },
});

export const cfSchemaCodegenMachine = dbSchemaCodegenMachine.provide({
  actors: {
    saveSchema: saveSchemaToApiActor,
  },
});

export const cfApiCodegenMachine = apiCodegenMachine.provide({
  actors: {
    saveApiIndex: saveApiIndexToApiActor,
  },
});
