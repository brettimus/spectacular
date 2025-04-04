import { readFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateObject } from "ai";
import { z } from "zod";
import type { FpModelProvider } from "@/xstate-prototypes/ai";
import { aiModelFactory } from "@/xstate-prototypes/ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testSpec = readFileSync(path.join(__dirname, "test-spec.md"), "utf-8");

if (!testSpec) {
  throw new Error("Test spec not found");
}

const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
} as const;

// NOTE - Needed to use 3.5 because 3.7 would not respect the json schema!
const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-5-sonnet-20241022",
  modelProvider: "anthropic",
} as const;

type CreateSpecOptions = {
  apiKey: string;
  aiProvider: FpModelProvider;
};

// Schema remains the same
const GeneratedSpecSchema = z.object({
  projectDirName: z
    .string()
    .describe("A valid unix style directory name for the project"),
  spec: z
    .string()
    .describe(
      "A CREATIVE AND NOVEL and detailed implementation plan / handoff document for a developer to implement the project (in markdown).",
    ),
});

type GeneratedSpec = z.infer<typeof GeneratedSpecSchema>;

const SYSTEM_PROMPT = `You are an expert AI assistant that helps come up with ideas for typescript apis deployed on Cloudflare.

You create spec documents that can be handed off to a developer to implement the project.

The spec should be in markdown format.

The spec should be in the following format:

# <spec-title>

<spec-content>

Here is an example of a spec:

***
[EXAMPLE_SPEC]
${testSpec}
[END_EXAMPLE_SPEC]
***

You should create a spec at random, but with the following constraints:

- The spec is for a data api
- Do not copy the example spec idea, try to think of a novel idea for a data api

Create a spec that conforms to the following json shape:

{
  "projectDirName": "<project-dir-name>",
  "spec": "<spec-content>"
}

IT IS VERY IMPORTANT THAT YOU RESPOND IN JSON. I AM TALKING TO YOU CLAUDE!!!!!!! DO NOT FUCK THIS UP.
`;

// TODO - Create a spec
export async function createSpec({
  apiKey,
  aiProvider,
}: CreateSpecOptions): Promise<GeneratedSpec> {
  const model = fromModelProvider(aiProvider, apiKey);

  const result = await generateObject({
    model,
    system: SYSTEM_PROMPT,
    prompt: "Create a spec",
    schema: GeneratedSpecSchema,
    temperature: 0.55,
  });

  return result.object;
}

function fromModelProvider(
  aiProvider: FpModelProvider,
  apiKey: string,
  aiGatewayUrl?: string,
) {
  switch (aiProvider) {
    case "openai":
      return aiModelFactory({
        apiKey,
        modelDetails: OPENAI_STRATEGY,
        aiGatewayUrl,
      });
    case "anthropic":
      return aiModelFactory({
        apiKey,
        modelDetails: ANTHROPIC_STRATEGY,
        aiGatewayUrl,
      });
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
