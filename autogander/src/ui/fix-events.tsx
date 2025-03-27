import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { FixesList, Layout, RulesList } from "../components";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/fix-events/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  try {
    const conditions = [];
    if (id) {
      conditions.push(eq(schema.fixEvents.id, Number(id)));
    }

    // Fix events query
    const [fixEvent] = await db
      .select()
      .from(schema.fixEvents)
      .where(and(...conditions));

    if (!fixEvent) {
      return c.json({ error: "Fix event not found" }, 404);
    }

    return c.html(
      <Layout title="Fix Events" >
        <FixesList fixes={[fixEvent]} total={1} page={1} pageSize={1} />
      </Layout>
    );
  } catch (error) {
    console.error("Error fetching fix event:", error);
    return c.html(
      <Layout title="Error" >
        <div>
          <h1>Error </h1>
          < p > Failed to fetch fix event.Please try again later.</p>
          < pre > {error instanceof Error ? error.message : String(error)} </pre>
        </div>
      </Layout>
    );
  }
});

app.get("/fix-events/:id/rules", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  try {
    const conditions = [];
    if (id) {
      conditions.push(eq(schema.rules.fixEventId, Number(id)));
    }

    // Fix events query
    const rules = await db
      .select()
      .from(schema.rules)
      .where(and(...conditions));

    if (!rules || rules.length === 0) {
      return c.json({ error: "Rules not found" }, 404);
    }

    return c.html(
      <Layout title="Rules" >
        <RulesList rules={rules} />
      </Layout>
    );
  } catch (error) {
    console.error("Error fetching fix event:", error);
    return c.html(
      <Layout title="Error" >
        <div>
          <h1>Error </h1>
          < p > Failed to fetch fix event.Please try again later.</p>
          < pre > {error instanceof Error ? error.message : String(error)} </pre>
        </div>
      </Layout>
    );
  }
});

export default app;