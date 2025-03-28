import { assign, setup } from "xstate";
import type {
  BaseMachineContext,
  BaseEvent,
  AnalyticsEvent,
  LogEvent,
} from "./types";
import { appendToLog } from "../../utils/credentials";
import path from "node:path";

/**
 * Base setup for all machines with common functionality for:
 * - Error handling
 * - Logging
 * - Analytics tracking
 */
export const createBaseMachine = <
  TContext extends BaseMachineContext,
  TEvent extends BaseEvent,
>() => {
  return setup({
    types: {
      context: {} as TContext,
      events: {} as TEvent,
    },
    actions: {
      // Record the start time
      recordStartTime: assign({
        startTime: () => Date.now(),
      } as any),

      // Record the end time
      recordEndTime: assign({
        endTime: () => Date.now(),
      } as any),

      // Record an error
      recordError: assign({
        error: (_, event: any) => {
          if (event && "error" in event) {
            return event.error as Error;
          }
          return new Error("Unknown error");
        },
      } as any),

      // Log an event to the log file
      logEvent: ({ context }, event: any) => {
        if (event && event.type === "LOG") {
          const logEvent = event as LogEvent;
          const logMessage = {
            timestamp: new Date().toISOString(),
            level: logEvent.level,
            message: logEvent.message,
            data: logEvent.data,
          };

          // Use existing log infrastructure
          const logDir = path.join(
            context.cliContext.cwd,
            ".spectacular",
            "logs",
          );

          appendToLog(
            logDir,
            "machine-events.log",
            `${JSON.stringify(logMessage)}\n`,
          );
        }
      },

      // Record analytics
      recordAnalytics: ({ context }, event: any) => {
        if (event && event.type === "ANALYTICS") {
          const analyticsEvent = event as AnalyticsEvent;
          const analyticsData = {
            timestamp: new Date().toISOString(),
            action: analyticsEvent.action,
            data: analyticsEvent.data,
            sessionId: context.cliContext.sessionId,
            duration: context.endTime
              ? context.endTime - (context.startTime || context.endTime)
              : undefined,
          };

          // Use existing log infrastructure for now, in the future this could send to an API
          const logDir = path.join(
            context.cliContext.cwd,
            ".spectacular",
            "logs",
          );

          appendToLog(
            logDir,
            "analytics-events.log",
            `${JSON.stringify(analyticsData)}\n`,
          );
        }
      },
    },
    guards: {
      // Check if there was an error
      hasError: (context) => !!context.error,
    },
  });
};
