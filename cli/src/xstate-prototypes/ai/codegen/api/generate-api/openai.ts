export const OPENAI_STRATEGY = {
  modelName: "o3-mini",
  modelProvider: "openai",
  temperature: 0.2,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return "";
} 