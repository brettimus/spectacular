import { AIChatAgent } from "agents-sdk/ai-chat-agent";
import { createOpenAI } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText } from "ai";

type Env = {
  OPENAI_API_KEY: string;
};

type OnFinishHandler = Parameters<AIChatAgent<Env>["onChatMessage"]>[0];

export class DialogueAgent extends AIChatAgent<Env> {
  async onChatMessage(onFinish: OnFinishHandler) {
    return createDataStreamResponse({
      execute: async (dataStream) => {
        const ai = createOpenAI({
          apiKey: this.env.OPENAI_API_KEY,
        });

        const stream = streamText({
          model: ai("gpt-4o"),
          messages: this.messages,
          onFinish, // call onFinish so that messages get saved
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}