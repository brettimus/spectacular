import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
import { cors } from "hono/cors";
import chatRouter from "./routes/chat";
import conversationsRouter from "./routes/conversations";
import projectsRouter from "./routes/projects";
import specificationsRouter from "./routes/specifications";
import { DialogueAgent } from "./server-agents/dialogue-agent";
// Create a typed Hono app
type Bindings = {
  DB: D1Database;
};

type Variables = {
  db: DrizzleD1Database;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Enable CORS
app.use("*", cors());

app.use("*", agentsMiddleware());

// With custom routing
// app.use(
//   "*",
//   agentsMiddleware({
//     options: {
//       prefix: "agents", // Handles /agents/* routes only
//     },
//   })
// );

// Middleware to inject the database into the context
app.use("*", async (c, next) => {
  const db = drizzle(c.env.DB);
  c.set("db", db);
  await next();
});

// Mount the routers
app.route("/api/projects", projectsRouter);
app.route("/api/conversations", conversationsRouter);
app.route("/api/specifications", specificationsRouter);
app.route("/api/chat", chatRouter);

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Need to export the agent so it can be used in the client
export { DialogueAgent };

export default app;
