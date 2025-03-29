# xstate-prototypes

This is a collection of prototypes / findings for using xstate to manage the state of an agential codegen workflow.

**I STILL HAVE NOT TRIED OUT THE AGENT-SPECIFIC XSTATE STUFF!**

## Initial Impressions

**There is a trade-off**

- Simple things are more complex
- Complex things are simpler

**Supporting multiple targets (cli, Workers) will require an adapter pattern**

- Rewriting the CLI with an adapter pattern will be quite clunky
- In order to visually document machines, we'll likely need adapters to run the machines in the browser

## Notes on the Inspector

**One of the main benefits of xstate is the ability to inspect the state of the machine, but this is kinda hacky to do when you're not running machines in the browser.** I've added a workaround by spinning up a vite app that runs the current ChatMachine with node polyfills, but I don't like that we can't just... send events over WebSockets. The fact that we _must_ run the machine in the browser is a bit of a pain, and might make it difficult to support a target like Cloudflare Workers without using adapters out of the box.

There is an inspector that fires WebSocket events, which you can forward to Stately's web inspector via an iframe, but I couldn't get this to work properly. (I tried serving a websocket server from a Hono app and proxying the events to an iFrame that served the stately UI, but it didn't work.)

- Commit with my work: 9337fb94f20087eaa308dc43a1cde61d02f78d4f.
- Related issue (see last comment) https://github.com/statelyai/inspect/issues/6
- I hit this issue in the makeshift webpage I spun up: https://github.com/statelyai/inspect/issues/41
- TODO - Create a simple app with vite that just runs a browswer adapted version of the machines, in order to give visual documentation for them.