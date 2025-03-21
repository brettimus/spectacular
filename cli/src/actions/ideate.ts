import type { Context } from "@/context";
import { log, spinner, stream } from "@clack/prompts";
import { appendResponseMessages, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import pico from "picocolors";

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
export const IDEATING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Remember, only one question at a time.

Here's the idea:
`;

export async function actionIdeate(ctx: Context) {
  const description = ctx.description;

  // This shouldn't happen, i just want to appease typescript
  if (!description) {
    log.error("Description is required");
    process.exit(1);
  }

  const s = spinner();
  s.start("Getting ready to ideate...");

  ctx.messages.push({
    id: randomMessageId(),
    content: description,
    role: "user",
    parts: [{
      type: "text",
      text: description,
    }],
  })

  const streamResponse = streamText({
    model: openai('gpt-4o-mini'),
    system: IDEATING_SYSTEM_PROMPT,
    messages: ctx.messages,
  });

  await stream.info((async function* () {
    let hasStarted = false;
    // Yield content from the AI SDK stream
    for await (const chunk of streamResponse.textStream) {
      if (!hasStarted) {
        hasStarted = true;
        s.stop(pico.italic("ándale"));
        log.info("");
        yield `  ${chunk}`;
      } else {
        yield chunk;
      }
    }
  })());

  const response = await streamResponse.response;

  ctx.messages = appendResponseMessages({
    messages: ctx.messages,
    responseMessages: response.messages,
  });

  
  // const followOn = await askLLM(description);

  // s.stop();

  // Move cursor up one line to remove the extra newline
  // process.stdout.write("\x1B[1A");
  
  return;
}

// async function askLLM(prompt: string): Promise<string> {
//   try {
//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.7,
//       max_tokens: 500,
//     });

//     return response.choices[0]?.message.content || "No response generated";
//   } catch (error) {
//     console.error("Error querying OpenAI:", error);
//     return "Failed to get a response from the AI";
//   }
// }

// async function* generateLLMResponse(prompt: string) {
//   try {
//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     const stream = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         { role: "system", content: "You are a helpful assistant specialized in programming. Provide clear and concise responses." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.7,
//       max_tokens: 1000,
//       stream: true,
//     });

//     for await (const chunk of stream) {
//       const content = chunk.choices[0]?.delta?.content || "";
//       if (content) {
//         yield content;
//       }
//     }
//   } catch (error) {
//     yield `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
//   }
// }


function randomMessageId() {
  return Math.random().toString(36).substring(2);
}