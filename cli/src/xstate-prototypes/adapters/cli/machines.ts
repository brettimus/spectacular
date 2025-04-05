import { chatMachine } from "@/xstate-prototypes/machines/chat";
import {
  saveApiIndexToDiskActor,
  saveSchemaToDiskActor,
  saveSpecToDiskActor,
  validateTypeScriptOnDiskActor,
} from "./actors";
import { schemaCodegenMachine } from "@/xstate-prototypes/machines/codegen/schema-codegen";
import { apiCodegenMachine } from "@/xstate-prototypes/machines/codegen/api-codegen";

// NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

export const cliChatMachine = chatMachine.provide({
  actors: {
    saveSpec: saveSpecToDiskActor,
  },
});

export const cliSchemaCodegenMachine = schemaCodegenMachine.provide({
  actors: {
    saveSchema: saveSchemaToDiskActor,
    validateTypeScript: validateTypeScriptOnDiskActor,
  },
});

export const cliApiCodegenMachine = apiCodegenMachine.provide({
  actors: {
    saveApiIndex: saveApiIndexToDiskActor,
    validateTypeScript: validateTypeScriptOnDiskActor,
  },
});
