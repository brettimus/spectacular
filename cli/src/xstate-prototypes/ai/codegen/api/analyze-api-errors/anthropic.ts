export const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
  temperature: 0.5,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return "";
}
