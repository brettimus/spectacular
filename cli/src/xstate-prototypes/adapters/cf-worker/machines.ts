import { chatMachine } from "@/xstate-prototypes/machines/chat";
import {
  saveApiIndexToApiActor,
  saveSchemaToApiActor,
  saveSpecToApiActor,
} from "./actors";
import { schemaCodegenMachine } from "@/xstate-prototypes/machines/codegen/schema-codegen";
import { apiCodegenMachine } from "@/xstate-prototypes/machines/codegen/api-codegen";

// NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

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
