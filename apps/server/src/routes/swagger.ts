import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

const app = new Hono();

const spec = {
  openapi: "3.0.0",
  info: {
    title: "VibingCoder Academy API",
    version: "1.0.0",
    description:
      "API documentation for VibingCoder Academy - Platform belajar coding interaktif. Gunakan endpoint auth untuk login/register dan dapatkan session token untuk mengakses endpoint yang memerlukan autentikasi.",
  },
  servers: [
    {
      url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      description: "Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description:
          "Session token dari response login/register. Gunakan nilai 'token' dari response sign-in.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      Course: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          thumbnail: { type: "string", nullable: true },
          published: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          orderIndex: { type: "integer" },
          courseId: { type: "string" },
        },
      },
      Discussion: {
        type: "object",
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          parentId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          userId: { type: "string" },
          userName: { type: "string" },
          userImage: { type: "string", nullable: true },
          replies: {
            type: "array",
            items: { $ref: "#/components/schemas/Discussion" },
          },
        },
      },
      Quiz: {
        type: "object",
        properties: {
          id: { type: "string" },
          lessonId: { type: "string" },
          title: { type: "string" },
          passingScore: { type: "integer" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                question: { type: "string" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { text: { type: "string" } },
                  },
                },
                orderIndex: { type: "integer" },
              },
            },
          },
        },
      },
      Certificate: {
        type: "object",
        properties: {
          id: { type: "string" },
          certificateNumber: { type: "string" },
          issuedAt: { type: "string", format: "date-time" },
          userId: { type: "string" },
          courseId: { type: "string" },
        },
      },
      DashboardStats: {
        type: "object",
        properties: {
          completedLessons: { type: "integer" },
          certificates: { type: "integer" },
          quizAttempts: { type: "integer" },
          enrolledCourses: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/sign-up/email": {
      post: {
        tags: ["Authentication"],
        summary: "Register akun baru",
        description:
          "Buat akun baru dengan email dan password. Response berisi token yang bisa digunakan untuk authorize endpoint lainnya.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "password123",
                  },
                  name: { type: "string", example: "John Doe" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Registrasi berhasil. Gunakan 'token' dari response untuk authorization.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/sign-in/email": {
      post: {
        tags: ["Authentication"],
        summary: "Login dengan email",
        description:
          "Login dengan email dan password. Response berisi 'token' untuk digunakan sebagai Bearer token di endpoint yang memerlukan autentikasi.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Login berhasil. Copy 'token' dari response, klik 'Authorize' di atas, dan paste sebagai Bearer token.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Email atau password salah",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/get-session": {
      get: {
        tags: ["Authentication"],
        summary: "Get current session",
        description: "Cek session yang sedang aktif.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Session data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    session: { type: "object" },
                    user: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/sign-out": {
      post: {
        tags: ["Authentication"],
        summary: "Logout",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Berhasil logout" },
        },
      },
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "List semua course",
        description: "Ambil daftar semua course yang sudah published.",
        responses: {
          "200": {
            description: "List courses",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Course" },
                      {
                        type: "object",
                        properties: {
                          lessonCount: { type: "integer" },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/courses/{slug}": {
      get: {
        tags: ["Courses"],
        summary: "Detail course",
        description:
          "Ambil detail course beserta daftar lesson-nya berdasarkan slug.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "javascript-dasar",
          },
        ],
        responses: {
          "200": {
            description: "Course detail with lessons",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Course" },
                    {
                      type: "object",
                      properties: {
                        lessons: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Lesson" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "404": {
            description: "Course not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/courses/{slug}/lessons/{lessonSlug}": {
      get: {
        tags: ["Courses"],
        summary: "Detail lesson",
        description: "Ambil detail lesson beserta navigasi ke lesson lainnya.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "lessonSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Lesson detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    course: { $ref: "#/components/schemas/Course" },
                    lesson: { $ref: "#/components/schemas/Lesson" },
                    allLessons: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          slug: { type: "string" },
                          orderIndex: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/courses/{slug}/lessons/{lessonSlug}/complete": {
      post: {
        tags: ["Courses"],
        summary: "Tandai lesson selesai",
        description: "Tandai sebuah lesson sebagai selesai untuk user saat ini.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "lessonSlug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Lesson marked as completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/courses/{slug}/progress": {
      get: {
        tags: ["Courses"],
        summary: "Progress course",
        description: "Ambil progress user untuk sebuah course.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Progress data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    completed: { type: "integer" },
                    total: { type: "integer" },
                    completedLessonIds: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/discussions/course/{courseId}": {
      get: {
        tags: ["Discussions"],
        summary: "List diskusi per course",
        description:
          "Ambil semua diskusi untuk sebuah course, dengan threaded replies.",
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "lessonId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by lesson ID",
          },
        ],
        responses: {
          "200": {
            description: "List of discussions with replies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Discussion" },
                },
              },
            },
          },
        },
      },
    },
    "/api/discussions": {
      post: {
        tags: ["Discussions"],
        summary: "Buat diskusi baru",
        description:
          "Buat posting diskusi baru. Bisa juga sebagai reply dengan menyertakan parentId.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseId", "content"],
                properties: {
                  courseId: { type: "string" },
                  lessonId: { type: "string", nullable: true },
                  parentId: { type: "string", nullable: true },
                  content: { type: "string", example: "Ini pertanyaan saya..." },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Discussion created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Discussion" },
              },
            },
          },
          "400": {
            description: "Content is required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/discussions/{id}": {
      delete: {
        tags: ["Discussions"],
        summary: "Hapus diskusi",
        description: "Hapus diskusi (hanya pemilik yang bisa hapus).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          "403": {
            description: "Forbidden - bukan pemilik",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/quizzes/lesson/{lessonId}": {
      get: {
        tags: ["Quizzes"],
        summary: "Get quiz by lesson",
        description:
          "Ambil quiz untuk sebuah lesson. Opsi jawaban sudah disanitasi (tidak ada isCorrect).",
        parameters: [
          {
            name: "lessonId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Quiz data (or null if no quiz)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Quiz" },
              },
            },
          },
        },
      },
    },
    "/api/quizzes/{quizId}/submit": {
      post: {
        tags: ["Quizzes"],
        summary: "Submit jawaban quiz",
        description: "Submit jawaban quiz dan dapatkan hasil scoring.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "quizId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["answers"],
                properties: {
                  answers: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["questionId", "selectedIndex"],
                      properties: {
                        questionId: { type: "string" },
                        selectedIndex: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Quiz result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    attempt: { type: "object" },
                    score: { type: "number" },
                    passed: { type: "boolean" },
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          questionId: { type: "string" },
                          selectedIndex: { type: "integer" },
                          correct: { type: "boolean" },
                          explanation: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Quiz not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/quizzes/{quizId}/attempts": {
      get: {
        tags: ["Quizzes"],
        summary: "Riwayat attempt quiz",
        description: "Ambil riwayat percobaan quiz user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "quizId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "List of quiz attempts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      score: { type: "number" },
                      passed: { type: "boolean" },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/certificates/generate/{courseId}": {
      post: {
        tags: ["Certificates"],
        summary: "Generate sertifikat",
        description:
          "Generate sertifikat setelah menyelesaikan semua lesson dalam course. Mengembalikan sertifikat yang sudah ada jika sudah di-generate sebelumnya.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "201": {
            description: "Certificate generated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Certificate" },
              },
            },
          },
          "400": {
            description: "Not all lessons completed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/certificates/my": {
      get: {
        tags: ["Certificates"],
        summary: "Sertifikat saya",
        description: "Ambil semua sertifikat milik user yang sedang login.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of certificates",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      certificateNumber: { type: "string" },
                      issuedAt: { type: "string", format: "date-time" },
                      courseTitle: { type: "string" },
                      courseSlug: { type: "string" },
                      courseThumbnail: { type: "string", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/certificates/verify/{certNumber}": {
      get: {
        tags: ["Certificates"],
        summary: "Verifikasi sertifikat",
        description:
          "Verifikasi keaslian sertifikat berdasarkan nomor sertifikat. Endpoint publik.",
        parameters: [
          {
            name: "certNumber",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "KF-2026-ABC12345",
          },
        ],
        responses: {
          "200": {
            description: "Certificate valid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    certificateNumber: { type: "string" },
                    issuedAt: { type: "string", format: "date-time" },
                    courseTitle: { type: "string" },
                    userName: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Certificate not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard statistics",
        description: "Ambil statistik belajar user.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard stats",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardStats" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/enrolled": {
      get: {
        tags: ["Dashboard"],
        summary: "Enrolled courses",
        description: "Ambil daftar course yang sedang dipelajari user.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of enrolled courses with progress",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Course" },
                      {
                        type: "object",
                        properties: {
                          totalLessons: { type: "integer" },
                          completedLessons: { type: "integer" },
                          progress: {
                            type: "number",
                            description: "0-100",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "System",
      description: "Health check & system endpoints",
    },
    {
      name: "Authentication",
      description:
        "Login, register, dan session management. Gunakan sign-in untuk mendapatkan Bearer token.",
    },
    {
      name: "Courses",
      description: "CRUD dan progress tracking untuk courses & lessons",
    },
    {
      name: "Discussions",
      description: "Forum diskusi per course/lesson dengan threaded replies",
    },
    {
      name: "Quizzes",
      description: "Quiz per lesson dengan scoring dan riwayat attempt",
    },
    {
      name: "Certificates",
      description: "Generate dan verifikasi sertifikat kelulusan",
    },
    {
      name: "Dashboard",
      description: "Statistik dan progress belajar user",
    },
  ],
};

app.get("/", swaggerUI({ url: "/api/docs/spec" }));

app.get("/spec", (c) => c.json(spec));

export default app;
