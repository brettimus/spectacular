import type { streamText } from "ai";

export type ResponseMessage = Awaited<
  ReturnType<typeof streamText>["response"]
>["messages"][number];
