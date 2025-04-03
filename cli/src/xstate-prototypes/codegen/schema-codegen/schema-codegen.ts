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
} from "./actors";
import type { SchemaErrorAnalysisResult } from "@/xstate-prototypes/ai/codegen/schema/types";
import type { FpModelProvider } from "@/xstate-prototypes/ai";

interface SchemaCodegenMachineInput {
  apiKey: string;
  aiProvider?: FpModelProvider;
  aiGatewayUrl?: string;
  spec?: string;
}

interface SchemaCodegenMachineContext {
  apiKey: string;
  aiProvider: FpModelProvider;
  aiGatewayUrl?: string;
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
  initial: "Idle",
  context: ({ input }) => ({
    apiKey: input.apiKey,
    aiProvider: input.aiProvider || "openai",
    aiGatewayUrl: input.aiGatewayUrl,
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
    Idle: {
      on: {
        ANALYZE_TABLES: {
          target: "AnalyzingTables",
          actions: assign({
            spec: ({ event }) => event.spec,
          }),
        },
      },
    },
    AnalyzingTables: {
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
          target: "IdentifyingRules",
          actions: assign({
            schemaSpecification: ({ event }) =>
              event.output?.schemaSpecification || "",
          }),
        },
        onError: {
          target: "Failed",
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
    IdentifyingRules: {
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
          target: "GeneratingSchema",
          actions: assign({
            relevantRules: ({ event }) => event.output?.relevantRules || [],
          }),
        },
        onError: {
          target: "GeneratingSchema",
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
    GeneratingSchema: {
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
          aiProvider: context.aiProvider,
          aiGatewayUrl: context.aiGatewayUrl,
        }),
        onDone: {
          // target: "VerifyingSchema",
          // TODO - FIX THIS TRANSITION
          target: "WaitingForErrors",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
          }),
        },
        onError: {
          target: "Failed",
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
    WaitingForErrors: {
      entry: () =>
        log(
          "info",
          "Schema verification failed. Waiting for errors to analyze",
          { stage: "error-wait" },
        ),
      on: {
        ANALYZE_ERRORS: {
          target: "AnalyzingErrors",
          actions: assign({
            errors: ({ event }) => event.errors,
          }),
        },
      },
    },
    AnalyzingErrors: {
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
          target: "FixingErrors",
          actions: assign({
            errorAnalysis: ({ event }) => event.output || null,
          }),
        },
        onError: {
          target: "Failed",
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
    FixingErrors: {
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
          // target: "VerifyingFixedSchema",
          // TODO - FIX THIS TRANSITION
          target: "Success",
          actions: assign({
            fixedSchema: ({ event }) => event.output?.code || null,
          }),
        },
        onError: {
          target: "Failed",
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

    Success: {
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
    FailedToFix: {
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
    Failed: {
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
