import { openai } from "@ai-sdk/openai";
import { type Message, generateObject } from "ai";
import { createScorer } from "evalite";
import { z } from "zod";
import { cacheResult, getCachedResult } from "./cache";

/**
 * Follow-up question scorer using OpenAI's GPT-4o-mini model.
 */
export const AskedOneQuestion = createScorer<Message, string>({
  name: "Asked One Question",
  // For reference:
  // `input` comes from `data`
  // `expected` also comes from `data`
  // `output` is the output of `task`
  //
  // As of writing, this scorer expects that
  // `input` - is a Message object
  // `expected` - is not defined
  // `output` - is the assistant's response
  scorer: async ({ input, expected: _expected, output }) => {
    if (!input?.id) {
      throw new Error(
        "Message ID is required to score (and cache the score of) the assistant's response.",
      );
    }

    // Check if we have a cached result for this message ID
    const cachedResult = getCachedResult(input.id);
    if (cachedResult) {
      console.log(`Using cached result for message ID: ${input.id}`);
      return cachedResult;
    }

    // No cached result, perform the evaluation
    const result = await askedOneQuestion({
      question: output,
    });

    // Cache the result if we have a message ID
    if (input?.id) {
      return cacheResult(input.id, result);
    }

    return result;
  },
});

/**
 * Checks that the LLM adhered to only asking one follow-up question.
 */
const askedOneQuestion = async (opts: {
  question: string;
}) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    // TODO - Give multi-shot examples
    prompt: `
      You are evaluating a follow-up question asked by an assistant,
      where the assistant is trying to help the user flesh out necessary information for a software project.

      [BEGIN DATA]
      ************
      [Assistant Response]: ${opts.question}
      ************
      [END DATA]

      Score the assistant's response by selecting one of the following options:

      (A) The response only asked one follow-up question to the user.
      (B) The response asked two or more questions, but the additional questions were to give more context or examples to the initial question.
      (C) The response asked two or more questions, and they seemed to be to different topics or pieces of functionality.
      (D) The response didn't ask any questions at all.
    `,
    schema: z.object({
      answer: z.enum(["A", "B", "C", "D"]).describe("Your selection."),
      rationale: z
        .string()
        .describe("Why you chose this answer. Be very detailed."),
    }),
  });

  /**
   * LLM's are well documented at being poor at generating numbers.
   * We use a simple mapping to convert the LLM's answer into a score.
   */
  const scores = {
    A: 1,
    B: 0.9,
    C: 0.2,
    D: 0,
  };

  return {
    score: scores[object.answer],
    metadata: {
      rationale: object.rationale,
    },
  };
};
