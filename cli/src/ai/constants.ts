import type { FpModelProvider } from "./types";

/**
 * Centralized constant for the default AI provider
 *
 * This is used to provide a default provider if one is not specified (typically in a state machine config).
 */
export const DEFAULT_AI_PROVIDER: FpModelProvider = "openai";
