import type { Message } from "ai";
import { evalite } from "evalite";
import { AskedOneQuestion } from "./scorers/asked-one-question";
import { getConversationTestDataFile } from "./utils";

function getTestData(): { input: Message }[] {
  const files = ["dog-fashion-recommendations-api--debug.json"];
  return files.flatMap((file) => {
    // TODO - Validate data structure
    const data = getConversationTestDataFile<{ messages: Message[] }>(file);
    const assistantMessages = data.messages.filter(
      (m) => m.role === "assistant",
    );
    return assistantMessages.map((message: Message) => ({
      input: message,
    }));
  });
}

evalite("Asked One Question", {
  // A function that returns an array of test data
  data: async () => {
    return getTestData();
  },
  // The task to perform
  // - TODO: Replace with your LLM call
  task: async (input) => {
    return input.content;
  },
  // The scoring methods for the eval
  scorers: [AskedOneQuestion],
});
