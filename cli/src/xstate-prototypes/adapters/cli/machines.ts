import {
  apiCodegenMachine,
  chatMachine,
  dbSchemaCodegenMachine,
  setUpWorkspaceMachine,
} from "@/xstate-prototypes/machines";
import type { PackageManager } from "@/xstate-prototypes/utils/package-manager";
import {
  createCliSaveSpecActor,
  createDownloadTemplateActor,
  createInstallDependenciesActor,
  createSaveApiIndexToDiskActor,
  createSaveSchemaToDiskActor,
  createValidateTypeScriptOnDiskActor,
} from "./actor-factories";

// NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

export const createCliChatMachine = (
  projectDir: string,
  baseChatMachine: typeof chatMachine = chatMachine,
) => {
  return baseChatMachine.provide({
    actors: {
      saveSpec: createCliSaveSpecActor(projectDir),
    },
  });
};

export const createCliSetUpWorkspaceMachine = (
  projectDir: string,
  packageManager: PackageManager,
) => {
  return setUpWorkspaceMachine.provide({
    actors: {
      downloadTemplate: createDownloadTemplateActor(projectDir),
      installDependencies: createInstallDependenciesActor(
        projectDir,
        packageManager,
      ),
    },
  });
};

export const createCliDbSchemaCodegenMachine = (
  projectDir: string,
  packageManager: PackageManager,
  /** Tricky way for us to inject additional actors if we so please */
  baseDbSchemaMachine: typeof dbSchemaCodegenMachine = dbSchemaCodegenMachine,
) =>
  baseDbSchemaMachine.provide({
    actors: {
      saveSchema: createSaveSchemaToDiskActor(projectDir),
      validateTypeScript: createValidateTypeScriptOnDiskActor(
        projectDir,
        packageManager,
      ),
    },
  });

export const createCliApiCodegenMachine = (
  projectDir: string,
  packageManager: PackageManager,
  /** Tricky way for us to inject additional actors if we so please */
  baseApiMachine: typeof apiCodegenMachine = apiCodegenMachine,
) =>
  baseApiMachine.provide({
    actors: {
      saveApiIndex: createSaveApiIndexToDiskActor(projectDir),
      validateTypeScript: createValidateTypeScriptOnDiskActor(
        projectDir,
        packageManager,
      ),
    },
  });
