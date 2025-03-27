import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { RulesList, Layout } from "../components";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

// Web UI - Rules page
app.get("/rules", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const rulesData = await db
      .select()
      .from(schema.rules)
      .orderBy(desc(schema.rules.createdAt));

    // Transform the data to match the expected type
    const rules = rulesData.map(rule => ({
      ...rule,
      additionalData: rule.additionalData as Record<string, unknown> | null
    }));

    return c.html(
      <Layout title="Rules" >
        <RulesList rules={rules} />
      </Layout>
    );
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.html(
      <Layout title="Error" >
        <div>
          <h1>Error </h1>
          < p > Failed to fetch rules.Please try again later.</p>
          < pre > {error instanceof Error ? error.message : String(error)} </pre>
        </div>
      </Layout>
    );
  }
});

export default app;