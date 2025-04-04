import type { streamText, StreamTextResult, ToolSet } from "ai";

export type AiTextStreamResult<
  TOOLS extends ToolSet = ToolSet,
  PartialOutput = never,
> = StreamTextResult<TOOLS, PartialOutput>;

export type AiResponseMessage = Awaited<
  ReturnType<typeof streamText>["response"]
>["messages"][number];
