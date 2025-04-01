import { getLogger, configure } from "@logtape/logtape";
import { categorizeError } from "./categorize-error";
import { APICallError, NoObjectGeneratedError, ToolExecutionError } from "ai";

let loggerState: "dormant" | "active" = "dormant";

// Initialize LogTape with console sink
export async function initializeLogger() {
  if (loggerState === "active") {
    return;
  }

  await configure({
    sinks: {
      console: (log) => {
        console.log(log);
      },
    },
    loggers: [
      {
        category: ["spectacular-cli"],
        sinks: ["console"],
      },
    ],
  });

  loggerState = "active";
}

// Create namespaced loggers for different components
const logger = getLogger(["spectacular-cli"]);

interface RequestContext {
  method?: string;
  path?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

interface LogContext {
  stage?: string;
  request?: RequestContext;
  env?: Record<string, unknown>;
  [key: string]: unknown;
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Unified logging function that handles both messages and errors
 * @param level - Log level to use
 * @param messageOrError - String message or Error object to log
 * @param context - Optional context object
 */
export function log(
  level: LogLevel,
  messageOrError: string | Error,
  context?: LogContext,
) {
  if (messageOrError instanceof Error) {
    const {
      category,
      level: errorLevel,
      code,
      userMessage,
    } = categorizeError(messageOrError);

    const metadata = {
      errorType: messageOrError.constructor.name,
      category,
      code,
      userMessage,
      stack: messageOrError.stack,
      ...context,
    };

    // Add error-specific metadata
    if (messageOrError instanceof APICallError) {
      Object.assign(metadata, {
        cause: messageOrError.cause,
        responseBody: messageOrError.responseBody,
        requestBodyValues: messageOrError.requestBodyValues,
      });
    } else if (messageOrError instanceof NoObjectGeneratedError) {
      Object.assign(metadata, {
        cause: messageOrError.cause,
        response: messageOrError.response,
        usage: messageOrError.usage,
      });
    } else if (messageOrError instanceof ToolExecutionError) {
      Object.assign(metadata, {
        cause: messageOrError.cause,
      });
    }

    // For errors, we use the categorized level unless explicitly overridden
    logger[level || errorLevel](messageOrError.message, metadata);
    return { code, category, level: level || errorLevel, userMessage };
  }

  logger[level](messageOrError, context);
  return null;
}
