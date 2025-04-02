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
├── codegen/          # Codegen-related state machines and utilities
│
├── streaming/        # Streaming machines for `streamText`
│
└── utils/            # Includes logging (logtape), and higher order functions to add logic to actors
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

### The Inspector

Docs: https://stately.ai/docs/inspector

> For our implementation, see the folder: [`../../inspector-ui`](../../inspector-ui)

**One of the main benefits of xstate is the ability to visually document and inspect the state of the machine, but this is kinda hacky to do when you're not running machines in the browser.**

I've added a workaround by spinning up a simple vite app that runs the current `ChatMachine` with node polyfills. That said, arriving at this solution was _a pain_, and was odd because there is an adapter that's supposed to work over WebSockets, but it's undocumented and didn't work for me I don't like that we can't just... send events over WebSockets, and instead have to shim the machine for the browser to get the inspector to work. 

The fact that we _must_ run the machine in the browser is a bit of a pain, and might make it difficult to support a target like Cloudflare Workers without using an adapter pattern on top of core machine logic.

Regarding the inspector that fires WebSocket events, which you can forward to Stately's web inspector via an iframe, but I couldn't get it to work properly at all. (I tried serving a websocket server from a Hono app and proxying the events to an iFrame that served the stately UI, but the page kept saying "You entered an invalid state" or something like that.)

- Commit with my initial inspector work: 9337fb94f20087eaa308dc43a1cde61d02f78d4f.
- Related issue (see last comment) https://github.com/statelyai/inspect/issues/6
- I hit this issue in the first makeshift webpage I spun up: https://github.com/statelyai/inspect/issues/41
- The only thing that worked after a few hours of experimentation was to just run the machine in the browser.


## Logging

Tried looking into Pino, but it isn't supported in Cloudflare Workers out of the box so nixed that. I liked log layer as a general solution so we could swap out the transport layer easily, but they don't have support for.... logtape! 

Went with logtape since we're using it in Cloudflare Workers already.

## Naming conventions

### State Names
Using PascalCase (capitalized state names) is considered good practice for XState state machines. 

The official ESLint plugin for XState supports this convention, though XState itself doesn't enforce any particular format. 

While camelCase is used in some official XState documentation, PascalCase helps visually distinguish states in our code.

### Event Names
For event names, the recommended convention in XState v5 is to use `"dot.case"`. This style is strongly encouraged because it enables the new wildcard transitions feature in v5, where you can match multiple related events like `battery.*`.

This dot notation creates a visual distinction from other names in the state machine, which is nice.

### Actor Naming

Use camelCase for actor (function) names.

```ts
const routeRequestActor = createActor(routeRequestMachine, {
  input: {
    apiKey: "...",
  },
});
```

When `invoke`ing an actor, it's perfectly fine to use the same name for the `id` and `src` properties.

The `src` just needs to uniquely identify the actor within the state machine. The `name` should be unique for all spawned actors and invoked services.

```ts
    FollowingUp: {
      invoke: {
        id: "askNextQuestion",
        src: "askNextQuestion",
        input: ({ context }) => ({
          apiKey: context.apiKey,
          messages: context.messages,
        }),
      },
    },
```

If you don't provide a name argument to a spawned actor, XState will automatically generate a unique name. For maintainability, it's better to provide meaningful names.
