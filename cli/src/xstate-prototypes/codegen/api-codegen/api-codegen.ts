import { setup, assign } from "xstate";
import type { ErrorInfo } from "@/utils/typechecking/types";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import {
  generateApiActor,
  verifyApiActor,
  analyzeApiErrorsActor,
  fixApiErrorsActor,
  // type ApiGenerationResult,
  // type ApiVerificationResult,
  type ApiErrorAnalysisResult,
  // type ApiFixResult
} from "./actors";

interface ApiCodegenMachineInput {
  apiKey: string;
  schema?: string;
  spec?: string;
}

interface ApiCodegenMachineContext {
  apiKey: string;
  schema: string;
  spec: string;
  apiCode: string;
  reasoning: string;
  errors: ErrorInfo[];
  errorAnalysis: ApiErrorAnalysisResult | null;
  fixedApiCode: string | null;
  valid: boolean;
  issues: string[];
}

export const apiCodegenMachine = setup({
  types: {
    context: {} as ApiCodegenMachineContext,
    input: {} as ApiCodegenMachineInput,
    events: {} as
      | { type: "GENERATE_API"; schema: string; spec: string }
      | { type: "VERIFY_API" }
      | { type: "ANALYZE_ERRORS"; errors: ErrorInfo[] }
      | { type: "FIX_ERRORS" }
      | { type: "REGENERATE_API" },
  },
  actors: {
    generateApi: generateApiActor,
    verifyApi: verifyApiActor,
    analyzeApiErrors: analyzeApiErrorsActor,
    fixApiErrors: fixApiErrorsActor,
  },
}).createMachine({
  id: "api-codegen",
  initial: "Idle",
  context: ({ input }) => ({
    apiKey: input.apiKey,
    schema: input.schema || "",
    spec:
      input.spec ||
      "Create a simple REST API with CRUD operations for all tables in the schema.",
    apiCode: "",
    reasoning: "",
    errors: [],
    errorAnalysis: null,
    fixedApiCode: null,
    valid: false,
    issues: [],
  }),
  states: {
    Idle: {
      on: {
        GENERATE_API: {
          target: "GeneratingApi",
          actions: assign({
            schema: ({ event }) => event.schema,
            spec: ({ event }) => event.spec,
          }),
        },
      },
    },
    GeneratingApi: {
      entry: () => log("info", "Generating API code", { stage: "generation" }),
      invoke: {
        id: "generate-api",
        src: "generateApi",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            schema: context.schema,
            spec: context.spec,
          },
        }),
        onDone: {
          target: "VerifyingApi",
          actions: assign({
            apiCode: ({ event }) => event.output?.indexTs || "",
            reasoning: ({ event }) => event.output?.reasoning || "",
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
    VerifyingApi: {
      entry: () => log("info", "Verifying API code", { stage: "verification" }),
      invoke: {
        id: "verify-api",
        src: "verifyApi",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            schema: context.schema,
            apiCode: context.apiCode,
          },
        }),
        onDone: [
          {
            target: "Success",
            guard: ({ event }) => event.output?.valid === true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
          {
            target: "WaitingForErrors",
            guard: ({ event }) => event.output?.valid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
        ],
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to verify API", { error: event.error });
            }
          },
        },
      },
    },
    WaitingForErrors: {
      entry: () =>
        log("info", "API verification failed. Waiting for errors to analyze", {
          stage: "error-wait",
        }),
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
        log("info", "Analyzing API errors", { stage: "error-analysis" }),
      invoke: {
        id: "analyze-api-errors",
        src: "analyzeApiErrors",
        input: ({ context }) => ({
          apiKey: context.apiKey,
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
        id: "fix-api-errors",
        src: "fixApiErrors",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          fixContent: context.errorAnalysis?.text || "",
          originalApiCode: context.apiCode,
        }),
        onDone: {
          target: "VerifyingFixedApi",
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
    VerifyingFixedApi: {
      entry: () =>
        log("info", "Verifying fixed API code", {
          stage: "verification-fixed",
        }),
      invoke: {
        id: "verify-fixed-api",
        src: "verifyApi",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          options: {
            schema: context.schema,
            apiCode: context.fixedApiCode || context.apiCode,
          },
        }),
        onDone: [
          {
            target: "Success",
            guard: ({ event }) => event.output?.valid === true,
            actions: [
              assign({
                valid: ({ event }) => event.output?.valid || false,
                issues: ({ event }) => event.output?.issues || [],
                apiCode: ({ context }) =>
                  context.fixedApiCode || context.apiCode,
              }),
              () =>
                log("info", "API code fixed and verified", {
                  stage: "success",
                }),
            ],
          },
          {
            target: "FailedToFix",
            guard: ({ event }) => event.output?.valid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
        ],
        onError: {
          target: "Failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to verify fixed API", {
                error: event.error,
              });
            }
          },
        },
      },
    },
    FailedToFix: {
      entry: () =>
        log("warn", "Failed to fix API errors. Manual intervention required.", {
          stage: "failed-fix",
        }),
      on: {
        REGENERATE_API: {
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
});
