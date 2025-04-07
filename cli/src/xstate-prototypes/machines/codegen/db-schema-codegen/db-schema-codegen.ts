import type { SelectedRule } from "@/xstate-prototypes/ai";
import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "@/xstate-prototypes/ai";
import {
  type ErrorInfo,
  validateTypeScriptNoopActor,
} from "@/xstate-prototypes/typechecking";
import { log } from "@/xstate-prototypes/utils/logging";
import { assign, setup } from "xstate";
import {
  type AnalyzeSchemaErrorsResult,
  analyzeErrorsActor,
  analyzeTablesActor,
  fixSchemaActor,
  generateSchemaActor,
  identifyRulesActor,
  saveSchemaNoopActor,
} from "./actors";

type DbSchemaCodegenMachineInput = {
  /** The API key to use for AI calls */
  apiKey: string;
  /** The AI provider to use for AI calls */
  aiProvider?: FpModelProvider;
  /** The AI gateway URL to use for AI calls */
  aiGatewayUrl?: string;
  /** The spec content to use for schema generation */
  spec: string;
};

type DbSchemaCodegenMachineContext = {
  aiConfig: FpAiConfig;
  /** The api specification document (spec.md) */
  spec: string;
  /** Whatever error stopped teh machine */
  error: unknown;
  /** The natural language description of the schema */
  schemaSpecification: string;
  /** Rules selected from a knowledge base (not yet implemented) */
  relevantRules: SelectedRule[];
  /** The generated db/schema.ts file */
  dbSchemaTs: string;
  /** Counter of how many fixes we have attempted */
  fixAttempts: number;
  /**
   * Typescript errors for the last fix attempt
   * @TODO - make it ErrorInfo[][], indexed by fixAttempt
   */
  typescriptErrors: ErrorInfo[];
  typescriptErrorAnalysis: AnalyzeSchemaErrorsResult | null;
  fixedSchema: string | null;
  valid: boolean;
  issues: string[];
  suggestions: string[];
};

interface DbSchemaCodegenMachineOutput {
  dbSchemaTs: string;
  valid: boolean;
  error: unknown;
  /** Remaining Typescript errors */
  issues: string[];
  suggestions: string[];
}

