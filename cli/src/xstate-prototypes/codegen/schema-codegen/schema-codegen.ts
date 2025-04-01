import { setup, assign } from "xstate";
import type { ErrorInfo } from "@/utils/typechecking/types";
import type { SelectedRule } from "@/agents/schema-agent/types";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import {
  analyzeTablesActor,
  identifyRulesActor,
  generateSchemaActor,
  verifySchemaActor,
  analyzeErrorsActor,
  fixSchemaActor,
  type SchemaErrorAnalysisResult,
} from "./actors";

interface SchemaCodegenMachineInput {
  apiKey: string;
  spec?: string;
}

interface SchemaCodegenMachineContext {
  apiKey: string;
  spec: string;
  schemaSpecification: string;
  relevantRules: SelectedRule[];
  dbSchemaTs: string;
  errors: ErrorInfo[];
  errorAnalysis: SchemaErrorAnalysisResult | null;
  fixedSchema: string | null;
  valid: boolean;
  issues: string[];
  suggestions: string[];
  /** What went wrong with the machine */
  machineError: null | Error | string;
}

interface SchemaCodegenMachineOutput {
  dbSchemaTs: string;
  valid: boolean;
  issues: string[];
  suggestions: string[];
}

export const schemaCodegenMachine = setup({
  types: {
    context: {} as SchemaCodegenMachineContext,
    input: {} as SchemaCodegenMachineInput,
    events: {} as
      | { type: "ANALYZE_TABLES"; spec: string }
      | { type: "GENERATE_SCHEMA" }
      | { type: "VERIFY_SCHEMA" }
      | { type: "ANALYZE_ERRORS"; errors: ErrorInfo[] }
      | { type: "FIX_ERRORS" }
      | { type: "REGENERATE_SCHEMA" },
    output: {} as SchemaCodegenMachineOutput,
  },
  actors: {
    analyzeTables: analyzeTablesActor,
    identifyRules: identifyRulesActor,
    generateSchema: generateSchemaActor,
    verifySchema: verifySchemaActor,
    analyzeErrors: analyzeErrorsActor,
    fixSchema: fixSchemaActor,
  },
}).createMachine({
  id: "db-schema-codegen",
  description: "generate db/schema.ts file",
  initial: "idle",
  context: ({ input }) => ({
    apiKey: input.apiKey,
    spec: input.spec || "",
    schemaSpecification: "",
    relevantRules: [],
    dbSchemaTs: "",
    errors: [],
    errorAnalysis: null,
    fixedSchema: null,
    valid: false,
    issues: [],
    suggestions: [],
    machineError: null,
  }),
  states: {
    idle: {
      on: {
        ANALYZE_TABLES: {
          target: "analyzingTables",
          actions: assign({
            spec: ({ event }) => event.spec,
          }),
        },
      },
    },
    analyzingTables: {
      entry: () =>
        log("info", "Analyzing database tables", { stage: "table-analysis" }),
      invoke: {
        id: "analyze-tables",
        src: "analyzeTables",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            specContent: context.spec,
          },
        }),
        onDone: {
          target: "identifyingRules",
          actions: assign({
            schemaSpecification: ({ event }) =>
              event.output?.schemaSpecification || "",
          }),
        },
        onError: {
          target: "failed",
          actions: [
            ({ event }) => {
              if (event.error) {
                log("error", "Failed to analyze tables", {
                  error: event.error,
                });
              }
            },
            assign({
              machineError: ({ event }) => {
                const { error } = event;
                if (error instanceof Error) {
                  return error;
                }
                return "Unknown error";
              },
            }),
          ],
        },
      },
    },
    identifyingRules: {
      entry: () =>
        log("info", "Identifying relevant rules", {
          stage: "rule-identification",
        }),
      invoke: {
        id: "identify-rules",
        src: "identifyRules",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          schemaSpecification: context.schemaSpecification,
          /**
           * NOTE - This `noop` flag skips rule selection from a knowledge base, since we don't have a knowledge base yet
           */
          noop: true,
        }),
        onDone: {
          target: "generatingSchema",
          actions: assign({
            relevantRules: ({ event }) => event.output?.relevantRules || [],
          }),
        },
        onError: {
          target: "generatingSchema",
          actions: ({ event }) => {
            if (event.error) {
              log(
                "error",
                "Failed to identify rules, continuing without rules",
                { error: event.error },
              );
            }
          },
        },
      },
    },
    generatingSchema: {
      entry: () =>
        log("info", "Generating database schema", {
          stage: "schema-generation",
        }),
      invoke: {
        id: "generate-schema",
        src: "generateSchema",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            schemaSpecification: context.schemaSpecification,
            relevantRules: context.relevantRules,
          },
        }),
        onDone: {
          // target: "verifyingSchema",
          // TODO - FIX THIS TRANSITION
          target: "waitingForErrors",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to generate schema", { error: event.error });
            }
          },
        },
      },
    },
    // TODO - Can shell out to an actor that does typescript compilation here
    //        Then allow others to provide alternative implementations on derived machine instances
    waitingForErrors: {
      entry: () =>
        log(
          "info",
          "Schema verification failed. Waiting for errors to analyze",
          { stage: "error-wait" },
        ),
      on: {
        ANALYZE_ERRORS: {
          target: "analyzingErrors",
          actions: assign({
            errors: ({ event }) => event.errors,
          }),
        },
      },
    },
    analyzingErrors: {
      entry: () =>
        log("info", "Analyzing schema errors", { stage: "error-analysis" }),
      invoke: {
        id: "analyze-schema-errors",
        src: "analyzeErrors",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            schemaSpecification: context.schemaSpecification,
            schema: context.dbSchemaTs,
            errors: context.errors,
          },
        }),
        onDone: {
          target: "fixingErrors",
          actions: assign({
            errorAnalysis: ({ event }) => event.output || null,
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to analyze schema errors", {
                error: event.error,
              });
            }
          },
        },
      },
    },
    fixingErrors: {
      entry: () => log("info", "Fixing schema errors", { stage: "error-fix" }),
      invoke: {
        id: "fix-schema-errors",
        src: "fixSchema",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            fixContent: context.errorAnalysis?.text || "",
            originalSchema: context.dbSchemaTs,
          },
        }),
        onDone: {
          // target: "verifyingFixedSchema",
          // TODO - FIX THIS TRANSITION
          target: "success",
          actions: assign({
            fixedSchema: ({ event }) => event.output?.code || null,
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to fix schema errors", {
                error: event.error,
              });
            }
          },
        },
      },
    },

    success: {
      type: "final",
      entry: () =>
        log("info", "Schema generation successful", { stage: "complete" }),
      output: ({ context }) => ({
        dbSchemaTs: context.dbSchemaTs,
        valid: context.valid,
        issues: context.issues,
        suggestions: context.suggestions,
      }),
    },
    failedToFix: {
      type: "final",
      entry: () =>
        log("warn", "Failed to fix all schema errors", { stage: "failed-fix" }),
      output: ({ context }) => ({
        dbSchemaTs: context.fixedSchema || context.dbSchemaTs,
        valid: false,
        issues: context.issues,
        suggestions: context.suggestions,
      }),
    },
    failed: {
      type: "final",
      entry: [
        () =>
          log("error", "Schema generation process failed", { stage: "error" }),
        assign({
          machineError: ({ context }) =>
            context.machineError ?? "Failed to generate schema",
        }),
      ],
    },
  },

  output: ({ context }) => ({
    dbSchemaTs: context.fixedSchema || context.dbSchemaTs,
    error: context.machineError,
    valid: context.valid,
    issues: context.issues,
    suggestions: context.suggestions,
  }),
});
