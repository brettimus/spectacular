import { setup, assign } from "xstate";
import type { Context } from "@/context";
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
  context: Context;
  spec?: string;
}

interface SchemaCodegenMachineContext {
  context: Context;
  spec: string;
  schemaSpecification: string;
  reasoning: string;
  relevantRules: SelectedRule[];
  dbSchemaTs: string;
  explanation: string;
  errors: ErrorInfo[];
  errorAnalysis: SchemaErrorAnalysisResult | null;
  fixedSchema: string | null;
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
  id: "schema-codegen",
  initial: "idle",
  context: ({ input }) => ({
    context: input.context,
    spec: input.spec || "",
    schemaSpecification: "",
    reasoning: "",
    relevantRules: [],
    dbSchemaTs: "",
    explanation: "",
    errors: [],
    errorAnalysis: null,
    fixedSchema: null,
    valid: false,
    issues: [],
    suggestions: [],
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
          context: context.context,
          options: {
            specContent: context.spec,
          },
        }),
        onDone: {
          target: "identifyingRules",
          actions: assign({
            schemaSpecification: ({ event }) =>
              event.output?.schemaSpecification || "",
            reasoning: ({ event }) => event.output?.reasoning || "",
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to analyze tables", { error: event.error });
            }
          },
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
          context: context.context,
          schemaSpecification: context.schemaSpecification,
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
          context: context.context,
          options: {
            schemaSpecification: context.schemaSpecification,
            relevantRules: context.relevantRules,
          },
        }),
        onDone: {
          target: "verifyingSchema",
          actions: assign({
            dbSchemaTs: ({ event }) => event.output?.dbSchemaTs || "",
            explanation: ({ event }) => event.output?.explanation || "",
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
    verifyingSchema: {
      entry: () =>
        log("info", "Verifying generated schema", {
          stage: "schema-verification",
        }),
      invoke: {
        id: "verify-schema",
        src: "verifySchema",
        input: ({ context }) => ({
          context: context.context,
          options: {
            schema: context.dbSchemaTs,
          },
        }),
        onDone: [
          {
            target: "success",
            guard: ({ event }) => event.output?.isValid === true,
            actions: assign({
              valid: ({ event }) => event.output?.isValid || false,
              issues: ({ event }) => event.output?.issues || [],
              suggestions: ({ event }) => event.output?.suggestions || [],
            }),
          },
          {
            target: "waitingForErrors",
            guard: ({ event }) => event.output?.isValid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.isValid || false,
              issues: ({ event }) => event.output?.issues || [],
              suggestions: ({ event }) => event.output?.suggestions || [],
            }),
          },
        ],
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to verify schema", { error: event.error });
            }
          },
        },
      },
    },
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
          context: context.context,
          options: {
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
          context: context.context,
          options: {
            fixContent: context.errorAnalysis?.text || "",
            originalSchema: context.dbSchemaTs,
          },
        }),
        onDone: {
          target: "verifyingFixedSchema",
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
    verifyingFixedSchema: {
      entry: () =>
        log("info", "Verifying fixed schema", { stage: "verification-fixed" }),
      invoke: {
        id: "verify-fixed-schema",
        src: "verifySchema",
        input: ({ context }) => ({
          context: context.context,
          options: {
            schema: context.fixedSchema || context.dbSchemaTs,
          },
        }),
        onDone: [
          {
            target: "success",
            guard: ({ event }) => event.output?.isValid === true,
            actions: [
              assign({
                valid: ({ event }) => event.output?.isValid || false,
                issues: ({ event }) => event.output?.issues || [],
                suggestions: ({ event }) => event.output?.suggestions || [],
                dbSchemaTs: ({ context }) =>
                  context.fixedSchema || context.dbSchemaTs,
              }),
              () =>
                log("info", "Schema fixed and verified", { stage: "success" }),
            ],
          },
          {
            target: "failedToFix",
            guard: ({ event }) => event.output?.isValid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.isValid || false,
              issues: ({ event }) => event.output?.issues || [],
              suggestions: ({ event }) => event.output?.suggestions || [],
            }),
          },
        ],
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to verify fixed schema", {
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
      entry: () =>
        log("error", "Schema generation process failed", { stage: "error" }),
      output: ({ context }) => ({
        error: "Failed to generate schema",
        dbSchemaTs: context.dbSchemaTs,
      }),
    },
  },
});
