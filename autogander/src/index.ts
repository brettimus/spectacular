import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { and, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "./db/schema";

// Define the Bindings type for Cloudflare D1 database
// You can add more environment bindings if needed

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// POST /sessions/:id/fixes
app.post("/sessions/:id/fixes", async (c) => {
  const sessionId = c.req.param("id");

  if (!sessionId) {
    return c.json({ error: "Missing session id" }, 400);
  }

  let payload: {
    type: string;
    originalCode: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    errors: any;
    analysis: string;
    fixedCode: string;
  };
  try {
    payload = await c.req.json();
  } catch (error) {
    return c.json({ error: "Invalid JSON payload" }, 400);
  }

  const { type, originalCode, errors, analysis, fixedCode } = payload;

  console.log("payload", payload);

  if (!type || !originalCode || !errors || !analysis || !fixedCode) {
    return c.json({ error: "Missing required fields in payload" }, 400);
  }

  const db = drizzle(c.env.DB);

  try {
    // Insert a new fix into the fixes table
    const [result] = await db
      .insert(schema.fixes)
      .values({
        sessionId,
        type,
        originalCode,
        errors,
        analysis,
        fixedCode,
      })
      .returning();

    // Fetch the created record by using the auto-incremented id if needed
    // Note: D1 with Drizzle does not automatically return the inserted record
    // For now, we just return the payload along with the session id as confirmation
    return c.json(
      {
        message: "Fix event created successfully",
        result,
      },
      201,
    );
  } catch (error) {
    console.error("Database error", error);
    return c.json(
      {
        error: "Database error",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// GET /sessions/:id/fixes
app.get("/sessions/:id/fixes", async (c) => {
  const sessionId = c.req.param("id");
  if (!sessionId) {
    return c.json({ error: "Missing session id" }, 400);
  }

  const typeFilter = c.req.query("type");
  const pageParam = c.req.query("page");
  const pageSizeParam = c.req.query("pageSize");

  const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 100;

  if (
    Number.isNaN(page) ||
    Number.isNaN(pageSize) ||
    page < 1 ||
    pageSize < 1
  ) {
    return c.json({ error: "Invalid pagination parameters" }, 400);
  }

  const offset = (page - 1) * pageSize;
  const db = drizzle(c.env.DB);

  try {
    const conditions = [eq(schema.fixes.sessionId, sessionId)];
    if (typeFilter) {
      conditions.push(eq(schema.fixes.type, typeFilter));
    }
    // Build the query with mandatory filter by sessionId
    const baseQuery = db
      .select()
      .from(schema.fixes)
      .where(and(...conditions));

    // Count query, since Drizzle with D1 may not automatically count, we build a count query
    const countResult = await db
      .select({ count: count() })
      .from(schema.fixes)
      .where(eq(schema.fixes.sessionId, sessionId));
    let total = 0;
    if (countResult && countResult[0] && countResult[0].count !== undefined) {
      total = Number(countResult[0].count);
    }

    // Retrieve paginated results, ordered by createdAt descending
    const fixes = await baseQuery
      .orderBy(desc(schema.fixes.createdAt))
      .limit(pageSize)
      .offset(offset);

    return c.json({
      page,
      pageSize,
      total,
      fixes,
    });
  } catch (error) {
    return c.json(
      {
        error: "Database error",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

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

// TODO: Future endpoints related to RULES can be implemented here.
// For streaming or realtime features, please refer to:
// Streaming: https://hono.dev/docs/helpers/streaming#streaming-helper
// Realtime: https://developers.cloudflare.com/durable-objects/ and https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/

export default app;
