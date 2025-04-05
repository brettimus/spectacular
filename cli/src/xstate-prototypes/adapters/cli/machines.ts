import {
  apiCodegenMachine,
  chatMachine,
  downloadTemplateActor,
  installDependenciesActor,
  dbSchemaCodegenMachine,
} from "@/xstate-prototypes/machines";

import {
  saveApiIndexToDiskActor,
  saveSchemaToDiskActor,
  saveSpecToDiskActor,
  validateTypeScriptOnDiskActor,
} from "./actors";

// NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

export const cliChatMachine = chatMachine.provide({
  actors: {
    saveSpec: saveSpecToDiskActor,
  },
});

export const cliSchemaCodegenMachine = dbSchemaCodegenMachine.provide({
  actors: {
    saveSchema: saveSchemaToDiskActor,
    validateTypeScript: validateTypeScriptOnDiskActor,
    downloadTemplate: downloadTemplateActor,
    installDependencies: installDependenciesActor,
  },
});

export const cliApiCodegenMachine = apiCodegenMachine.provide({
  actors: {
    saveApiIndex: saveApiIndexToDiskActor,
    validateTypeScript: validateTypeScriptOnDiskActor,
  },
});
