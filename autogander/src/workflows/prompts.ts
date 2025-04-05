import type { CoreMessage } from "ai";

export const RULE_GENERATION_SYSTEM_PROMPT = `You are an expert Typescript developer specializing in Hono.js and Drizzle ORM.

You will need to craft markdown rule files to addresses issues in the code, some of which may have been fixed,
but others may not have been fixed.

You are given:
- Problematic Hono.js TypeScript code
- Typescript compiler error output (as an array of errors)
- Analysis of the problematic code (in markdown)
- An attempted fix of the code
- Remaining Typescript compiler errors from the fixed version (if any)

Use this information to generate markdown rule files.
The output should consist of:
  * Concise, specific markdown instructions that help prevent or fix the issue.
  * An example of GOOD and BAD code that demonstrates the rule.
  * Do not go into coding standards or more general pontification.
  * Be clear and to the point.

Here is an example of a rule file:
[EXAMPLE RULE]
${getExampleRule()}
[END EXAMPLE RULE]

Output only the mdc content. DO NOT explain or include any surrounding text for the mdc file.
You can provide reasoning in the reasoning field.

Skip rules that are not relevant to using Hono.js and Drizzle ORM.
Do not share learnings about application logic that is specific to the project,
instead take this as a moment to teach yourself more about the framework and libraries.
`;

function createRuleGenerationPrompt(
  code: string,
  sourceCompilerErrors: Array<object>,
  analysis: string,
  attemptedFix: string,
  fixedCompilerErrors: Array<object>,
) {
  return `
[CODE]
${code}
[END CODE]
***
[TYPESCRIPT COMPILER ERRORS]
${sourceCompilerErrors}
[END TYPESCRIPT COMPILER ERRORS]
***
[ERROR ANALYSIS]
${analysis}
[END ERROR ANALYSIS]
***
[ATTEMPTED FIX]
${attemptedFix}
[END ATTEMPTED FIX]
***
[REMAINING ERRORS]
${fixedCompilerErrors}
[END REMAINING ERRORS]
***`;
}

export function createRuleGenerationMessages(
  code: string,
  sourceCompilerErrors: Array<object>,
  analysis: string,
  attemptedFix: string,
  fixedCompilerErrors: Array<object>,
): CoreMessage[] {
  return [
    {
      role: "system",
      content: RULE_GENERATION_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: createRuleGenerationPrompt(
        code,
        sourceCompilerErrors,
        analysis,
        attemptedFix,
        fixedCompilerErrors,
      ),
    },
  ];
}

function getExampleRule() {
  return `To combine multiple conditions in a query, use the and helper from the "drizzle-orm" package.

   \`\`\`typescript
  import { Hono } from 'hono';
  import { and } from 'drizzle-orm';

  type Bindings = {
    DB: D1Database;
  };

  const app = new Hono<{ Bindings: Bindings }>();

  app.get('/', async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(schema.goals).where(and(eq(schema.goals.id, 1), eq(schema.goals.title, 'My Goal')));
    return c.json(result);
  });

  export default app;
  \`\`\`
`;
}
