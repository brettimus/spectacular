import { chatMachine } from "./chat";
import { schemaCodegenMachine } from "./codegen/schema-codegen";
import { apiCodegenMachine } from "./codegen/api-codegen";
import {
  downloadTemplateNoopActor,
  installDependenciesNoopActor,
  downloadTemplateActor,
  installDependenciesActor,
} from "./configure-workspace";

export {
  chatMachine,
  schemaCodegenMachine,
  apiCodegenMachine,
  downloadTemplateNoopActor,
  installDependenciesNoopActor,
  downloadTemplateActor,
  installDependenciesActor,
};
