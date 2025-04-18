import {
  DEFAULT_AI_PROVIDER,
  type FpAiConfig,
  type FpModelProvider,
} from "../../../ai";
import {
  type ErrorInfo,
  validateTypeScriptNoopActor,
} from "../../../typechecking";
import { log } from "../../../utils/logging/logger";
import { assign, setup } from "xstate";
import {
  type AnalyzeApiErrorsResult,
  analyzeApiErrorsActor,
  fixApiErrorsActor,
  generateApiActor,
  saveApiIndexNoopActor,
} from "./actors";

interface ApiCodegenMachineInput {
  apiKey: string;
  aiProvider?: FpModelProvider;
  aiGatewayUrl?: string;
  dbSchemaTs?: string;
  spec?: string;
}

interface ApiCodegenMachineContext {
  aiConfig: FpAiConfig;
  dbSchemaTs: string;
  spec: string;
  apiCode: string;

  errors: ErrorInfo[];
  errorAnalysis: AnalyzeApiErrorsResult | null;
  fixedApiCode: string | null;
  valid: boolean;
  issues: string[];
}

interface ApiCodegenMachineOutput {
  apiCode: string;
  errors: ErrorInfo[];
  errorAnalysis: AnalyzeApiErrorsResult | null;
  fixedApiCode: string | null;
}

export const apiCodegenMachine = setup({
  types: {
    context: {} as ApiCodegenMachineContext,
    input: {} as ApiCodegenMachineInput,
    events: {} as
      | { type: "generate.api"; schema: string; spec: string }
      | { type: "verify.api" }
      | { type: "analyze.errors"; errors: ErrorInfo[] }
      | { type: "fix.errors" }
      | { type: "regenerate.api" },
    output: {} as ApiCodegenMachineOutput,
  },
  actors: {
    generateApi: generateApiActor,
    saveApiIndex: saveApiIndexNoopActor,
    validateTypeScript: validateTypeScriptNoopActor,
    analyzeApiErrors: analyzeApiErrorsActor,
    fixApiErrors: fixApiErrorsActor,
  },
}).createMachine({
  id: "api-codegen",
  initial: "Idle",
  context: ({ input }) => ({
    aiConfig: {
      apiKey: input.apiKey,
      aiProvider: input.aiProvider ?? DEFAULT_AI_PROVIDER,
      aiGatewayUrl: input.aiGatewayUrl,
    },
    dbSchemaTs: input.dbSchemaTs || "",
    spec:
      input.spec ||
      "Create a simple REST API with CRUD operations for all tables in the schema.",
    apiCode: "",

    errors: [],
    errorAnalysis: null,
    fixedApiCode: null,
    valid: false,
    issues: [],
  }),
  states: {
    Idle: {
      on: {
        "generate.api": {
          target: "GeneratingApi",
          actions: assign({
            dbSchemaTs: ({ event }) => event.schema,
            spec: ({ event }) => event.spec,
          }),
        },
      },
    },
    GeneratingApi: {
      entry: () => log("info", "Generating API code", { stage: "generation" }),
      invoke: {
        id: "generateApi",
        src: "generateApi",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          options: {
            schema: context.dbSchemaTs,
            spec: context.spec,
          },
        }),
        onDone: {
          target: "SavingApiIndex",
          actions: assign({
            apiCode: ({ event }) => event.output?.apiCode || "",
          }),
        },
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to generate API", { error: event.error });
            }
          },
        },
      },
    },
    SavingApiIndex: {
      entry: () => log("info", "Saving API index", { stage: "saving" }),
      invoke: {
        id: "saveApiIndex",
        src: "saveApiIndex",
        input: ({ context }) => ({
          indexTs: context.apiCode,
        }),
        onDone: {
          target: "AnalyzingErrors",
        },
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            log("error", "Failed to save API index", { error: event.error });
          },
        },
      },
    },

    CheckingTypescript: {
      invoke: {
        id: "validateTypeScript",
        src: "validateTypeScript",
        onDone: [
          {
            target: "FixingErrors",
            guard: ({ event }) => {
              const apiErrors = event.output.filter((e: ErrorInfo) =>
                e?.location?.includes("index.ts"),
              );
              return apiErrors.length > 0;
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
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            log("error", "Failed to validate TypeScript", {
              error: event.error,
            });
          },
        },
      },
    },
    AnalyzingErrors: {
      entry: () =>
        log("info", "Analyzing API errors", { stage: "error-analysis" }),
      invoke: {
        id: "analyzeApiErrors",
        src: "analyzeApiErrors",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          apiCode: context.apiCode,
          errors: context.errors,
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
              log("error", "Failed to analyze API errors", {
                error: event.error,
              });
            }
          },
        },
      },
    },
    FixingErrors: {
      entry: () => log("info", "Fixing API errors", { stage: "error-fix" }),
      invoke: {
        id: "fixApiErrors",
        src: "fixApiErrors",
        input: ({ context }) => ({
          aiConfig: context.aiConfig,
          fixContent: context.errorAnalysis?.text || "",
          originalApiCode: context.apiCode,
        }),
        onDone: {
          target: "SavingFixedApiIndex",
          actions: assign({
            fixedApiCode: ({ event }) => event.output?.code || null,
          }),
        },
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to fix API errors", { error: event.error });
            }
          },
        },
      },
    },
    SavingFixedApiIndex: {
      entry: () => log("info", "Saving fixed API", { stage: "save-fixed-api" }),
      invoke: {
        id: "saveFixedApi",
        src: "saveApiIndex",
        input: ({ context }) => ({
          // TODO - fixme - saveApiIndex should just throw its error
          indexTs: context.fixedApiCode || context.apiCode,
        }),
        onDone: {
          target: "Success",
        },
        onError: {
          target: "Failed",
        },
      },
    },
    FailedToFix: {
      entry: () =>
        log("warn", "Failed to fix API errors. Manual intervention required.", {
          stage: "failed-fix",
        }),
      on: {
        "regenerate.api": {
          target: "GeneratingApi",
        },
      },
    },
    Success: {
      type: "final",
      entry: () =>
        log("info", "API generation completed successfully", {
          stage: "complete",
        }),
    },
    Failed: {
      type: "final",
      entry: () => log("error", "API generation failed", { stage: "failed" }),
    },
  },
  output: ({ context }) => ({
    apiCode: context.apiCode,
    errors: context.errors,
    errorAnalysis: context.errorAnalysis,
    fixedApiCode: context.fixedApiCode,
  }),
});
