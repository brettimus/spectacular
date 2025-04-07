import {
  apiCodegenMachine,
  dbSchemaCodegenMachine,
  downloadTemplateActor,
  installDependenciesActor,
} from "@/xstate-prototypes/machines";

import {
  saveApiIndexToDiskActor,
  saveSchemaToDiskActor,
  validateTypeScriptOnDiskActor,
} from "./actors";

// NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

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
