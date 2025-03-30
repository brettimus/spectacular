import type { AnyActorLogic } from "xstate";

export function withLogging<T extends AnyActorLogic>(actorLogic: T) {
  const enhancedLogic = {
    ...actorLogic,
    transition: (state, event, actorCtx) => {
      console.log('State:', state.value);
      return actorLogic.transition(state, event, actorCtx);
    },
  } satisfies T;

  return enhancedLogic;
}