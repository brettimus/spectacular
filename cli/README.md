# spectacular-cli

> **This repo is very WIP**

## Setup

```sh
# in this `cli` directory
pnpm install

# again in the `cli` directory, create a .env file
touch .env

# add your API key, either OPENAI_API_KEY or ANTHROPIC_API_KEY,
# depending on the provider you configer for autonomous mode
```

## Commands

```sh
# Run autonomous mode
pnpm auto

# Run the chat machine in the CLI
pnpm chat
```

## Autonomous Mode

```sh
# Run autonomous mode
pnpm auto
```

Configuring:

- Look in `autonomous.smoketest.ts`
- Set the number of iterations you want to run (`MAX_ITERATIONS`)
- Change the `AI_PROVIDER` to `"openai"` or `"anthropic"`
  - If `"openai"`, you'll need to set the `OPENAI_API_KEY` in your `.env` file
  - If `"anthropic"`, you'll need to set the `ANTHROPIC_API_KEY` in your `.env` file

NOTE:

- Projects will be saved in the `<cli-root>/../spectacular-autonomous` directory
- Logs will be saved in the `<cli-root>/../spectacular-autonomous-logs` directory

- Specs are created via an LLM call, instead of via chat.
  - See: `create-spec.ts`

## Folder Structure

```
xstate-prototypes/
│
├── adapters/          # Adapters for different environments (CLI, Workers, etc.)
│
├── ai/                # AI integration components
│   ├── chat/          # AI chat-related state machines (ask-next-question, generate-spec, router)
│   └── codegen/       # AI code generation state machines
│       ├── api/       # API-related code generation 
│       └── schema/    # DB Schema-related code generation
│
├── machines/          # Core state machines
│   ├── chat/          # Chat machine implementations
│   ├── codegen/       # Code generation machine implementations
│   ├── configure-workspace/ # Workspace configuration machines
│   └── streaming/     # Streaming related machines
│
├── smoketests/        # Tests to verify basic functionality
│
├── typechecking/      # Type checking utilities
│
└── utils/             # Includes logging (logtape), and higher order functions for actors
```
## Notes

### Initial Impressions

**There is a trade-off**

- There is a learning curve to xstate, probably a few days of going through the docs and poking at things

- Simple things are more complex
  - I had to write code to plug into text streaming from the ai sdk
  - Control flow for a CLI app is not straightforward to be honest
  - Anytime you add a new state, you're doing a lot of changes to the machine

- Complex things are simpler
  - You can adapt core logic to different targets without changing a bunch of code or copy-pasting the ai calls
  - Timeouts, delays, etc. are easier to reason about

**Supporting multiple targets (cli, Workers) will require an adapter pattern**

- Rewriting the CLI with an adapter pattern will be quite clunky
- In order to visually document machines, we'll likely need adapters to run the machines in the browser

