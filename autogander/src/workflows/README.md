# Autogander Workflows

This directory contains Cloudflare Workers Workflows that run background jobs for Autogander.

## Rule Workflow

The `RuleWorkflow` is responsible for generating rules based on code fixes. It analyzes fixes in the database that don't have associated rules yet, uses AI to generate appropriate rules, and saves them to the database.

### How It Works

1. **Scheduling**: The workflow runs on an hourly cron schedule (configured in `wrangler.toml`).
2. **Finding Fixes**: It queries the database for fixes that don't have any associated rules yet.
3. **Generating Rules**: For each fix, it uses OpenAI (via Cloudflare AI Gateway) to analyze the original code, errors, fixed code, and analysis to generate a set of rules.
4. **Saving Rules**: Each generated rule is saved to the database as a separate record associated with the fix.

### Testing Locally

To test the workflow locally:

```bash
npx wrangler dev --test-scheduled
```

Then trigger the workflow with:

```bash
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

### Environment Variables

The workflow requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key

You can add these to your `.dev.vars` file for local development.

### Customizing

You can adjust the workflow behavior by modifying these constants:

- `MAX_RETRIES`: Number of retry attempts for workflow steps
- `BASE_DELAY_MS`: Base delay between retries
- `BATCH_SIZE`: Number of fixes to process in a single workflow run

## Adding New Workflows

To add a new workflow:

1. Create a new file for your workflow class (e.g., `my-workflow.ts`)
2. Implement your workflow class extending `WorkflowEntrypoint`
3. Export your workflow class from `index.ts`
4. Add your workflow to `wrangler.toml`
5. Add environment variables and other configuration as needed 