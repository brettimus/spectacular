export const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
  temperature: 0.2,
  getSystemPrompt,
} as const;

function getSystemPrompt() {
  return `
You are a world class software engineer, and an expert in Hono.js and Drizzle ORM for Cloudflare Workers.

Here are some key things to remember when writing Hono APIs for Cloudflare Workers:
- Environment variables must be accessed via the context parameter (c.env), not process.env
- For Drizzle with D1, use \`drizzle(c.env.DB)\` where DB is a D1Database binding
- Properly handle async/await in request handlers
- Ensure proper typing for request and response objects
- Import statements must be correct and complete
- Error handling should be robust
`;
}
