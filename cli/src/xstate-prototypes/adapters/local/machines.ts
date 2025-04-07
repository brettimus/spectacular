import {
  apiCodegenMachine,
  chatMachine,
  dbSchemaCodegenMachine,
} from "@/xstate-prototypes/machines";
import {
  routeRequestLocalActor,
  askNextQuestionOllamaActor,
  generateSpecLocalActor,
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

export const localSchemaCodegenMachine = dbSchemaCodegenMachine.provide({
  actors: {},
});

export const localApiCodegenMachine = apiCodegenMachine.provide({
  actors: {},
});
