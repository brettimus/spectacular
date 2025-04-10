import {
  apiCodegenMachine,
  chatMachine,
  dbSchemaCodegenMachine,
} from "@/xstate-prototypes/machines";
import { validateTypeScriptNoopActor } from "@/xstate-prototypes/typechecking";
import {
  analyzeTablesLocalActor,
  askNextQuestionOllamaActor,
  generateSchemaLocalActor,
  generateSpecLocalActor,
  routeRequestLocalActor,
} from "./actors";

export const localChatMachine = chatMachine.provide({
  actors: {
    routeRequest: routeRequestLocalActor,
    askNextQuestion: askNextQuestionOllamaActor,
    generateSpec: generateSpecLocalActor,
  },
  actions: {
    handleStreamChunk: (_, _params) => {
      // NOOP - But this is a good place to add logic to handle chunks of text from the streaming response
    },
  },
});

export const localDbSchemaCodegenMachine = dbSchemaCodegenMachine.provide({
  actors: {
    analyzeTables: analyzeTablesLocalActor,
    generateSchema: generateSchemaLocalActor,
    // Skip validating typescript, which skips the fix loop
    validateTypeScript: validateTypeScriptNoopActor,
  },
});

export const localApiCodegenMachine = apiCodegenMachine.provide({
  actors: {},
});
