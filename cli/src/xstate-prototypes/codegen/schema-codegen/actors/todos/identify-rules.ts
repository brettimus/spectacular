import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { SelectedRule } from "@/agents/schema-agent/types";
import { identifyRules as identifyRulesAi } from "@/xstate-prototypes/ai/codegen/schema/identify-rules";
import type { FpModelProvider } from "@/xstate-prototypes/ai/ai-model-factory";

export const identifyRulesActor = fromPromise<
  { relevantRules: SelectedRule[] },
  {
    apiKey: string;
    schemaSpecification: string;
    noop: boolean;
    aiProvider?: FpModelProvider;
    aiGatewayUrl?: string;
  }
>(async ({ input, signal }) => {
  const {
    apiKey,
    schemaSpecification,
    noop,
    aiProvider = "openai",
    aiGatewayUrl,
  } = input;

  try {
    log("debug", "Identifying rules for schema", {
      schemaSpecLength: schemaSpecification.length,
    });

    const result = await identifyRulesAi(
      apiKey,
      schemaSpecification,
      noop,
      aiProvider,
      aiGatewayUrl,
      signal,
    );

    log("info", "Rule identification complete", {
      rulesSelected: result.relevantRules.length,
    });

    return result;
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in identify rules"),
    );
    throw error;
  }
});
