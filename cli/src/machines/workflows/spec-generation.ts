import { createActor, assign, setup } from "xstate";
import type { BaseMachineContext, CommonEvents } from "../core/types";
import { createBaseMachine } from "../core/base-machine";
import type { Context as CliContext } from "../../context";

// Import existing actions
import { actionIdeate } from "../../actions/ideate";
import { actionSaveSpec } from "../../actions/save-spec";
import { promptDescription } from "../../description";
import { saveSpectacularFolder } from "../../actions/save-spectacular-folder";

// Types for the spec generation workflow
interface SpecGenerationContext extends BaseMachineContext {
  description?: string;
  specificationContent?: string;
  specPath?: string;
}

type SpecGenerationEvents = 
  | { type: 'DESCRIBE_PROJECT' }
  | { type: 'IDEATE' }
  | { type: 'SAVE_SPEC' }
  | { type: 'COMPLETE' }
  | CommonEvents;

// Create the spec generation machine
export const createSpecGenerationMachine = (cliContext: CliContext) => {
  // Get the base machine with common functionality
  const baseMachine = createBaseMachine<SpecGenerationContext, SpecGenerationEvents>();

  return setup({
    ...baseMachine,
    types: {
      context: {} as SpecGenerationContext,
      events: {} as SpecGenerationEvents,
    },
    context: {
      cliContext,
    },
    // Define our state machine
    states: {
      idle: {
        on: {
          DESCRIBE_PROJECT: {
            target: 'describing',
            actions: 'recordStartTime',
          },
        },
      },
      describing: {
        invoke: {
          src: 'promptForDescription',
          onDone: {
            target: 'ideating',
            actions: assign({
              description: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      ideating: {
        entry: 'sendIdeateAnalytics',
        invoke: {
          src: 'ideateProject',
          onDone: {
            target: 'savingSpec',
            actions: assign({
              specificationContent: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      savingSpec: {
        entry: 'sendSaveSpecAnalytics',
        invoke: {
          src: 'saveSpec',
          onDone: {
            target: 'done',
            actions: [
              assign({
                specPath: ({ event }) => event.output,
              }),
              'recordEndTime',
            ],
          },
          onError: {
            target: 'error',
            actions: 'recordError',
          },
        },
      },
      done: {
        type: 'final',
        entry: 'sendCompletionAnalytics',
        output: ({ context }) => ({
          specPath: context.specPath,
          duration: context.endTime ? context.endTime - (context.startTime || 0) : 0,
        }),
      },
      error: {
        entry: 'sendErrorAnalytics',
      },
    },
    initial: 'idle',
  }).implement({
    actors: {
      // Implement the services using our existing actions
      promptForDescription: () => async () => {
        return await promptDescription();
      },
      ideateProject: ({ context }) => async () => {
        if (!context.description) {
          throw new Error("Description is required for ideation");
        }
        return await actionIdeate(context.description, context.cliContext);
      },
      saveSpec: ({ context }) => async () => {
        if (!context.specificationContent) {
          throw new Error("Specification content is required to save");
        }
        
        // Ensure .spectacular folder exists
        await saveSpectacularFolder(context.cliContext);
        
        // Save the specification
        return await actionSaveSpec(context.specificationContent, context.cliContext);
      },
    },
    actions: {
      // Analytics events
      sendIdeateAnalytics: ({ context }) => {
        const event = {
          type: 'ANALYTICS',
          action: 'ideate_started',
          data: {
            descriptionLength: context.description?.length || 0,
          },
        };
        // Use XState's built-in event sending
        return { type: 'xstate.send', event };
      },
      sendSaveSpecAnalytics: () => {
        const event = {
          type: 'ANALYTICS',
          action: 'save_spec_started',
          data: {},
        };
        return { type: 'xstate.send', event };
      },
      sendCompletionAnalytics: ({ context }) => {
        const event = {
          type: 'ANALYTICS',
          action: 'spec_generation_completed',
          data: {
            duration: context.endTime ? context.endTime - (context.startTime || 0) : 0,
          },
        };
        return { type: 'xstate.send', event };
      },
      sendErrorAnalytics: ({ context }) => {
        const event = {
          type: 'ANALYTICS',
          action: 'spec_generation_error',
          data: {
            error: context.error?.message,
          },
        };
        return { type: 'xstate.send', event };
      },
    },
  });
};

// Create an actor from the machine
export const createSpecGenerationActor = (cliContext: CliContext) => {
  const machine = createSpecGenerationMachine(cliContext);
  return createActor(machine);
}; 