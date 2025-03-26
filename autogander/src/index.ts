import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import * as schema from "./db/schema";

// Define the Bindings type for Cloudflare D1 database
// You can add more environment bindings if needed

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// POST /sessions/:id/fixes
app.post('/sessions/:id/fixes', async (c) => {
  const sessionId = c.req.param('id');

  if (!sessionId) {
    return c.json({ error: 'Missing session id' }, 400);
  }

  let payload: {
    type: string;
    originalCode: string;
    errors: any;
    analysis: string;
    fix: string;
  };
  try {
    payload = await c.req.json();
  } catch (error) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const { type, originalCode, errors, analysis, fix } = payload;

  if (!type || !originalCode || !errors || !analysis || !fix) {
    return c.json({ error: 'Missing required fields in payload' }, 400);
  }

  const db = drizzle(c.env.DB);
  
  try {
    // Insert a new fix into the fixes table
    const result = await db.insert(schema.fixes).values({
      sessionId,
      type,
      originalCode,
      errors: JSON.stringify(errors), // store JSON as string
      analysis,
      fix
    });

    // Fetch the created record by using the auto-incremented id if needed
    // Note: D1 with Drizzle does not automatically return the inserted record
    // For now, we just return the payload along with the session id as confirmation
    return c.json({ 
      message: 'Fix event created successfully',
      fix: { sessionId, type, originalCode, errors, analysis, fix } 
    }, 201);
  } catch (error) {
    return c.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// GET /sessions/:id/fixes
app.get('/sessions/:id/fixes', async (c) => {
  const sessionId = c.req.param('id');
  if (!sessionId) {
    return c.json({ error: 'Missing session id' }, 400);
  }

  const typeFilter = c.req.query('type');
  const pageParam = c.req.query('page');
  const pageSizeParam = c.req.query('pageSize');

  const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 100;

  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    return c.json({ error: 'Invalid pagination parameters' }, 400);
  }

  const offset = (page - 1) * pageSize;
  const db = drizzle(c.env.DB);

  try {
    // Build the query with mandatory filter by sessionId
    const baseQuery = db.select().from(schema.fixes).where(eq(schema.fixes.sessionId, sessionId));

    // Apply filter by type if provided
    const queryWithFilter = typeFilter ? baseQuery.where(eq(schema.fixes.type, typeFilter)) : baseQuery;

    // Count query, since Drizzle with D1 may not automatically count, we build a count query
    const countResult = await db.select({ count: schema.fixes.id.count() }).from(schema.fixes)
      .where(eq(schema.fixes.sessionId, sessionId));
    let total = 0;
    if (countResult && countResult[0] && countResult[0].count !== undefined) {
      total = Number(countResult[0].count);
    }

    // Retrieve paginated results, ordered by createdAt descending
    const fixes = await queryWithFilter.orderBy(desc(schema.fixes.createdAt)).limit(pageSize).offset(offset);

    // Transform errors field from JSON string to object
    const parsedFixes = fixes.map(fix => ({
      ...fix,
      errors: (() => { try { return JSON.parse(fix.errors); } catch (e) { return fix.errors; } })()
    }));

    return c.json({
      page,
      pageSize,
      total,
      fixes: parsedFixes
    });
  } catch (error) {
    return c.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// TODO: Future endpoints related to RULES can be implemented here.
// For streaming or realtime features, please refer to:
// Streaming: https://hono.dev/docs/helpers/streaming#streaming-helper
// Realtime: https://developers.cloudflare.com/durable-objects/ and https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/

export default app;
