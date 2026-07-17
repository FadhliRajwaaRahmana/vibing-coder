export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  difficulty: Difficulty;
  category: string | null;
  estimatedHours: number | null;
  isPublished: boolean | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  content: string | null;
  orderIndex: number;
  durationMinutes: number | null;
}
