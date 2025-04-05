import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { Layout, RulesList } from "../components";
import * as schema from "../db/schema";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

// Web UI - Status-filtered Rules pages (must come before the single rule endpoint with :id param)
app.get("/rules/pending", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const rulesData = await db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.status, "pending"))
      .orderBy(desc(schema.rules.id));

    // Transform the data to match the expected type
    const rules = rulesData.map((rule) => ({
      ...rule,
      additionalData: rule.additionalData as Record<string, unknown> | null,
    }));

    return c.html(
      <Layout title="Pending Rules">
        <RulesList rules={rules} title="Pending Rules" />
      </Layout>,
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch rules. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>,
    );
  }
});

app.get("/rules/approved", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const rulesData = await db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.status, "approved"))
      .orderBy(desc(schema.rules.id));

    // Transform the data to match the expected type
    const rules = rulesData.map((rule) => ({
      ...rule,
      additionalData: rule.additionalData as Record<string, unknown> | null,
    }));

    return c.html(
      <Layout title="Approved Rules">
        <RulesList rules={rules} title="Approved Rules" />
      </Layout>,
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch rules. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>,
    );
  }
});

app.get("/rules/rejected", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const rulesData = await db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.status, "rejected"))
      .orderBy(desc(schema.rules.id));

    // Transform the data to match the expected type
    const rules = rulesData.map((rule) => ({
      ...rule,
      additionalData: rule.additionalData as Record<string, unknown> | null,
    }));

    return c.html(
      <Layout title="Rejected Rules">
        <RulesList rules={rules} title="Rejected Rules" />
      </Layout>,
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch rules. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>,
    );
  }
});

// Web UI - All Rules page
app.get("/rules", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    // Just fetch all rules - sorting will be handled in the component
    const rulesData = await db
      .select()
      .from(schema.rules)
      .orderBy(desc(schema.rules.id)); // Default sort by ID descending for the database query

    // Transform the data to match the expected type
    const rules = rulesData.map((rule) => ({
      ...rule,
      additionalData: rule.additionalData as Record<string, unknown> | null,
    }));

    return c.html(
      <Layout title="All Rules">
        <RulesList rules={rules} title="All Rules" />
      </Layout>,
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch rules. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>,
    );
  }
});

// Single rule endpoint needs to come after the status routes to avoid route conflicts
app.get("/rules/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  try {
    const [rule] = await db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.id, Number.parseInt(id)));

    // Transform the data to match the expected type
    const rules = rule ? [rule] : [];

    return c.html(
      <Layout title="Rule Detail">
        <RulesList rules={rules} title="Rule Detail" />
      </Layout>,
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error">
        <div>
          <h1>Error</h1>
          <p>Failed to fetch rules. Please try again later.</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </Layout>,
    );
  }
});

export default app;
