export const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
  responsesApi: true,
  temperature: 0.5,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return "";
} 