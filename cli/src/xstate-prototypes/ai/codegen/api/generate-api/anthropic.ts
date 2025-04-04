export const ANTHROPIC_STRATEGY = {
  // NOTE - Needed to use 3.5 because 3.7 would not respect the json schema!
  modelName: "claude-3-5-sonnet-20241022",
  modelProvider: "anthropic",
  temperature: 0,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return "";
} 