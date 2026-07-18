import { Hono } from "hono";
import { db } from "../db/index.js";
import { courses, lessons, userProgress } from "../db/schema.js";
import { eq, and, asc, count, inArray } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono<{ Variables: { user: any; session: any } }>();

app.get("/", async (c) => {
  const allCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.isPublished, true))
    .orderBy(asc(courses.createdAt));

  const coursesWithLessonCount = await Promise.all(
    allCourses.map(async (course) => {
      const [lessonCount] = await db
        .select({ count: count() })
        .from(lessons)
        .where(eq(lessons.courseId, course.id));
      return { ...course, lessonCount: lessonCount.count };
    })
  );

  return c.json(coursesWithLessonCount);
});

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug")!;
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });

  if (!course) return c.json({ error: "Course not found" }, 404);

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.orderIndex));

  return c.json({ ...course, lessons: courseLessons });
});

app.get("/:slug/lessons/:lessonSlug", async (c) => {
  const slug = c.req.param("slug")!;
  const lessonSlug = c.req.param("lessonSlug")!;

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });
  if (!course) return c.json({ error: "Course not found" }, 404);

  const lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.courseId, course.id),
      eq(lessons.slug, lessonSlug)
    ),
  });
  if (!lesson) return c.json({ error: "Lesson not found" }, 404);

  const allLessons = await db
    .select({ id: lessons.id, title: lessons.title, slug: lessons.slug, orderIndex: lessons.orderIndex })
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.orderIndex));

  return c.json({ course, lesson, allLessons });
});

app.post("/:slug/lessons/:lessonSlug/complete", authMiddleware, async (c) => {
  const slug = c.req.param("slug")!;
  const lessonSlug = c.req.param("lessonSlug")!;
  const userId = c.get("user").id;

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });
  if (!course) return c.json({ error: "Course not found" }, 404);

  const lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.courseId, course.id),
      eq(lessons.slug, lessonSlug)
    ),
  });
  if (!lesson) return c.json({ error: "Lesson not found" }, 404);

  await db
    .insert(userProgress)
    .values({
      userId,
      lessonId: lesson.id,
      completed: true,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.lessonId],
      set: { completed: true, completedAt: new Date() },
    });

  return c.json({ success: true });
});

app.get("/:slug/progress", authMiddleware, async (c) => {
  const slug = c.req.param("slug")!;
  const userId = c.get("user").id;

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });
  if (!course) return c.json({ error: "Course not found" }, 404);

  const courseLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.courseId, course.id));

  const lessonIds = courseLessons.map((l) => l.id);
  if (lessonIds.length === 0) return c.json({ completed: 0, total: 0, completedLessonIds: [] });

  const progress = await db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.completed, true),
        inArray(userProgress.lessonId, lessonIds)
      )
    );

  const completedLessonIds = progress.map((p) => p.lessonId);

  return c.json({
    completed: completedLessonIds.length,
    total: lessonIds.length,
    completedLessonIds,
  });
});

export default app;
