import {
  APICallError,
  DownloadError,
  EmptyResponseBodyError,
  InvalidArgumentError,
  InvalidDataContentError,
  InvalidMessageRoleError,
  InvalidPromptError,
  InvalidResponseDataError,
  InvalidToolArgumentsError,
  JSONParseError,
  LoadAPIKeyError,
  MessageConversionError,
  NoContentGeneratedError,
  NoObjectGeneratedError,
  NoOutputSpecifiedError,
  NoSuchModelError,
  NoSuchProviderError,
  NoSuchToolError,
  RetryError,
  ToolCallRepairError,
  ToolExecutionError,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from "ai";

// Helper to categorize AI errors and map to LogTape severity levels
export function categorizeError(error: Error): {
  category: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  code: string;
  userMessage: string;
} {
  // Input/Validation Errors
  if (
    error instanceof InvalidArgumentError ||
    error instanceof InvalidDataContentError ||
    error instanceof InvalidMessageRoleError ||
    error instanceof InvalidPromptError ||
    error instanceof InvalidToolArgumentsError ||
    error instanceof TypeValidationError
  ) {
    return {
      category: "validation",
      level: "warn",
      code: "VALIDATION_ERROR",
      userMessage: "Invalid input provided",
    };
  }

  // Response/Parsing Errors
  if (
    error instanceof EmptyResponseBodyError ||
    error instanceof InvalidResponseDataError ||
    error instanceof JSONParseError ||
    error instanceof NoContentGeneratedError ||
    error instanceof NoObjectGeneratedError ||
    error instanceof NoOutputSpecifiedError
  ) {
    return {
      category: "response",
      level: "error",
      code: "AI_RESPONSE_ERROR",
      userMessage: "Failed to process AI response",
    };
  }

  // Configuration/Setup Errors
  if (
    error instanceof LoadAPIKeyError ||
    error instanceof NoSuchModelError ||
    error instanceof NoSuchProviderError
  ) {
    return {
      category: "configuration",
      level: "fatal",
      code: "CONFIGURATION_ERROR",
      userMessage: "Service configuration error",
    };
  }

  // Tool/Function Related Errors
  if (
    error instanceof NoSuchToolError ||
    error instanceof ToolCallRepairError ||
    error instanceof ToolExecutionError
  ) {
    return {
      category: "tool",
      level: "error",
      code: "TOOL_ERROR",
      userMessage: "Error executing AI tool",
    };
  }

  // Infrastructure/Network Errors
  if (
    error instanceof APICallError ||
    error instanceof DownloadError ||
    error instanceof RetryError
  ) {
    return {
      category: "infrastructure",
      level: "error",
      code: "INFRASTRUCTURE_ERROR",
      userMessage: "Service temporarily unavailable",
    };
  }

  // Special Cases
  if (
    error instanceof MessageConversionError ||
    error instanceof UnsupportedFunctionalityError
  ) {
    return {
      category: "other",
      level: "error",
      code: "INTERNAL_ERROR",
      userMessage: "Internal service error",
    };
  }

  return {
    category: "unknown",
    level: "error",
    code: "UNKNOWN_ERROR",
    userMessage: "An unexpected error occurred",
  };
}
