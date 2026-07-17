import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  courses,
  lessons,
  userProgress,
  certificates,
  userQuizAttempts,
} from "../db/schema.js";
import { eq, and, count, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono<{ Variables: { user: any; session: any } }>();

app.use("*", authMiddleware);

app.get("/stats", async (c) => {
  const userId = c.get("user").id;

  const [completedLessons] = await db
    .select({ count: count() })
    .from(userProgress)
    .where(
      and(eq(userProgress.userId, userId), eq(userProgress.completed, true))
    );

  const [totalCerts] = await db
    .select({ count: count() })
    .from(certificates)
    .where(eq(certificates.userId, userId));

  const [quizAttempts] = await db
    .select({ count: count() })
    .from(userQuizAttempts)
    .where(eq(userQuizAttempts.userId, userId));

  const enrolledCourses = await db
    .selectDistinct({ courseId: lessons.courseId })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .where(eq(userProgress.userId, userId));

  return c.json({
    completedLessons: completedLessons.count,
    certificates: totalCerts.count,
    quizAttempts: quizAttempts.count,
    enrolledCourses: enrolledCourses.length,
  });
});

app.get("/enrolled", async (c) => {
  const userId = c.get("user").id;

  const enrolled = await db
    .selectDistinct({ courseId: lessons.courseId })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .where(eq(userProgress.userId, userId));

  const courseIds = enrolled.map((e) => e.courseId);
  if (courseIds.length === 0) return c.json([]);

  const result = await Promise.all(
    courseIds.map(async (courseId) => {
      const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
      });
      if (!course) return null;

      const [totalLessons] = await db
        .select({ count: count() })
        .from(lessons)
        .where(eq(lessons.courseId, courseId));

      const completedLessons = await db
        .select({ lessonId: userProgress.lessonId })
        .from(userProgress)
        .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(lessons.courseId, courseId),
            eq(userProgress.completed, true)
          )
        );

      return {
        ...course,
        totalLessons: totalLessons.count,
        completedLessons: completedLessons.length,
        progress: totalLessons.count > 0
          ? Math.round((completedLessons.length / totalLessons.count) * 100)
          : 0,
      };
    })
  );

  return c.json(result.filter(Boolean));
});

export default app;
