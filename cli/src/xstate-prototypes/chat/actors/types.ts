export type RouterResponseType =
  | "ask_follow_up_question"
  | "generate_implementation_plan";

export type RouterResponse = {
  nextStep: RouterResponseType;
  reasoning: string;
};
