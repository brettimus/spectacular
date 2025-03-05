import { Hono } from "hono";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { conversations, projects } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Create a typed Hono app
type Variables = {
  db: DrizzleD1Database;
};

const conversationsRouter = new Hono<{ Variables: Variables }>();

// Schema for conversation creation
const conversationSchema = z.object({
  projectId: z.number().int().positive(),
  question: z.string().min(1),
  answer: z.string().min(1),
  context: z.string().optional(),
});

// Create a new conversation entry
conversationsRouter.post(
  "/",
  zValidator("json", conversationSchema),
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

    const [conversation] = await db
      .insert(conversations)
      .values(data)
      .returning();

    return c.json(conversation, 201);
  }
);

// Get all conversations for a project
conversationsRouter.get("/project/:projectId", async (c) => {
  const db = c.get("db");
  const projectId = Number.parseInt(c.req.param("projectId"), 10);

  const projectConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.projectId, projectId))
    .all();

  return c.json(projectConversations);
});

// Get a specific conversation
conversationsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .get();

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json(conversation);
});

// Update a conversation
conversationsRouter.put(
  "/:id",
  zValidator("json", conversationSchema),
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
      .update(conversations)
      .set(data)
      .where(eq(conversations.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json(updated);
  }
);

// Delete a conversation
conversationsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const [deleted] = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json({ message: "Conversation deleted successfully" });
});

export default conversationsRouter; 