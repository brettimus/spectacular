// Core types and utilities
import type {
  BaseEvent,
  BaseMachineContext,
  AnalyticsEvent,
  LogEvent,
  HealingEvent,
  CommonEvents,
  MachineRef,
  MachineSnapshot,
} from "./core/types";
import { createBaseMachine } from "./core/base-machine";

// Workflow machines
import {
  createSpecGenerationMachine,
  createSpecGenerationActor,
} from "./workflows/spec-generation";
import {
  createSchemaGenerationMachine,
  createSchemaGenerationActor,
} from "./workflows/schema-generation";

// Commands
import { commandCreateSchemaMachine } from "./commands/create-schema-command";
import {
  commandEvalSpecGeneration,
  commandEvalSchemaGeneration,
  commandEvalFullWorkflow,
} from "./commands/eval-commands";

// Event handlers
import {
  EventHandler,
  getEventHandler,
  sendAnalyticsEvent,
  sendLogEvent,
  sendHealingEvent,
} from "./events/handlers";

// Export core types and utilities
export type {
  BaseEvent,
  BaseMachineContext,
  AnalyticsEvent,
  LogEvent,
  HealingEvent,
  CommonEvents,
  MachineRef,
  MachineSnapshot,
};
export { createBaseMachine };

// Export workflow machines
export {
  createSpecGenerationMachine,
  createSpecGenerationActor,
  createSchemaGenerationMachine,
  createSchemaGenerationActor,
};

// Export commands
export {
  commandCreateSchemaMachine,
  commandEvalSpecGeneration,
  commandEvalSchemaGeneration,
  commandEvalFullWorkflow,
};

// Export event handlers
export {
  EventHandler,
  getEventHandler,
  sendAnalyticsEvent,
  sendLogEvent,
  sendHealingEvent,
};

/**
 * This module provides a redesigned architecture for the Spectacular CLI
 * using XState state machines and the actor model.
 *
 * Key features:
 *
 * 1. Composable workflows - Each feature is broken down into a state machine
 *    with clearly defined states and transitions
 *
 * 2. Event-driven - Events like analytics, logging, and healing are standardized
 *    and can be emitted/consumed across the application
 *
 * 3. Testable - Workflows can be run in isolation for testing and evaluation
 *
 * 4. Extensible - New workflows can be added without modifying existing code
 *
 * Usage:
 *
 * ```typescript
 * // Create and run the spec generation workflow
 * const actor = createSpecGenerationActor(cliContext);
 * actor.start();
 * actor.send({ type: "DESCRIBE_PROJECT" });
 *
 * const result = await actor.getSnapshot().output;
 * console.log(`Spec generated at ${result.specPath}`);
 * ```
 *
 * For commands, use the command wrappers:
 *
 * ```typescript
 * // Run the schema generation command
 * const result = await commandCreateSchemaMachine(specPath);
 *
 * if (result.success) {
 *   console.log(`Schema created at ${result.schemaPath}`);
 * }
 * ```
 *
 * For evaluation and testing:
 *
 * ```typescript
 * // Test only the spec generation
 * await commandEvalSpecGeneration();
 *
 * // Test only the schema generation with a given spec
 * await commandEvalSchemaGeneration("path/to/spec.json");
 *
 * // Test the full workflow end-to-end
 * await commandEvalFullWorkflow();
 * ```
 *
 * Observing state transitions and sending analytics:
 *
 * ```typescript
 * // 1. Simple state transition monitoring
 * const actor = createSchemaGenerationActor(ctx, specPath);
 * actor.start();
 *
 * // Subscribe to state changes
 * const subscription = actor.subscribe((state) => {
 *   // Log every state transition
 *   console.log(`Machine transitioned to: ${state.value}`);
 *
 *   // Send analytics for specific states
 *   if (state.matches("healing")) {
 *     sendAnalyticsEvent(ctx.cwd, "schema_healing_started", {
 *       attempt: state.context.healingAttempt,
 *       specPath
 *     });
 *   }
 *
 *   // Track time spent in states
 *   if (state.matches("done")) {
 *     const duration = Date.now() - startTime;
 *     sendAnalyticsEvent(ctx.cwd, "schema_generation_completed", {
 *       duration,
 *       success: true
 *     });
 *   }
 * });
 *
 * // 2. Create a custom observer with filtering
 * function createWorkflowObserver(actor, options = {}) {
 *   const {
 *     onStateChange,
 *     onError,
 *     filter = () => true,
 *     trackDuration = false
 *   } = options;
 *
 *   const startTime = Date.now();
 *   let lastState = null;
 *
 *   return actor.subscribe((state) => {
 *     // Skip if filter doesn't match
 *     if (!filter(state, lastState)) return;
 *
 *     // Call the state change handler
 *     if (onStateChange) {
 *       const stateData = {
 *         value: state.value,
 *         context: state.context,
 *         duration: trackDuration ? Date.now() - startTime : undefined
 *       };
 *       onStateChange(stateData, lastState);
 *     }
 *
 *     // Call the error handler if there's an error
 *     if (state.context.error && onError) {
 *       onError(state.context.error, state);
 *     }
 *
 *     lastState = state;
 *   });
 * }
 *
 * // 3. Using the observer for multiple tracking purposes
 * const observer = createWorkflowObserver(actor, {
 *   // Only care about specific states
 *   filter: (state) => ["healing", "validatingSchema", "done"].includes(state.value),
 *   trackDuration: true,
 *   onStateChange: (state, prevState) => {
 *     // Send analytics
 *     sendAnalyticsEvent(ctx.cwd, `state_${state.value}`, {
 *       duration: state.duration,
 *       previousState: prevState?.value
 *     });
 *
 *     // Update UI
 *     if (state.value === "healing") {
 *       spinner.message(`Healing schema (attempt ${state.context.healingAttempt})...`);
 *     }
 *   },
 *   onError: (error) => {
 *     sendLogEvent(ctx.cwd, "error", `Workflow error: ${error.message}`);
 *   }
 * });
 *
 * // Don't forget to clean up subscriptions
 * subscription.unsubscribe();
 * observer.unsubscribe();
 * ```
 */
