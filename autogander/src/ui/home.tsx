import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { and, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { FixesList, Layout, RulesList } from "../components";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

// Web UI - Home page with fix events list
app.get("/", async (c) => {
  const db = drizzle(c.env.DB);

  const typeFilter = c.req.query("type");
  const pageParam = c.req.query("page");
  const pageSizeParam = c.req.query("pageSize");

  const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 10;

  if (
    Number.isNaN(page) ||
    Number.isNaN(pageSize) ||
    page < 1 ||
    pageSize < 1
  ) {
    return c.text("Invalid pagination parameters", 400);
  }

  const offset = (page - 1) * pageSize;

  try {
    const conditions = [];
    if (typeFilter) {
      conditions.push(eq(schema.fixEvents.type, typeFilter));
    }

    // Count query
    const countQuery = db
      .select({ count: count() })
      .from(schema.fixEvents);

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const countResult = await countQuery;
    let total = 0;
    if (countResult && countResult[0] && countResult[0].count !== undefined) {
      total = Number(countResult[0].count);
    }

    // Fix events query
    const baseQuery = db
      .select()
      .from(schema.fixEvents);

    if (conditions.length > 0) {
      baseQuery.where(and(...conditions));
    }

    const fixEvents = await baseQuery
      .orderBy(desc(schema.fixEvents.createdAt))
      .limit(pageSize)
      .offset(offset);

    return c.html(
      <Layout title="Fix Events">
        <FixesList fixes={fixEvents} total={total} page={page} pageSize={pageSize} />
      </Layout>
    );
  } catch (error) {
    console.error("Error fetching fix events:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch fix events. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>
    );
  }
});

export default app;
