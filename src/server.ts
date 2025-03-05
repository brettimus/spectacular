import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import projectsRouter from "./routes/projects";
import conversationsRouter from "./routes/conversations";
import specificationsRouter from "./routes/specifications";
import chatRouter from "./routes/chat";

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

export default app;
