# xstate-prototypes

This is a collection of prototypes / findings for using xstate to manage the state of an agential codegen workflow.

## Initial Impressions

**There is a trade-off**

- Simple things are more complex
- Complex things are simpler

**Supporting multiple targets (cli, Workers) will require an adapter pattern**

- Rewriting the CLI with an adapter pattern will be quite clunky

**One of the main benefits of xstate is the ability to inspect the state of the machine, but this is really hard to do when you're not running machines in the browser.** There might be a workaround, but it seems like quite a bit of work.

There is an inspector that fires WebSocket events, which you can forward to Stately.ai's web inspector via an iframe, but I couldn't get this to work.

- Commit with my work: 9337fb94f20087eaa308dc43a1cde61d02f78d4f.
- Related issue (see last comment) https://github.com/statelyai/inspect/issues/6
- I hit this issue in the makeshift webpage I spun up: https://github.com/statelyai/inspect/issues/41
- TODO - Create a simple app with vite that just runs a browswer adapted version of the machines, in order to give visual documentation for them.

