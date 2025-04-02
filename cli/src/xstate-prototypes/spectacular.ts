import { setup, assign } from "xstate";
import { chatMachine } from "./chat/chat";
import { schemaCodegenMachine } from "./codegen/schema-codegen/schema-codegen";
import { apiCodegenMachine } from "./codegen/api-codegen/api-codegen";
import type { Message } from "ai";

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
    events: {} as { type: "promptReceived"; prompt: string },
    output: {} as SpectacularMachineOutput,
  },
  actors: {
    ideationActor: chatMachine,
    schemaGenerationActor: schemaCodegenMachine,
    apiGenerationActor: apiCodegenMachine,
  },
}).createMachine({
  id: "spectacular",
  initial: "ideating",
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
    ideating: {
      invoke: {
        id: "ideation",
        src: "ideationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          cwd: context.cwd,
        }),
        onDone: {
          target: "generatingSchema",
          actions: assign({
            spec: ({ event }) => event.output.spec || "",
            projectDir: ({ event }) => event.output.projectDir,
            messages: ({ event }) => event.output.messages,
            title: ({ event }) => event.output.title,
          }),
        },
      },
      on: {
        promptReceived: {
          actions: ({ self, event }) => {
            self.getSnapshot().children.ideation?.send(event);
          },
        },
      },
    },
    generatingSchema: {
      invoke: {
        id: "schema-generation",
        src: "schemaGenerationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          spec: context.spec,
        }),
        onDone: {
          target: "generatingApi",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
          }),
        },
      },
    },
    generatingApi: {
      invoke: {
        id: "api-generation",
        src: "apiGenerationActor",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          schema: context.dbSchemaTs,
          spec: context.spec,
        }),
        onDone: {
          target: "done",
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
    done: {
      type: "final",
    },
  },
  output: ({ context }) => ({
    spec: context.spec || "",
    dbSchemaTs: context.dbSchemaTs || "",
    apiCode: context.apiCode || "",
  }),
});
