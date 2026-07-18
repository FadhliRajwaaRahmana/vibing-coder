const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  courses: {
    list: () => request<any[]>("/courses"),
    get: (slug: string) => request<any>(`/courses/${slug}`),
    getLesson: (slug: string, lessonSlug: string) =>
      request<any>(`/courses/${slug}/lessons/${lessonSlug}`),
    completeLesson: (slug: string, lessonSlug: string) =>
      request<any>(`/courses/${slug}/lessons/${lessonSlug}/complete`, {
        method: "POST",
      }),
    getProgress: (slug: string) => request<any>(`/courses/${slug}/progress`),
  },
  discussions: {
    list: (params?: {
      courseId?: string;
      sort?: string;
      page?: number;
      limit?: number;
      userId?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.courseId) q.set("courseId", params.courseId);
      if (params?.sort) q.set("sort", params.sort);
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      const qs = q.toString();
      const headers: Record<string, string> = {};
      if (params?.userId) headers["x-user-id"] = params.userId;
      return request<{
        posts: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/discussions${qs ? `?${qs}` : ""}`, { headers });
    },
    getByCourse: (courseId: string, lessonId?: string) =>
      request<any[]>(
        `/discussions/course/${courseId}${lessonId ? `?lessonId=${lessonId}` : ""}`
      ),
    create: (data: {
      courseId: string;
      lessonId?: string;
      parentId?: string;
      title?: string;
      content: string;
    }) =>
      request<any>("/discussions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    vote: (id: string) =>
      request<{ voted: boolean }>(`/discussions/${id}/vote`, {
        method: "POST",
      }),
    delete: (id: string) =>
      request<any>(`/discussions/${id}`, { method: "DELETE" }),
  },
  quizzes: {
    getByLesson: (lessonId: string) =>
      request<any | null>(`/quizzes/lesson/${lessonId}`),
    submit: (quizId: string, answers: any[]) =>
      request<any>(`/quizzes/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
    getAttempts: (quizId: string) =>
      request<any[]>(`/quizzes/${quizId}/attempts`),
  },
  certificates: {
    generate: (courseId: string) =>
      request<any>(`/certificates/generate/${courseId}`, { method: "POST" }),
    getMy: () => request<any[]>("/certificates/my"),
    verify: (certNumber: string) =>
      request<any>(`/certificates/verify/${certNumber}`),
  },
  dashboard: {
    stats: () => request<any>("/dashboard/stats"),
    enrolled: () => request<any[]>("/dashboard/enrolled"),
  },
};
