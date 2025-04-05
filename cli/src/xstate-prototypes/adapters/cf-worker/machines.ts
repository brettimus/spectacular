import {
  apiCodegenMachine,
  chatMachine,
  dbSchemaCodegenMachine,
} from "@/xstate-prototypes/machines";
import {
  saveApiIndexToApiActor,
  saveSchemaToApiActor,
  saveSpecToApiActor,
} from "./actors";

export const cliChatMachine = chatMachine.provide({
  actors: {
    saveSpec: saveSpecToApiActor,
  },
  actions: {
    handleStreamChunk: (_, _params) => {
      // NOOP - But this is a good place to add logic to handle chunks of text from the streaming response
    },
    handleNewAssistantMessages: (_, _params) => {
      // NOOP - But this is a good place to add logic to handle new assistant messages after the streaming response has completed
      //        BUT, this will NOT fire after a spec is generated. for that, rely on the `saveSpec` actor.
    },
  },
});

export const cliSchemaCodegenMachine = dbSchemaCodegenMachine.provide({
  actors: {
    saveSchema: saveSchemaToApiActor,
  },
});

export const cliApiCodegenMachine = apiCodegenMachine.provide({
  actors: {
    saveApiIndex: saveApiIndexToApiActor,
  },
});
