import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  quizzes,
  quizQuestions,
  userQuizAttempts,
  lessons,
} from "../db/schema.js";
import { eq, and, asc, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

app.get("/lesson/:lessonId", async (c) => {
  const lessonId = c.req.param("lessonId");

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.lessonId, lessonId),
  });

  if (!quiz) return c.json(null);

  const questions = await db
    .select({
      id: quizQuestions.id,
      question: quizQuestions.question,
      options: quizQuestions.options,
      orderIndex: quizQuestions.orderIndex,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.orderIndex));

  const sanitizedQuestions = questions.map((q) => ({
    ...q,
    options: (q.options as { text: string; isCorrect: boolean }[]).map(
      (opt) => ({ text: opt.text })
    ),
  }));

  return c.json({ ...quiz, questions: sanitizedQuestions });
});

app.post("/:quizId/submit", authMiddleware, async (c) => {
  const quizId = c.req.param("quizId");
  const userId = c.get("user").id;
  const body = await c.req.json<{
    answers: { questionId: string; selectedIndex: number }[];
  }>();

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
  });
  if (!quiz) return c.json({ error: "Quiz not found" }, 404);

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

  let correctCount = 0;
  const results = body.answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return { ...answer, correct: false, explanation: null };

    const options = question.options as { text: string; isCorrect: boolean }[];
    const isCorrect = options[answer.selectedIndex]?.isCorrect || false;
    if (isCorrect) correctCount++;

    return {
      ...answer,
      correct: isCorrect,
      explanation: question.explanation,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= (quiz.passingScore || 70);

  const [attempt] = await db
    .insert(userQuizAttempts)
    .values({
      userId,
      quizId,
      score,
      answers: body.answers,
      passed,
    })
    .returning();

  return c.json({ attempt, score, passed, results });
});

app.get("/:quizId/attempts", authMiddleware, async (c) => {
  const quizId = c.req.param("quizId");
  const userId = c.get("user").id;

  const attempts = await db
    .select()
    .from(userQuizAttempts)
    .where(
      and(
        eq(userQuizAttempts.userId, userId),
        eq(userQuizAttempts.quizId, quizId)
      )
    )
    .orderBy(desc(userQuizAttempts.createdAt));

  return c.json(attempts);
});

export default app;
