# xstate-prototypes

This is a collection of prototypes / findings for using xstate to model an agential codegen workflow as a state machine.

## Commands

```sh
# Run the chat machine in the CLI
pnpm chat

# Run the inspector in the browser
pnpm dev:xstate:inspect
```

## Folder Structure

```
xstate-prototypes/
│
├── adapters/         # Adapters for different environments (CLI, Workers, etc.)
│
├── chat/             # Chat-related state machines and utilities
│   └── actors/       # Actor logic for the chat machine (manages child requests to LLMs, filesystem, etc)
│
├── streaming/        # Streaming machines for `streamText`
│
└── utils/            # Higher order functs to add logic to actors
```

## Notes

**I STILL HAVE NOT TRIED OUT THE AGENT-SPECIFIC XSTATE STUFF!**

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

### The Inspector

> For our implementation, see the folder: [`../../inspector-ui`](../../inspector-ui)

**One of the main benefits of xstate is the ability to visually document and inspect the state of the machine, but this is kinda hacky to do when you're not running machines in the browser.**

I've added a workaround by spinning up a simple vite app that runs the current `ChatMachine` with node polyfills. That said, arriving at this solution was _a pain_, and was odd because there is an adapter that's supposed to work over WebSockets, but it's undocumented and didn't work for me I don't like that we can't just... send events over WebSockets, and instead have to shim the machine for the browser to get the inspector to work. 

The fact that we _must_ run the machine in the browser is a bit of a pain, and might make it difficult to support a target like Cloudflare Workers without using an adapter pattern on top of core machine logic.

Regarding the inspector that fires WebSocket events, which you can forward to Stately's web inspector via an iframe, but I couldn't get it to work properly at all. (I tried serving a websocket server from a Hono app and proxying the events to an iFrame that served the stately UI, but the page kept saying "You entered an invalid state" or something like that.)

- Commit with my initial inspector work: 9337fb94f20087eaa308dc43a1cde61d02f78d4f.
- Related issue (see last comment) https://github.com/statelyai/inspect/issues/6
- I hit this issue in the first makeshift webpage I spun up: https://github.com/statelyai/inspect/issues/41
- The only thing that worked after a few hours of experimentation was to just run the machine in the browser.