import { and, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

// API endpoints
app.get("/fix-events", async (c) => {
  const db = drizzle(c.env.DB);
  const fixEvents = await db.select().from(schema.fixEvents);
  return c.json(fixEvents);
});


app.get("/rules", async (c) => {
  const db = drizzle(c.env.DB);
  const rules = await db.select().from(schema.rules);
  return c.json(rules);
});


// POST /sessions/:id/fix-events
app.post("/sessions/:id/fix-events", async (c) => {
  const sessionId = c.req.param("id");

  if (!sessionId) {
    return c.json({ error: "Missing session id" }, 400);
  }

  let payload: {
    type: string;
    sourceCode: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    sourceCompilerErrors: any;
    analysis: string;
    fixedCode: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    fixedCompilerErrors?: any;
  };
  try {
    payload = await c.req.json();
  } catch (error) {
    return c.json({ error: "Invalid JSON payload" }, 400);
  }

  const { type, sourceCode, sourceCompilerErrors, analysis, fixedCode, fixedCompilerErrors } = payload;

  console.log("payload", payload);

  if (!type || !sourceCode || !sourceCompilerErrors || !analysis || !fixedCode) {
    return c.json({ error: "Missing required fields in payload" }, 400);
  }

  const db = drizzle(c.env.DB);

  try {
    // Insert a new fix event into the fix_events table
    const [result] = await db
      .insert(schema.fixEvents)
      .values({
        sessionId,
        type,
        sourceCode,
        sourceCompilerErrors,
        analysis,
        fixedCode,
        fixedCompilerErrors,
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

// GET /sessions/:id/fix-events
app.get("/sessions/:id/fix-events", async (c) => {
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
    const conditions = [eq(schema.fixEvents.sessionId, sessionId)];
    if (typeFilter) {
      conditions.push(eq(schema.fixEvents.type, typeFilter));
    }
    // Build the query with mandatory filter by sessionId
    const baseQuery = db
      .select()
      .from(schema.fixEvents)
      .where(and(...conditions));

    // Count query, since Drizzle with D1 may not automatically count, we build a count query
    const countResult = await db
      .select({ count: count() })
      .from(schema.fixEvents)
      .where(eq(schema.fixEvents.sessionId, sessionId));
    let total = 0;
    if (countResult && countResult[0] && countResult[0].count !== undefined) {
      total = Number(countResult[0].count);
    }

    // Retrieve paginated results, ordered by createdAt descending
    const fixEvents = await baseQuery
      .orderBy(desc(schema.fixEvents.createdAt))
      .limit(pageSize)
      .offset(offset);

    return c.json({
      page,
      pageSize,
      total,
      fixEvents,
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

// Endpoint to manually trigger the rule workflow (for testing/admin purposes)
app.post("/admin/trigger-rule-workflow", async (c, next) => {
  if (!c.env.ADMIN_SECRET) {
    return c.json({ error: "internal server error" }, 500);
  }
  if (c.req.header("Authorization") !== c.env.ADMIN_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
}, async (c) => {
  try {
    // Get the workflow binding
    const workflow = c.env.AUTOGANDER_RULE_WORKFLOW;

    if (!workflow) {
      return c.json({ error: "Workflow binding not available" }, 500);
    }

    // Trigger the workflow
    const instance = await workflow.create({});

    return c.json({
      message: "Rule workflow triggered successfully",
      workflowId: instance.id,
      status: await instance.status()
    }, 200);
  } catch (error) {
    console.error("Error triggering rule workflow:", error);
    return c.json({
      error: "Failed to trigger rule workflow",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

export default app;