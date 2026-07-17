import { Hono } from "hono";
import { db } from "../db/index.js";
import { discussions, user } from "../db/schema.js";
import { eq, and, asc, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

app.get("/course/:courseId", async (c) => {
  const courseId = c.req.param("courseId");
  const lessonId = c.req.query("lessonId");

  const condition = lessonId
    ? and(eq(discussions.courseId, courseId), eq(discussions.lessonId, lessonId))
    : and(eq(discussions.courseId, courseId), isNull(discussions.parentId));

  const posts = await db
    .select({
      id: discussions.id,
      content: discussions.content,
      parentId: discussions.parentId,
      createdAt: discussions.createdAt,
      userId: discussions.userId,
      userName: user.name,
      userImage: user.image,
    })
    .from(discussions)
    .leftJoin(user, eq(discussions.userId, user.id))
    .where(condition)
    .orderBy(asc(discussions.createdAt));

  const topLevel = posts.filter((p) => !p.parentId);
  const replies = posts.filter((p) => p.parentId);

  const threaded = topLevel.map((post) => ({
    ...post,
    replies: replies.filter((r) => r.parentId === post.id),
  }));

  return c.json(threaded);
});

app.post("/", authMiddleware, async (c) => {
  const userId = c.get("user").id;
  const body = await c.req.json<{
    courseId: string;
    lessonId?: string;
    parentId?: string;
    content: string;
  }>();

  if (!body.content?.trim()) {
    return c.json({ error: "Content is required" }, 400);
  }

  const [post] = await db
    .insert(discussions)
    .values({
      courseId: body.courseId,
      lessonId: body.lessonId || null,
      parentId: body.parentId || null,
      userId,
      content: body.content.trim(),
    })
    .returning();

  return c.json(post, 201);
});

app.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const userId = c.get("user").id;

  const post = await db.query.discussions.findFirst({
    where: eq(discussions.id, id),
  });

  if (!post) return c.json({ error: "Not found" }, 404);
  if (post.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  await db.delete(discussions).where(eq(discussions.id, id));
  return c.json({ success: true });
});

export default app;
