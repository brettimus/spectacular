import { createActor, assign, setup } from "xstate";
import type { BaseMachineContext, CommonEvents, HealingEvent } from "../core/types";
import { createBaseMachine } from "../core/base-machine";
import type { Context as CliContext } from "../../context";

// Import existing actions
import { actionCreateSchema } from "../../actions/create-schema";
import { actionDownloadTemplate } from "../../actions/download-template";
import { actionDependencies } from "../../actions/dependencies";

// Types for the schema generation workflow
interface SchemaGenerationContext extends BaseMachineContext {
  specPath?: string;
  schemaContent?: string;
  schemaFilePath?: string;
  typeErrors?: string[];
  healingAttempt?: number;
}

type SchemaGenerationEvents = 
  | { type: 'START', specPath: string }
  | { type: 'DOWNLOAD_TEMPLATE' }
  | { type: 'INSTALL_DEPS' }
  | { type: 'GENERATE_SCHEMA' }
  | { type: 'VALIDATE_SCHEMA' }
  | { type: 'HEAL', errors: string[] }
  | { type: 'COMPLETE' }
  | CommonEvents;

// Create the schema generation machine
export const createSchemaGenerationMachine = (cliContext: CliContext) => {
  // Get the base machine with common functionality
  const baseMachine = createBaseMachine<SchemaGenerationContext, SchemaGenerationEvents>();

  return setup({
    ...baseMachine,
    types: {
      context: {} as SchemaGenerationContext,
      events: {} as SchemaGenerationEvents,
      input: {} as { specPath: string },
    },
    // Initial context
    initial: 'idle',
    context: ({ input }) => ({
      cliContext,
      specPath: input.specPath,
      healingAttempt: 0,
    }),
    // Define our state machine
    states: {
      idle: {
        on: {
          START: {
            target: 'downloadingTemplate',
            actions: ['recordStartTime', 
              assign({
                specPath: ({ event }) => event.specPath,
              }),
            ],
          },
        },
      },
      downloadingTemplate: {
        entry: 'sendDownloadTemplateAnalytics',
        invoke: {
          src: 'downloadTemplate',
          onDone: {
            target: 'installingDependencies',
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      installingDependencies: {
        entry: 'sendInstallDepsAnalytics',
        invoke: {
          src: 'installDependencies',
          onDone: {
            target: 'generatingSchema',
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      generatingSchema: {
        entry: 'sendGenerateSchemaAnalytics',
        invoke: {
          src: 'generateSchema',
          onDone: {
            target: 'validatingSchema',
            actions: assign({
              schemaContent: ({ event }) => event.output.content,
              schemaFilePath: ({ event }) => event.output.path,
            }),
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      validatingSchema: {
        invoke: {
          src: 'validateSchema',
          onDone: {
            target: 'done',
            actions: 'recordEndTime',
          },
          onError: {
            target: 'healing',
            actions: [
              assign({
                typeErrors: ({ event }) => event.error.errors || [],
                healingAttempt: ({ context }) => (context.healingAttempt || 0) + 1,
              }),
              'sendValidationErrorAnalytics',
            ],
          },
        },
      },
      healing: {
        entry: 'sendHealingAnalytics',
        invoke: {
          src: 'healSchema',
          onDone: {
            target: 'validatingSchema',
            actions: [
              assign({
                schemaContent: ({ event }) => event.output.content,
              }),
              'sendHealingSuccessLog',
            ],
          },
          onError: {
            target: 'done',
            actions: [
              'sendHealingFailureLog',
              'recordEndTime',
            ],
          },
        },
        // Maximum 3 healing attempts
        always: {
          guard: ({ context }) => (context.healingAttempt || 0) >= 3,
          target: 'done',
          actions: 'sendMaxHealingAttemptsLog',
        },
      },
      done: {
        type: 'final',
        entry: 'sendCompletionAnalytics',
        output: ({ context }) => ({
          schemaFilePath: context.schemaFilePath,
          duration: context.endTime ? context.endTime - (context.startTime || 0) : 0,
          success: !context.error,
        }),
      },
      error: {
        entry: 'sendErrorAnalytics',
      },
    },
  }).implement({
    actors: {
      // Implement actors using existing actions
      downloadTemplate: ({ context }) => async () => {
        return await actionDownloadTemplate(context.cliContext);
      },
      installDependencies: ({ context }) => async () => {
        return await actionDependencies(context.cliContext);
      },
      generateSchema: ({ context }) => async () => {
        if (!context.specPath) {
          throw new Error("Spec path is required for schema generation");
        }
        return await actionCreateSchema(context.cliContext);
      },
      validateSchema: ({ context }) => async () => {
        // Mock function - you should implement proper TypeScript validation
        // This would be replaced with a real function that runs tsc on the schema file
        if (!context.schemaFilePath) {
          throw new Error("Schema file path is required for validation");
        }
        
        // Simulate running typescript check
        // In reality, you'd do something like:
        // const errors = await runTypeScriptCheck(context.schemaFilePath);
        const errors: string[] = []; // Mocked as empty for now
        
        if (errors.length > 0) {
          const error = new Error("TypeScript validation failed") as any;
          error.errors = errors;
          throw error;
        }
        
        return true;
      },
      healSchema: ({ context }) => async () => {
        // This would be implemented with your healing agent
        // For now we'll simply mock it
        if (!context.schemaContent || !context.typeErrors) {
          throw new Error("Schema content and errors are required for healing");
        }
        
        // Mock healing - in reality this would use an LLM to fix the schema
        const healed = {
          content: context.schemaContent, // In reality, this would be the fixed content
          successful: true,
        };
        
        // Send a healing event for analytics tracking
        const healingEvent: HealingEvent = {
          type: 'HEALING',
          errors: context.typeErrors,
          file: context.schemaFilePath || 'unknown',
          solution: "Mocked healing solution", // In reality, this would be the LLM's solution
          successful: healed.successful,
        };
        
        // Would need to emit this event in some way - for now just mock it
        console.log("Healing event:", healingEvent);
        
        return healed;
      },
    },
    actions: {
      // Analytics and logging events
      sendDownloadTemplateAnalytics: () => ({
        type: 'ANALYTICS',
        action: 'download_template_started',
        data: {},
      }),
      sendInstallDepsAnalytics: () => ({
        type: 'ANALYTICS',
        action: 'install_deps_started',
        data: {},
      }),
      sendGenerateSchemaAnalytics: () => ({
        type: 'ANALYTICS',
        action: 'generate_schema_started',
        data: {},
      }),
      sendValidationErrorAnalytics: ({ context }) => ({
        type: 'ANALYTICS',
        action: 'schema_validation_error',
        data: {
          errorCount: context.typeErrors?.length || 0,
          attempt: context.healingAttempt,
        },
      }),
      sendHealingAnalytics: ({ context }) => ({
        type: 'ANALYTICS',
        action: 'schema_healing_started',
        data: {
          attempt: context.healingAttempt,
          errorCount: context.typeErrors?.length || 0,
        },
      }),
      sendHealingSuccessLog: ({ context }) => ({
        type: 'LOG',
        level: 'info',
        message: `Schema healing succeeded on attempt ${context.healingAttempt}`,
        data: {
          errors: context.typeErrors,
          file: context.schemaFilePath,
        },
      }),
      sendHealingFailureLog: ({ context }) => ({
        type: 'LOG',
        level: 'warn',
        message: `Schema healing failed on attempt ${context.healingAttempt}`,
        data: {
          errors: context.typeErrors,
          file: context.schemaFilePath,
        },
      }),
      sendMaxHealingAttemptsLog: ({ context }) => ({
        type: 'LOG',
        level: 'warn',
        message: `Reached maximum healing attempts (${context.healingAttempt})`,
        data: {
          errors: context.typeErrors,
          file: context.schemaFilePath,
        },
      }),
      sendCompletionAnalytics: ({ context }) => ({
        type: 'ANALYTICS',
        action: 'schema_generation_completed',
        data: {
          duration: context.endTime ? context.endTime - (context.startTime || 0) : 0,
          success: !context.error,
          healingAttempts: context.healingAttempt || 0,
        },
      }),
      sendErrorAnalytics: ({ context }) => ({
        type: 'ANALYTICS',
        action: 'schema_generation_error',
        data: {
          error: context.error?.message,
          stage: context.error?.stage || 'unknown',
        },
      }),
    },
  });
};

// Create an actor from the machine
export const createSchemaGenerationActor = (cliContext: CliContext, specPath: string) => {
  const machine = createSchemaGenerationMachine(cliContext);
  return createActor(machine, { input: { specPath } });
}; 