import { setup, assign } from "xstate";
import type { QuestionTextStreamResult } from "./types";
import type { ResponseMessage } from "./types";
import { consumeStreamActor } from "./consume";

type QuestionTextStreamOutput = {
  // ResponseMessage[] is the type of `await (streamText(...).response).messages`
  // and it contains the final array of messages from the response
  // for some reason, the Ai SDK does not export this type
  responseMessages: ResponseMessage[];
};

// Create a state machine to handle the streaming process
export const aiTextStreamMachine = setup({
  types: {
    context: {} as {
      chunks: string[];
      fullContent: string;
      error: Error | null;
      streamResponse: QuestionTextStreamResult;
      responseMessages: ResponseMessage[];
    },
    input: {} as {
      streamResponse: QuestionTextStreamResult;
    },
    events: {} as
      | { type: "CHUNK"; content: string }
      | { type: "STREAM_COMPLETE" }
      | { type: "STREAM_ERROR"; error: Error },
    output: {} as QuestionTextStreamOutput,
  },
  actors: {
    consumeStream: consumeStreamActor,
  },
}).createMachine({
  id: "streamProcessor",
  initial: "processing",
  context: ({ input }) => ({
    chunks: [],
    fullContent: "",
    error: null,
    streamResponse: input.streamResponse,
    responseMessages: [],
  }),

  states: {
    processing: {
      invoke: {
        src: "consumeStream",
        input: ({ context, self }) => ({
          streamResponse: context.streamResponse,
          parent: self,
        }),
        // FIXME
        //
        // onError: {
        //   target: "failed",
        //   actions: assign({
        //     error: ({ event }) => event.error,
        //     responseMessages: ({ context }) => context.responseMessages,
        //   }),
        // },
        onDone: {
          target: "complete",
          actions: [
            assign({
              // FIXME
              // @ts-expect-error - Need to handle onError separately
              responseMessages: ({ event }) => event.output.responseMessages,
            }),
          ],
        },
      },

      on: {
        CHUNK: {
          actions: assign({
            chunks: ({ context, event }) => [...context.chunks, event.content],
            fullContent: ({ context, event }) =>
              context.fullContent + event.content,
          }),
        },
        // STREAM_COMPLETE: {
        //   target: "complete",
        // },
        STREAM_ERROR: {
          target: "failed",
          actions: assign({
            error: ({ event }) => event.error,
            responseMessages: ({ context }) => context.responseMessages,
          }),
        },
      },
    },

    complete: {
      type: "final",
    },

    failed: {
      type: "final",
    },
  },
  output: ({ context }) => ({
    success: true, // FIXME
    error: context.error, // FIXME
    content: context.fullContent,
    chunks: context.chunks,
    responseMessages: context.responseMessages, // FIXME?
  }),
});
