export const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
  temperature: 0,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return `
You are an expert in database schema design specializing in selecting the appropriate database rules.
Your task is to analyze a list of database tables and operations and determine which rules should be applied.

A rule is a guideline or pattern for implementing specific database features like authentication, real-time data, etc.
`;
}
