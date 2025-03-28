import type { ActorRefFrom, SnapshotFrom } from "xstate";
import type { Context as CliContext } from "../../context";

// Base event type for all machines
export interface BaseEvent {
  type: string;
}

// Base context type for all machines
export interface BaseMachineContext {
  cliContext: CliContext;
  startTime?: number;
  endTime?: number;
  error?: Error;
}

// Analytics event types
export interface AnalyticsEvent extends BaseEvent {
  type: "ANALYTICS";
  action: string;
  data: Record<string, unknown>;
}

// Logging event types
export interface LogEvent extends BaseEvent {
  type: "LOG";
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

// Healing event types
export interface HealingEvent extends BaseEvent {
  type: "HEALING";
  errors: string[];
  file: string;
  solution?: string;
  successful?: boolean;
}

// Common machine events
export type CommonEvents =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "CANCEL" }
  | { type: "ERROR"; error: Error }
  | AnalyticsEvent
  | LogEvent
  | HealingEvent;

// Generic type for machine reference
export type MachineRef<T> = ActorRefFrom<T>;

// Generic type for machine state snapshot
export type MachineSnapshot<T> = SnapshotFrom<T>;
