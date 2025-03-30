import type { streamText, StreamTextResult, ToolSet } from "ai";

export type QuestionTextStreamResult<
  TOOLS extends ToolSet = ToolSet,
  PartialOutput = never,
> = StreamTextResult<TOOLS, PartialOutput>;

export type ResponseMessage = Awaited<
  ReturnType<typeof streamText>["response"]
>["messages"][number];