export const dbSchemaCodegenMachine = setup({
  types: {
    context: {} as DbSchemaCodegenMachineContext,
    input: {} as DbSchemaCodegenMachineInput,
    events: {} as
      | { type: "analyze.tables"; spec: string }
      | { type: "generate.schema" }
      | { type: "verify.schema" }
      | { type: "fix.errors" }
      | { type: "regenerate.schema" },
    output: {} as DbSchemaCodegenMachineOutput,
  },
  actors: {
    analyzeTables: analyzeTablesActor,
    identifyRules: identifyRulesActor,
    generateSchema: generateSchemaActor,
    saveSchema: saveSchemaNoopActor,
    analyzeErrors: analyzeErrorsActor,
    fixSchema: fixSchemaActor,
    validateTypeScript: validateTypeScriptNoopActor,
  },
  actions: {
    assignError: assign({
      error: (_, params: unknown) => params,
    }),
  },
}).createMachine({
  id: "db-schema-codegen",
  description: "generate db/schema.ts file",
  initial: "Idle",
  context: ({ input }) => ({
    aiConfig: {
      apiKey: input.apiKey,
      aiProvider: input.aiProvider || DEFAULT_AI_PROVIDER,
      aiGatewayUrl: input.aiGatewayUrl,
    },
    spec: input.spec,

    error: null,

    fixAttempts: 0,

    schemaSpecification: "",
    relevantRules: [],
    dbSchemaTs: "",
    typescriptErrors: [],
    typescriptErrorAnalysis: null,
    fixedSchema: null,
    valid: false,
    issues: [],
    suggestions: [],
  }),
  states: {
    Idle: {
      on: {
        "analyze.tables": {
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
        id: "analyzeTables",
        src: "analyzeTables",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
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
            // FIXME
            assign({
              error: ({ event }) => {
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
        id: "identifyRules",
        src: "identifyRules",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          schemaSpecification: context.schemaSpecification,
          /**
           * NOTE - This `noop` flag skips rule selection from a knowledge base
           *        since we don't have a knowledge base yet.
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
        id: "generateSchema",
        src: "generateSchema",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          options: {
            schemaSpecification: context.schemaSpecification,
            relevantRules: context.relevantRules,
          },
        }),
        onDone: {
          target: "SavingSchema",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
          }),
        },
        onError: {
          target: "Failed",
          actions: [
            ({ event }) => {
              if (event.error) {
                log("error", "Failed to generate schema", {
                  error: event.error,
                });
              }
            },
            assign({
              error: ({ event }) => event.error,
            }),
          ],
        },
      },
    },
    SavingSchema: {
      entry: () => log("info", "Saving schema", { stage: "save-schema" }),
      invoke: {
        id: "saveSchema",
        src: "saveSchema",
        input: ({ context }) => ({
          // projectDir: context.projectDir,
          schema: context.dbSchemaTs,
        }),
        onDone: {
          target: "CheckingTypescript",
        },
        onError: {
          target: "Failed",
        },
      },
    },
    CheckingTypescript: {
      entry: () =>
        log(
          "info",
          "Schema verification failed. Waiting for errors to analyze",
          { stage: "error-wait" },
        ),
      invoke: {
        id: "validateTypeScript",
        src: "validateTypeScript",
        onDone: [
          {
            target: "AnalyzingErrors",
            guard: ({ event }) => {
              const schemaErrors = event.output.filter((e: ErrorInfo) =>
                e?.location?.includes("schema.ts"),
              );
              return schemaErrors.length > 0;
            },
            actions: [
              assign({
                typescriptErrors: ({ event }) => {
                  return event.output;
                },
              }),
            ],
          },
          {
            target: "Success",
            actions: [
              assign({
                typescriptErrors: ({ event }) => {
                  return event.output;
                },
              }),
            ],
          },
        ],
      },
    },
    AnalyzingErrors: {
      entry: () =>
        log("info", "Analyzing schema errors", { stage: "error-analysis" }),

      invoke: {
        id: "analyzeSchemaErrors",
        src: "analyzeErrors",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          options: {
            schemaSpecification: context.schemaSpecification,
            schema: context.dbSchemaTs,
            errors: context.typescriptErrors,
          },
        }),
        onDone: {
          target: "FixingErrors",
          actions: assign({
            typescriptErrorAnalysis: ({ event }) => event.output || null,
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
      entry: [
        () => log("info", "Fixing schema errors", { stage: "error-fix" }),
        assign({
          fixAttempts: ({ context }) => context.fixAttempts + 1,
        }),
      ],
      invoke: {
        id: "fixSchemaErrors",
        src: "fixSchema",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          options: {
            fixContent: context.typescriptErrorAnalysis?.text || "",
            originalSchema: context.dbSchemaTs,
          },
        }),
        onDone: {
          target: "SavingFixedSchema",
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
    SavingFixedSchema: {
      entry: () =>
        log("info", "Saving fixed schema", { stage: "save-fixed-schema" }),
      invoke: {
        id: "saveFixedSchema",
        src: "saveSchema",
        input: ({ context }) => ({
          // TODO - fixme - should guard against falsy fixedSchema
          schema: context.fixedSchema || context.dbSchemaTs,
        }),
        onDone: {
          target: "Success",
        },
        onError: {
          target: "Failed",
        },
      },
    },
    Success: {
      type: "final",
      entry: () =>
        log("info", "Schema generation successful", { stage: "complete" }),
    },
    FailedToFix: {
      type: "final",
      entry: () =>
        log("warn", "Failed to fix all schema errors", { stage: "failed-fix" }),
    },
    Failed: {
      type: "final",
      entry: [
        () =>
          log("error", "Schema generation process failed", { stage: "error" }),
        assign({
          error: ({ context }) => context.error ?? "Failed to generate schema",
        }),
      ],
    },
  },

  output: ({ context }) => ({
    dbSchemaTs: context.fixedSchema || context.dbSchemaTs,
    error: context.error,
    valid: context.valid,
    issues: context.issues,
    suggestions: context.suggestions,
  }),
});
