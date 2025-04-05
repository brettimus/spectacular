import type { Message } from "ai";
import { assign, setup } from "xstate";
import { chatMachine } from "./machines/chat/chat";
import { apiCodegenMachine } from "./machines/codegen/api-codegen/api-codegen";
import { dbSchemaCodegenMachine } from "./machines/codegen/db-schema-codegen/db-schema-codegen";

interface SpectacularMachineInput {
  cwd: string;
  apiKey: string;
}

interface SpectacularMachineContext {
  cwd: string;
  apiKey: string;
  spec: string;
  dbSchemaTs: string;
  apiCode: string;
  messages: Message[];
  projectDir: string;
  title: string;
}

interface SpectacularMachineOutput {
  spec: string;
  dbSchemaTs: string;
  apiCode: string;
}

export const spectacularMachine = setup({
  types: {
    context: {} as SpectacularMachineContext,
    input: {} as SpectacularMachineInput,
    events: {} as { type: "user.message"; content: string },
    output: {} as SpectacularMachineOutput,
  },
  actors: {
    ideationActor: chatMachine,
    schemaGenerationActor: dbSchemaCodegenMachine,
    apiGenerationActor: apiCodegenMachine,
  },
}).createMachine({
  id: "spectacular",
  description: "A state machine for generating a spec, schema, and API",
  initial: "Ideating",
  context: ({ input }) => ({
    cwd: input.cwd,
    apiKey: input.apiKey,
    spec: "",
    dbSchemaTs: "",
    apiCode: "",
    messages: [],
    projectDir: input.cwd, // Placeholder for project dir
    title: "spec.md",
  }),
  states: {
    Ideating: {
      invoke: {
        id: "ideation",
        src: "ideationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          cwd: context.cwd,
        }),
        onDone: {
          target: "GeneratingSchema",
          actions: assign({
            spec: ({ event }) => event.output.spec || "",
            projectDir: ({ event }) => event.output.projectDir,
            messages: ({ event }) => event.output.messages,
            title: ({ event }) => event.output.title,
          }),
        },
      },
      on: {
        "user.message": {
          actions: ({ self, event }) => {
            self.getSnapshot().children.ideation?.send(event);
          },
        },
      },
    },
    GeneratingSchema: {
      invoke: {
        id: "schema-generation",
        src: "schemaGenerationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          spec: context.spec,
        }),
        onDone: {
          target: "GeneratingApi",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
          }),
        },
      },
    },
    GeneratingApi: {
      invoke: {
        id: "api-generation",
        src: "apiGenerationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          schema: context.dbSchemaTs,
          spec: context.spec,
          projectDir: context.projectDir,
        }),
        onDone: {
          target: "Done",
          actions: assign({
            apiCode: ({ context }) => {
              // The API codegen machine doesn't directly output apiCode
              // Using a placeholder or accessing it from context if available
              return context.apiCode;
            },
          }),
        },
      },
      entry: ({ self, context }) => {
        // When entering this state, we'll send the GENERATE_API event
        // to ensure the API generation begins
        // HACK
        self.getSnapshot().children.apiGenerationActor?.send({
          type: "GENERATE_API",
          schema: context.dbSchemaTs,
          spec: context.spec,
        });
      },
    },
    Done: {
      type: "final",
    },
  },
  output: ({ context }) => ({
    spec: context.spec || "",
    dbSchemaTs: context.dbSchemaTs || "",
    apiCode: context.apiCode || "",
  }),
});
