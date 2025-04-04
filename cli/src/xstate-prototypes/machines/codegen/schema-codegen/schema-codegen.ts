import { setup, assign } from "xstate";
import type { SelectedRule } from "@/xstate-prototypes/ai";
import { log } from "@/xstate-prototypes/utils/logging";
import {
  analyzeTablesActor,
  identifyRulesActor,
  generateSchemaActor,
  analyzeErrorsActor,
  type AnalyzeSchemaErrorsResult,
  fixSchemaActor,
} from "./actors";
import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "@/xstate-prototypes/ai";
import {
  validateTypeScriptActor,
  type ErrorInfo,
} from "@/xstate-prototypes/machines/typechecking";
import {
  downloadTemplateActor,
  installDependenciesActor,
} from "@/xstate-prototypes/machines/download-template";
import { saveSchemaToDiskActor } from "./actors";
import { getPackageManager } from "@/xstate-prototypes/utils";

interface SchemaCodegenMachineInput {
  /** The API key to use for AI calls */
  apiKey: string;
  /** The AI provider to use for AI calls */
  aiProvider?: FpModelProvider;
  /** The AI gateway URL to use for AI calls */
  aiGatewayUrl?: string;
  /** The spec to use for schema generation */
  spec: string;
  /** Project root directory - Only relevant if we are writing to a file */
  projectDir?: string;
}

interface SchemaCodegenMachineContext {
  aiConfig: FpAiConfig;
  spec: string;
  projectDir: string;

  fixAttempts: number;

  schemaSpecification: string;
  relevantRules: SelectedRule[];
  dbSchemaTs: string;
  errors: ErrorInfo[];
  errorAnalysis: AnalyzeSchemaErrorsResult | null;
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
      | { type: "download.template" }
      | { type: "analyze.tables"; spec: string }
      | { type: "generate.schema" }
      | { type: "verify.schema" }
      | { type: "fix.errors" }
      | { type: "regenerate.schema" },
    output: {} as SchemaCodegenMachineOutput,
  },
  actors: {
    downloadTemplate: downloadTemplateActor,
    installDependencies: installDependenciesActor,
    analyzeTables: analyzeTablesActor,
    identifyRules: identifyRulesActor,
    generateSchema: generateSchemaActor,
    saveSchema: saveSchemaToDiskActor,
    analyzeErrors: analyzeErrorsActor,
    fixSchema: fixSchemaActor,
    validateTypeScript: validateTypeScriptActor,
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
    projectDir: input.projectDir || process.cwd(),

    fixAttempts: 0,

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
        "analyze.tables": {
          target: "AnalyzingTables",
          actions: assign({
            spec: ({ event }) => event.spec,
          }),
        },
        "download.template": {
          target: "DownloadingTemplate",
        },
      },
    },
    DownloadingTemplate: {
      entry: () =>
        log("info", "Downloading template", { stage: "download-template" }),
      invoke: {
        id: "downloadTemplate",
        src: "downloadTemplate",
        input: ({ context }) => ({
          projectDir: context.projectDir,
        }),
        onDone: {
          target: "InstallingDependencies",
        },
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            log("error", "Failed to download template", { error: event.error });
          },
        },
      },
    },
    InstallingDependencies: {
      entry: () =>
        log("info", "Installing dependencies", {
          stage: "install-dependencies",
        }),
      invoke: {
        id: "installDependencies",
        src: "installDependencies",
        input: ({ context }) => ({
          projectDir: context.projectDir,
          // TODO - Make this dynamic
          packageManager: getPackageManager() as
            | "npm"
            | "yarn"
            | "pnpm"
            | "bun",
        }),
        onDone: {
          target: "AnalyzingTables",
        },
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            log("error", "Failed to install dependencies", {
              error: event.error,
            });
          },
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
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to generate schema", { error: event.error });
            }
          },
        },
      },
    },
    SavingSchema: {
      entry: () => log("info", "Saving schema", { stage: "save-schema" }),
      invoke: {
        id: "saveSchema",
        src: "saveSchema",
        input: ({ context }) => ({
          projectDir: context.projectDir,
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
        input: ({ context }) => ({
          projectDir: context.projectDir,
        }),
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
                errors: ({ event }) => {
                  return event.output;
                },
              }),
            ],
          },
          {
            target: "Success",
            actions: [
              assign({
                errors: ({ event }) => {
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
            fixContent: context.errorAnalysis?.text || "",
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
          projectDir: context.projectDir,
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
