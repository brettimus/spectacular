/**
 * Shared types for the state machines and actors
 */

export type WithTrace<T> = T & {
  traceId?: string;
};
