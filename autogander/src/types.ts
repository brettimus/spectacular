export type Bindings = {
  DB: D1Database;
  OPENAI_API_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_AI_GATEWAY_ID: string;
  AUTOGANDER_RULE_WORKFLOW: Workflow; // Workflow binding for rule generation
  ADMIN_SECRET: string;
};
