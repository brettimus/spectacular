import type { Message } from "ai";

export function createUserMessage(content: string): Message {
  return {
    id: randomMessageId(),
    content,
    role: "user",
    parts: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

function randomMessageId(): string {
  return Math.random().toString(36).substring(2);
}
