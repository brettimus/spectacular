import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { projects } from "../db/schema";

// Create a typed Hono app
type Variables = {
  db: DrizzleD1Database;
};

const projectsRouter = new Hono<{ Variables: Variables }>();

// Schema for project creation/update
const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

// Create a new project
projectsRouter.post("/", zValidator("json", projectSchema), async (c) => {
  const db = c.get("db");
  const data = c.req.valid("json");

  const [project] = await db.insert(projects).values(data).returning();

  return c.json(project, 201);
});

// Get all projects
projectsRouter.get("/", async (c) => {
  const db = c.get("db");
  const allProjects = await db.select().from(projects);
  return c.json(allProjects);
});

// Get a specific project
projectsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .get();

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json(project);
});

// Update a project
projectsRouter.put("/:id", zValidator("json", projectSchema), async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);
  const data = c.req.valid("json");

  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json(updated);
});

// Delete a project
projectsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json({ message: "Project deleted successfully" });
});

export default projectsRouter;
