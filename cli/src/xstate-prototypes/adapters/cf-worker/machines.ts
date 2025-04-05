import {
  chatMachine,
  schemaCodegenMachine,
  apiCodegenMachine,
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
});

export const cliSchemaCodegenMachine = schemaCodegenMachine.provide({
  actors: {
    saveSchema: saveSchemaToApiActor,
  },
});

export const cliApiCodegenMachine = apiCodegenMachine.provide({
  actors: {
    saveApiIndex: saveApiIndexToApiActor,
  },
});
