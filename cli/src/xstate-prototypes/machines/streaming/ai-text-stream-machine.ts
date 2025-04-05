import { type AnyActorRef, assign, setup } from "xstate";
import { normalizeError } from "../../utils";
import { consumeStreamActor } from "./consume-stream";
import type { CancelEvent, ChunkEvent } from "./events";
import type { AiResponseMessage, AiTextStreamResult } from "./types";

type AiTextStreamOutput = {
  /**
   * ResponseMessage[] is the type of `await (streamText(...).response).messages`
   * and it contains the final array of messages from the response
   * for some reason, the vercel AI SDK does not export this type
   */
  responseMessages: AiResponseMessage[];
};

/**
 * This state machine can consume a stream of text from the AI SDK.
 * It emits chunk events for each chunk of text, sending them to the parent actor.
 */
export const aiTextStreamMachine = setup({
  types: {
    context: {} as {
      chunks: string[];
      error: Error | null;
      streamResponse: AiTextStreamResult;
      responseMessages: AiResponseMessage[];
      parent: AnyActorRef;
    },
    input: {} as {
      streamResponse: AiTextStreamResult;
      parent: AnyActorRef;
    },
    events: {} as ChunkEvent | CancelEvent,
    output: {} as AiTextStreamOutput,
  },
  actions: {
    appendChunk: assign({
      chunks: ({ context }, params: { content: string }) => [
        ...context.chunks,
        params.content,
      ],
    }),
  },
  actors: {
    consumeStream: consumeStreamActor,
  },
}).createMachine({
  id: "streamProcessor",
  description: "A state machine to consume a stream of text from the AI SDK.",
  initial: "Processing",
  context: ({ input }) => ({
    chunks: [],
    error: null,
    streamResponse: input.streamResponse,
    responseMessages: [],
    parent: input.parent,
  }),

  states: {
    Processing: {
      invoke: {
        id: "consumeStream",
        src: "consumeStream",
        input: ({ context, self }) => ({
          streamResponse: context.streamResponse,
          parent: self,
        }),
        onError: {
          target: "Failed",
          actions: [
            assign({
              // NOTE - I couldn't seem to use the `params` field properly in `onError` with typescript,
              //        so we're using an inlined action to handle the error here
              error: ({ event }) => normalizeError(event.error),
              responseMessages: ({ context }) => context.responseMessages,
            }),
          ],
        },
        onDone: {
          target: "Complete",
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
        "textStream.chunk": {
          actions: [
            ({ event, context }) => {
              context.parent.send(event);
            },
            {
              type: "appendChunk",
              params: ({ event }) => ({ content: event.content }),
            },
          ],
        },
        "textStream.error": {
          target: "Failed",
          actions: assign({
            error: ({ event }) => event.error,
            responseMessages: ({ context }) => context.responseMessages,
          }),
        },
      },
    },

    Complete: {
      type: "final",
    },

    Failed: {
      type: "final",
    },
  },
  output: ({ context }) => ({
    chunks: context.chunks,
    responseMessages: context.responseMessages,
    error: context.error,
  }),
});
