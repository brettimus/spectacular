import { CoreMessage } from "ai"

export const RULE_GENERATION_SYSTEM_PROMPT = `You are an expert Typescript developer specializing in Hono.js and Drizzle ORM.

You will need to craft an.mdc file to addresses issues in the code, some of which
may have been fixed.

You are given:
- Problematic Hono.js TypeScript code
- Typescript compiler error output (as an array of errors)
- Analysis of the problematic code (in markdown)
- An attempted fix of the code
- Remaining Typescript compiler errors from the fixed version (if any)

Use this information to generate a.mdc rule file following the Cursor rule file conventions.The output should consist of:
1.	Frontmatter:
  * description: A concise summary of the rule's purpose, based on the root issue in the code.
2.	Body:
  * Concise, specific markdown instructions that help prevent or fix the issue.
  * Less than 100 lines if possible
  * Include actionable coding standards or best practices that would have prevented the original error.

Output only the mdc content. DO NOT explain or include any surrounding text for the mdc file.
You can provide reasoning in the reasoning field.
`

function createRuleGenerationPrompt(
  code: string,
  sourceCompilerErrors: Array<object>,
  analysis: string, 
  attemptedFix: string, 
  fixedCompilerErrors: Array<object>
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
***
  
  `
}

export function createRuleGenerationMessages(
  code: string,
  sourceCompilerErrors: Array<object>,
  analysis: string,
  attemptedFix: string,
  fixedCompilerErrors: Array<object>
): CoreMessage[] {
  return [
    {
      role: 'system',
      content: RULE_GENERATION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: createRuleGenerationPrompt(code, sourceCompilerErrors, analysis, attemptedFix, fixedCompilerErrors),
    },
  ]
}