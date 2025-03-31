import { setup, assign } from "xstate";
import type { Context } from "@/context";
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
  context: Context;
  schema?: string;
  spec?: string;
}

interface ApiCodegenMachineContext {
  context: Context;
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
  initial: "idle",
  context: ({ input }) => ({
    context: input.context,
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
    idle: {
      on: {
        GENERATE_API: {
          target: "generatingApi",
          actions: assign({
            schema: ({ event }) => event.schema,
            spec: ({ event }) => event.spec,
          }),
        },
      },
    },
    generatingApi: {
      entry: () => log("info", "Generating API code", { stage: "generation" }),
      invoke: {
        id: "generate-api",
        src: "generateApi",
        input: ({ context }) => ({
          context: context.context,
          options: {
            schema: context.schema,
          },
          spec: context.spec,
        }),
        onDone: {
          target: "verifyingApi",
          actions: assign({
            apiCode: ({ event }) => event.output?.indexTs || "",
            reasoning: ({ event }) => event.output?.reasoning || "",
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to generate API", { error: event.error });
            }
          },
        },
      },
    },
    verifyingApi: {
      entry: () => log("info", "Verifying API code", { stage: "verification" }),
      invoke: {
        id: "verify-api",
        src: "verifyApi",
        input: ({ context }) => ({
          context: context.context,
          options: {
            schema: context.schema,
            apiCode: context.apiCode,
          },
        }),
        onDone: [
          {
            target: "success",
            guard: ({ event }) => event.output?.valid === true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
          {
            target: "waitingForErrors",
            guard: ({ event }) => event.output?.valid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
        ],
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to verify API", { error: event.error });
            }
          },
        },
      },
    },
    waitingForErrors: {
      entry: () =>
        log("info", "API verification failed. Waiting for errors to analyze", {
          stage: "error-wait",
        }),
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
        log("info", "Analyzing API errors", { stage: "error-analysis" }),
      invoke: {
        id: "analyze-api-errors",
        src: "analyzeApiErrors",
        input: ({ context }) => ({
          context: context.context,
          apiCode: context.apiCode,
          errors: context.errors,
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
              log("error", "Failed to analyze API errors", {
                error: event.error,
              });
            }
          },
        },
      },
    },
    fixingErrors: {
      entry: () => log("info", "Fixing API errors", { stage: "error-fix" }),
      invoke: {
        id: "fix-api-errors",
        src: "fixApiErrors",
        input: ({ context }) => ({
          context: context.context,
          fixContent: context.errorAnalysis?.text || "",
          originalApiCode: context.apiCode,
        }),
        onDone: {
          target: "verifyingFixedApi",
          actions: assign({
            fixedApiCode: ({ event }) => event.output?.code || null,
          }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => {
            if (event.error) {
              log("error", "Failed to fix API errors", { error: event.error });
            }
          },
        },
      },
    },
    verifyingFixedApi: {
      entry: () =>
        log("info", "Verifying fixed API code", {
          stage: "verification-fixed",
        }),
      invoke: {
        id: "verify-fixed-api",
        src: "verifyApi",
        input: ({ context }) => ({
          context: context.context,
          options: {
            schema: context.schema,
            apiCode: context.fixedApiCode || context.apiCode,
          },
        }),
        onDone: [
          {
            target: "success",
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
            target: "failedToFix",
            guard: ({ event }) => event.output?.valid !== true,
            actions: assign({
              valid: ({ event }) => event.output?.valid || false,
              issues: ({ event }) => event.output?.issues || [],
            }),
          },
        ],
        onError: {
          target: "failed",
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
    failedToFix: {
      entry: () =>
        log("warn", "Failed to fix API errors. Manual intervention required.", {
          stage: "failed-fix",
        }),
      on: {
        REGENERATE_API: {
          target: "generatingApi",
        },
      },
    },
    success: {
      type: "final",
      entry: () =>
        log("info", "API generation completed successfully", {
          stage: "complete",
        }),
    },
    failed: {
      type: "final",
      entry: () => log("error", "API generation failed", { stage: "failed" }),
    },
  },
});
