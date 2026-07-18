import { Hono } from "hono";
import { db } from "../db/index.js";
import { discussions, discussionVotes, user, courses } from "../db/schema.js";
import { eq, and, asc, desc, isNull, sql, count } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono<{ Variables: { user: any; session: any } }>();

app.get("/", async (c) => {
  const courseId = c.req.query("courseId");
  const sort = c.req.query("sort") || "newest";
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(c.req.query("limit")) || 20));
  const offset = (page - 1) * limit;
  const currentUserId = c.req.header("x-user-id") || null;

  const conditions = [isNull(discussions.parentId)];
  if (courseId) {
    conditions.push(eq(discussions.courseId, courseId));
  }

  const voteCountSub = db
    .select({
      discussionId: discussionVotes.discussionId,
      voteCount: count().as("vote_count"),
    })
    .from(discussionVotes)
    .groupBy(discussionVotes.discussionId)
    .as("vote_counts");

  const replyCountSub = db
    .select({
      parentId: discussions.parentId,
      replyCount: count().as("reply_count"),
    })
    .from(discussions)
    .where(sql`${discussions.parentId} IS NOT NULL`)
    .groupBy(discussions.parentId)
    .as("reply_counts");

  const orderBy =
    sort === "popular"
      ? desc(sql`COALESCE(vote_counts.vote_count, 0)`)
      : desc(discussions.createdAt);

  const posts = await db
    .select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      courseId: discussions.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      createdAt: discussions.createdAt,
      userId: discussions.userId,
      userName: user.name,
      userImage: user.image,
      voteCount: sql<number>`COALESCE(vote_counts.vote_count, 0)`.as("votes"),
      replyCount: sql<number>`COALESCE(reply_counts.reply_count, 0)`.as(
        "replies"
      ),
    })
    .from(discussions)
    .leftJoin(user, eq(discussions.userId, user.id))
    .leftJoin(courses, eq(discussions.courseId, courses.id))
    .leftJoin(
      voteCountSub,
      eq(discussions.id, sql`vote_counts.discussion_id`)
    )
    .leftJoin(replyCountSub, eq(discussions.id, sql`reply_counts.parent_id`))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(discussions)
    .where(and(...conditions));

  let votedIds: string[] = [];
  if (currentUserId) {
    const userVotes = await db
      .select({ discussionId: discussionVotes.discussionId })
      .from(discussionVotes)
      .where(eq(discussionVotes.userId, currentUserId));
    votedIds = userVotes.map((v) => v.discussionId);
  }

  return c.json({
    posts: posts.map((p) => ({
      ...p,
      voteCount: Number(p.voteCount),
      replyCount: Number(p.replyCount),
      hasVoted: votedIds.includes(p.id),
    })),
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  });
});

app.get("/my-votes", authMiddleware, async (c) => {
  const userId = c.get("user").id;
  const votes = await db
    .select({ discussionId: discussionVotes.discussionId })
    .from(discussionVotes)
    .where(eq(discussionVotes.userId, userId));
  return c.json(votes.map((v) => v.discussionId));
});

app.get("/course/:courseId", async (c) => {
  const courseId = c.req.param("courseId")!;
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
    title?: string;
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
      title: body.title?.trim() || null,
      userId,
      content: body.content.trim(),
    })
    .returning();

  return c.json(post, 201);
});

app.post("/:id/vote", authMiddleware, async (c) => {
  const userId = c.get("user").id;
  const discussionId = c.req.param("id")!;

  const existing = await db
    .select()
    .from(discussionVotes)
    .where(
      and(
        eq(discussionVotes.userId, userId),
        eq(discussionVotes.discussionId, discussionId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(discussionVotes)
      .where(
        and(
          eq(discussionVotes.userId, userId),
          eq(discussionVotes.discussionId, discussionId)
        )
      );
    return c.json({ voted: false });
  }

  await db.insert(discussionVotes).values({ userId, discussionId });
  return c.json({ voted: true });
});

app.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id")!;
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
