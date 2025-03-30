import type { AnyActorLogic } from "xstate";

/**
 * Wraps an actor logic function with logging of the state and event.
 *
 * @TODO - Make the generic work better or provide examples of how to use it most effectively
 *         with strongly typed actor logic.
 */
export function withLogging<T extends AnyActorLogic>(actorLogic: T) {
  const enhancedLogic = {
    ...actorLogic,
    transition: (state, event, actorCtx) => {
      console.log("State:", state.value);
      return actorLogic.transition(state, event, actorCtx);
    },
  } satisfies T;

  return enhancedLogic;
}
