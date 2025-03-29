import type { GeneratedPlan } from "@/agents/ideation-agent/generate-spec";
import type { Message } from "ai";
import { fromPromise } from "xstate";

export const generatePlanActor = fromPromise<
  GeneratedPlan,
  { messages: Message[] }
>(async () => {
  console.log("--> generating the plan!");
  await new Promise((r) => setTimeout(r, 5000));
  return {
    title: "Hi",
    plan: "# This is a plan\nnvm wait i got lost",
  };
});
