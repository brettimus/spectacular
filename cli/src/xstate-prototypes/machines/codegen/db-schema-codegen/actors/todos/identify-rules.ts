import type { SelectedRule } from "@/xstate-prototypes/ai";
import { identifyRules as identifyRulesAi } from "@/xstate-prototypes/ai";
import type { FpAiConfig } from "@/xstate-prototypes/ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import { fromPromise } from "xstate";

export const identifyRulesActor = fromPromise<
  { relevantRules: SelectedRule[] },
  {
    aiConfig: FpAiConfig;
    schemaSpecification: string;
    noop: boolean;
  }
>(async ({ input, signal }) => {
  const { aiConfig, schemaSpecification, noop: isNoop } = input;

  try {
    log("debug", "Identifying rules for schema", {
      schemaSpecLength: schemaSpecification.length,
    });

    const result = await identifyRulesAi(
      aiConfig,
      {
        schemaSpecification,
      },
      isNoop,
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
