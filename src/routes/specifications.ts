import { Hono } from "hono";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { specifications, projects } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Create a typed Hono app
type Variables = {
  db: DrizzleD1Database;
};

const specificationsRouter = new Hono<{ Variables: Variables }>();

// Schema for specification creation/update
const specificationSchema = z.object({
  projectId: z.number().int().positive(),
  content: z.string().min(1),
  version: z.number().int().positive().optional(),
});

// Create a new specification
specificationsRouter.post(
  "/",
  zValidator("json", specificationSchema),
  async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .get();

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Get the latest version for this project
    const latestSpec = await db
      .select()
      .from(specifications)
      .where(eq(specifications.projectId, data.projectId))
      .orderBy(desc(specifications.version))
      .get();

    const version = latestSpec ? latestSpec.version + 1 : 1;

    const [specification] = await db
      .insert(specifications)
      .values({
        ...data,
        version,
      })
      .returning();

    return c.json(specification, 201);
  }
);

// Get all specifications for a project
specificationsRouter.get("/project/:projectId", async (c) => {
  const db = c.get("db");
  const projectId = Number.parseInt(c.req.param("projectId"), 10);

  const projectSpecs = await db
    .select()
    .from(specifications)
    .where(eq(specifications.projectId, projectId))
    .orderBy(desc(specifications.version))
    .all();

  return c.json(projectSpecs);
});

// Get a specific specification
specificationsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const specification = await db
    .select()
    .from(specifications)
    .where(eq(specifications.id, id))
    .get();

  if (!specification) {
    return c.json({ error: "Specification not found" }, 404);
  }

  return c.json(specification);
});

// Get the latest specification for a project
specificationsRouter.get("/project/:projectId/latest", async (c) => {
  const db = c.get("db");
  const projectId = Number.parseInt(c.req.param("projectId"), 10);

  const specification = await db
    .select()
    .from(specifications)
    .where(eq(specifications.projectId, projectId))
    .orderBy(desc(specifications.version))
    .get();

  if (!specification) {
    return c.json({ error: "No specifications found for this project" }, 404);
  }

  return c.json(specification);
});

// Update a specification
specificationsRouter.put(
  "/:id",
  zValidator("json", specificationSchema),
  async (c) => {
    const db = c.get("db");
    const id = Number.parseInt(c.req.param("id"), 10);
    const data = c.req.valid("json");

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .get();

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const [updated] = await db
      .update(specifications)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(specifications.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Specification not found" }, 404);
    }

    return c.json(updated);
  }
);

// Delete a specification
specificationsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const [deleted] = await db
    .delete(specifications)
    .where(eq(specifications.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Specification not found" }, 404);
  }

  return c.json({ message: "Specification deleted successfully" });
});

export default specificationsRouter; 