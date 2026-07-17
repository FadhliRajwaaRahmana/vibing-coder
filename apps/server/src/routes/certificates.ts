import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  certificates,
  courses,
  lessons,
  userProgress,
  userQuizAttempts,
  quizzes,
  user,
} from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { nanoid } from "nanoid";

const app = new Hono();

app.post("/generate/:courseId", authMiddleware, async (c) => {
  const courseId = c.req.param("courseId");
  const userId = c.get("user").id;

  const existing = await db.query.certificates.findFirst({
    where: and(
      eq(certificates.userId, userId),
      eq(certificates.courseId, courseId)
    ),
  });
  if (existing) return c.json(existing);

  const courseLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.courseId, courseId));

  const completedProgress = await db
    .select()
    .from(userProgress)
    .where(
      and(eq(userProgress.userId, userId), eq(userProgress.completed, true))
    );

  const completedIds = new Set(completedProgress.map((p) => p.lessonId));
  const allCompleted = courseLessons.every((l) => completedIds.has(l.id));

  if (!allCompleted) {
    return c.json(
      { error: "Complete all lessons before requesting a certificate" },
      400
    );
  }

  const certNumber = `KF-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;

  const [cert] = await db
    .insert(certificates)
    .values({
      userId,
      courseId,
      certificateNumber: certNumber,
    })
    .returning();

  return c.json(cert, 201);
});

app.get("/my", authMiddleware, async (c) => {
  const userId = c.get("user").id;

  const certs = await db
    .select({
      id: certificates.id,
      certificateNumber: certificates.certificateNumber,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseThumbnail: courses.thumbnail,
    })
    .from(certificates)
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId));

  return c.json(certs);
});

app.get("/verify/:certNumber", async (c) => {
  const certNumber = c.req.param("certNumber");

  const cert = await db
    .select({
      id: certificates.id,
      certificateNumber: certificates.certificateNumber,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
      userName: user.name,
    })
    .from(certificates)
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .leftJoin(user, eq(certificates.userId, user.id))
    .where(eq(certificates.certificateNumber, certNumber));

  if (cert.length === 0) return c.json({ error: "Certificate not found" }, 404);
  return c.json(cert[0]);
});

export default app;
