# spectacular-cli

A CLI that helps you generate spectacular specs.

## Usage

```bash
npx @fiberplane/spectacular-cli@latest
```

## Development

### Important Files for LLM Calls

- `src/commands` - Code for the different cli commands (e.g. `init`, `create-schema`, `apikey:list`, etc.)
- `src/actions` - Code that implements CLI logic
  - `src/actions/ideate.ts` - Logic for the back-and-forth between user and assistant before generating the spec
- `src/integrations/` - Code for integrations with LLM calls
  - `src/integrations/ideation-agent` - LLM calls for the spec generation
  - `src/integrations/schema-agent` - LLM calls for the Drizzle database schema generation

### Evals

We're using [Evalite](https://evalite.dev/) to evaluate the CLI.

- `evals/` - Directory with eval code
- `evals/scorers/asked-one-question/` - Code that implements an LLM-as-a-judge scorer to verify that messages from the assistant go one-by-one when interacting with the end user.

### Local Development

To test individual commands, you can run them directly with the dev scripts:

- `npm run dev`
- `npm run dev:create-schema`
- `npm run dev:create-api`
- `npm run dev:apikey:add`
- `npm run dev:apikey:list`
- `npm run dev:apikey:remove`
