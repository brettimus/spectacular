import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { Hono } from "hono";
import type { Bindings } from "./types";
import home from "./ui/home";
import fixEvents from "./ui/fix-events";
import rules from "./ui/rules";
import api from "./api/api";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/api", api);
app.route("/", fixEvents);
app.route("/", rules);
app.route("/", home);

app.get("/openapi.json", (c) => {
  const spec = createOpenAPISpec(app, {
    info: { title: "My API", version: "1.0.0" },
  });
  return c.json(spec);
});

app.use(
  "/fp/*",
  createFiberplane({
    app,
    openapi: {
      url: "/openapi.json",
    },
  }),
);

export default {
  ...app,
  async scheduled(
    _controller: ScheduledController,
    env: Bindings,
    _ctx: ExecutionContext,
  ) {
    try {
      // Get the workflow binding
      const workflow = env.AUTOGANDER_RULE_WORKFLOW;
      // Trigger the workflow
      const instance = await workflow.create({});

      console.log("Rule workflow triggered successfully. Id:", instance.id);
      console.log("Rule workflow status:", await instance.status());
    } catch (error) {
      console.error("Error triggering rule workflow:", error);
    }
  },
};

export { RuleWorkflow } from "./workflows";
