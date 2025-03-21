import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Hono } from "hono";
// import { zValidator } from "@hono/zod-validator";
// import { z } from "zod";

export const maxDuration = 30;

// Create a typed Hono app
const chatRouter = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();

// POST /api/chat endpoint
chatRouter.post("/", async (c) => {
  const { messages } = await c.req.json();

  const openaiClient = createOpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const result = streamText({
    model: openaiClient("gpt-4o-mini"),
    messages,
  });

  return result.toDataStreamResponse();
});

export default chatRouter;
