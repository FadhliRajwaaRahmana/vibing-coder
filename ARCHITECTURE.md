# VibingCoder — Arsitektur Project

> Platform belajar vibe coding gratis. Monorepo full-stack TypeScript dengan React + Hono + Drizzle ORM, di-deploy sebagai satu kesatuan di Vercel.

---

## Daftar Isi

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Struktur Monorepo](#struktur-monorepo)
- [Directory Tree](#directory-tree)
- [Frontend Architecture](#frontend-architecture)
  - [Routing](#routing)
  - [Component Hierarchy](#component-hierarchy)
  - [State Management & Data Fetching](#state-management--data-fetching)
  - [API Client](#api-client)
  - [Authentication (Client)](#authentication-client)
  - [Design System](#design-system)
  - [Animation System](#animation-system)
- [Backend Architecture](#backend-architecture)
  - [API Routes](#api-routes)
  - [Authentication (Server)](#authentication-server)
  - [Auth Middleware](#auth-middleware)
  - [Database Layer](#database-layer)
- [Database Schema](#database-schema)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Tabel Detail](#tabel-detail)
- [Deployment Architecture](#deployment-architecture)
  - [Vercel Configuration](#vercel-configuration)
  - [Environment Variables](#environment-variables)
  - [Development vs Production](#development-vs-production)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Seed Data](#seed-data)

---

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                           │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────┐     │
│  │   Static CDN     │      │  Serverless Function  │    │
│  │   (React SPA)    │      │  (Hono API - Node.js) │    │
│  │                  │      │                        │    │
│  │  apps/web/dist   │ /api │  api/[[...path]].ts    │    │
│  │                  │─────▶│  ↓                     │    │
│  │  React 19        │      │  apps/server/src/      │    │
│  │  Vite 6          │      │  index.ts              │    │
│  │  TanStack Query  │      │                        │    │
│  └──────────────────┘      └──────────┬─────────────┘    │
│                                       │                  │
└───────────────────────────────────────┼──────────────────┘
                                        │ SSL
                                        ▼
                              ┌──────────────────┐
                              │  Aiven PostgreSQL │
                              │  (Cloud-hosted)   │
                              └──────────────────┘
```

**VibingCoder** adalah learning management system (LMS) yang menyediakan materi vibe coding gratis — mulai dari prompt engineering hingga membangun full-stack app dengan AI. Platform ini mendukung:

- Kursus terstruktur dengan materi markdown
- Progress tracking per lesson
- Quiz interaktif dengan scoring otomatis
- Sertifikat yang bisa diverifikasi publik
- Forum diskusi per kursus (threaded replies)
- Dashboard personal dengan statistik belajar

---

## Tech Stack

| Layer | Teknologi | Versi | Peran |
|-------|-----------|-------|-------|
| **Frontend** | React | 19.1.0 | UI framework |
| | Vite | 6.3.5 | Build tool & dev server |
| | React Router | 7.6.1 | Client-side routing (SPA) |
| | TanStack Query | 5.75.5 | Server state & caching |
| | Framer Motion | 12.42.2 | Scroll & transition animations |
| | Lenis | 1.3.25 | Smooth scroll behavior |
| | TailwindCSS | 3.4.17 | Utility-first CSS |
| | shadcn/ui (CVA + Radix) | — | Component primitives |
| | Lucide React | 0.475.0 | Icon set |
| | marked | 15.0.8 | Markdown → HTML rendering |
| **Backend** | Hono | 4.7.10 | Lightweight HTTP framework |
| | Better Auth | 1.2.8 | Email/password authentication |
| | Drizzle ORM | 0.44.2 | Type-safe SQL query builder |
| | node-postgres (pg) | 8.16.0 | PostgreSQL driver |
| | nanoid | 5.1.5 | Certificate number generation |
| **Database** | PostgreSQL (Aiven) | — | Cloud-managed relational DB |
| **Deploy** | Vercel | — | Static hosting + serverless |
| **Language** | TypeScript | 5.7.3 | Across all workspaces |

---

## Struktur Monorepo

Project menggunakan **npm workspaces** untuk mengelola monorepo dengan 3 workspace:

```
kelas-fullstack/
├── apps/
│   ├── web/          → @kelas/web      (React SPA frontend)
│   └── server/       → @kelas/server   (Hono API backend)
├── packages/
│   └── shared/       → @kelas/shared   (Shared TypeScript interfaces)
├── api/              → Vercel serverless entry point
├── package.json      → Root workspace config
├── tsconfig.json     → Base TypeScript config
└── vercel.json       → Deployment config
```

### Workspace Dependencies

```
@kelas/web ──────────────────────── (no cross-workspace imports)
@kelas/server ───────────────────── (no cross-workspace imports)
@kelas/shared ──── Course, Lesson, Difficulty interfaces (exported but unused)
```

> Note: `@kelas/shared` mendefinisikan interfaces `Course` dan `Lesson`, namun saat ini belum diimport oleh workspace lain. Masing-masing workspace mengelola types-nya sendiri.

---

## Directory Tree

```
kelas-fullstack/
│
├── .env                                    # Root env (DB, auth secret)
├── .gitignore
├── package.json                            # Monorepo root, workspaces config
├── tsconfig.json                           # Base TypeScript config (ES2022, strict)
├── vercel.json                             # Vercel deploy config
│
├── api/
│   └── [[...path]].ts                      # Vercel catch-all serverless function
│
├── apps/
│   ├── server/                             # ─── BACKEND ───
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts               # Drizzle Kit config (migration)
│   │   ├── .env                            # Server env (DB creds, auth)
│   │   ├── drizzle/
│   │   │   ├── 0000_cooing_skullbuster.sql # Initial SQL migration
│   │   │   └── meta/
│   │   │       ├── 0000_snapshot.json
│   │   │       └── _journal.json
│   │   └── src/
│   │       ├── index.ts                    # Hono app + route mounting + export
│   │       ├── auth.ts                     # Better Auth server config
│   │       ├── db/
│   │       │   ├── index.ts                # pg.Pool + Drizzle instance
│   │       │   ├── schema.ts               # All table definitions
│   │       │   └── seed.ts                 # Seed: 4 courses, lessons, quizzes
│   │       ├── middleware/
│   │       │   └── auth.ts                 # Session extraction middleware
│   │       └── routes/
│   │           ├── courses.ts              # Course + lesson CRUD, progress
│   │           ├── discussions.ts          # Threaded discussion forum
│   │           ├── quizzes.ts              # Quiz fetch + submission
│   │           ├── certificates.ts         # Certificate generation + verify
│   │           └── dashboard.ts            # Dashboard stats + enrolled
│   │
│   └── web/                                # ─── FRONTEND ───
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts                  # Vite + proxy + path alias
│       ├── tailwind.config.ts              # Warm palette + animations
│       ├── postcss.config.js
│       ├── index.html                      # HTML shell + OG meta tags
│       ├── public/
│       │   └── favicon.svg                 # Custom </> SVG favicon
│       └── src/
│           ├── main.tsx                    # ReactDOM.createRoot
│           ├── App.tsx                     # Router + QueryClient + Lenis
│           ├── index.css                   # CSS vars + prose styles
│           ├── vite-env.d.ts
│           ├── lib/
│           │   ├── api.ts                  # Typed fetch wrapper (api.*)
│           │   ├── auth.ts                 # Better Auth React client
│           │   ├── utils.ts                # cn() — clsx + tailwind-merge
│           │   └── animations.ts           # Framer Motion variant presets
│           ├── components/
│           │   ├── navbar.tsx              # Responsive nav + mobile drawer
│           │   ├── footer.tsx              # Site footer (dark bg)
│           │   ├── smooth-scroll.tsx       # Lenis provider wrapper
│           │   └── ui/                     # shadcn/ui components
│           │       ├── avatar.tsx
│           │       ├── badge.tsx
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── input.tsx
│           │       ├── label.tsx
│           │       ├── progress.tsx
│           │       └── separator.tsx
│           └── pages/
│               ├── landing.tsx             # Marketing landing page
│               ├── login.tsx               # Login form
│               ├── register.tsx            # Registration form
│               ├── courses.tsx             # Course listing grid
│               ├── course-detail.tsx       # Course detail + lesson list
│               ├── lesson.tsx              # Lesson reader + sidebar
│               ├── dashboard.tsx           # Personal dashboard
│               ├── discussions.tsx         # Discussion forum
│               ├── quiz.tsx                # Interactive quiz
│               ├── certificates.tsx        # Certificate gallery
│               └── verify-certificate.tsx  # Public certificate verify
│
└── packages/
    └── shared/                             # ─── SHARED TYPES ───
        ├── package.json
        └── src/
            └── index.ts                    # Course, Lesson, Difficulty types
```

---

## Frontend Architecture

### Routing

Semua routing menggunakan **React Router v7** dengan mode SPA (BrowserRouter). Layout dibungkus `AppLayout` yang menyediakan `Navbar` + `Footer` (optional).

```
BrowserRouter
└── Routes
    ├── AppLayout (Navbar + Footer)
    │   ├── /                           → LandingPage
    │   ├── /login                      → LoginPage
    │   ├── /register                   → RegisterPage
    │   ├── /courses                    → CoursesPage
    │   ├── /courses/:slug              → CourseDetailPage
    │   ├── /courses/:slug/discussions  → DiscussionsPage
    │   ├── /courses/:slug/lessons/:lessonSlug/quiz → QuizPage
    │   │
    │   ├── ProtectedRoute (requires auth)
    │   │   ├── /dashboard              → DashboardPage
    │   │   └── /dashboard/certificates → CertificatesPage
    │   │
    │   └── /certificates/verify/:certNumber → VerifyCertificatePage
    │
    └── AppLayout (hideFooter: true)
        └── /courses/:slug/lessons/:lessonSlug → LessonPage
```

**`ProtectedRoute`** component mengecek session via `useSession()`. Jika belum login, redirect ke `/login`. `ScrollToTop` component me-reset scroll position setiap route change.

### Component Hierarchy

```
<LenisProvider>                          # Smooth scroll (lerp: 0.1)
  <BrowserRouter>
    <QueryClientProvider>                # TanStack Query (staleTime: 5min)
      <ScrollToTop />                    # Reset scroll on navigate
      <Routes>
        <AppLayout>                      # Navbar + (optional) Footer
          <Navbar />                     # Sticky, responsive, animated
          <Outlet />                     # Page content
          <Footer />                     # Dark footer with links
        </AppLayout>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>
</LenisProvider>
```

### State Management & Data Fetching

Tidak ada global state management (Redux, Zustand, dll). Semua state dikelola via:

| Mechanism | Digunakan Untuk |
|-----------|-----------------|
| **TanStack Query** | Server state: courses, lessons, progress, discussions, quiz, certificates, dashboard |
| **React `useState`** | Local UI state: form inputs, modal open/close, quiz answers, current question index |
| **Better Auth `useSession`** | Auth state: current user, session |
| **URL params (React Router)** | Navigation state: course slug, lesson slug, cert number |

**Query Key Convention:**

```typescript
["courses"]                       // All courses
["course", slug]                  // Single course by slug
["lesson", slug, lessonSlug]      // Single lesson
["progress", slug]                // User progress for a course
["discussions", courseId]          // Discussion threads
["quiz", lessonId]                // Quiz for a lesson
["dashboard-stats"]               // Dashboard aggregate stats
["dashboard-enrolled"]            // User's enrolled courses
["my-certificates"]               // User's certificates
["verify-cert", certNumber]       // Certificate verification
```

### API Client

File: `apps/web/src/lib/api.ts`

Typed fetch wrapper dengan namespace pattern:

```typescript
const api = {
  courses: {
    list()                              // GET    /api/courses
    get(slug)                           // GET    /api/courses/:slug
    getLesson(slug, lessonSlug)         // GET    /api/courses/:slug/lessons/:lessonSlug
    completeLesson(slug, lessonSlug)    // POST   /api/courses/:slug/lessons/:lessonSlug/complete
    getProgress(slug)                   // GET    /api/courses/:slug/progress
  },
  discussions: {
    getByCourse(courseId, lessonId?)     // GET    /api/discussions/course/:courseId
    create(data)                        // POST   /api/discussions
    delete(id)                          // DELETE /api/discussions/:id
  },
  quizzes: {
    getByLesson(lessonId)               // GET    /api/quizzes/lesson/:lessonId
    submit(quizId, answers)             // POST   /api/quizzes/:quizId/submit
    getAttempts(quizId)                 // GET    /api/quizzes/:quizId/attempts
  },
  certificates: {
    generate(courseId)                   // POST   /api/certificates/generate/:courseId
    getMy()                             // GET    /api/certificates/my
    verify(certNumber)                  // GET    /api/certificates/verify/:certNumber
  },
  dashboard: {
    stats()                             // GET    /api/dashboard/stats
    enrolled()                          // GET    /api/dashboard/enrolled
  }
}
```

Semua request menyertakan `credentials: "include"` untuk cookie-based auth. Base URL: `/api` (relative path — proxied di dev, same-origin di production).

### Authentication (Client)

File: `apps/web/src/lib/auth.ts`

```typescript
const authClient = createAuthClient({
  baseURL: window.location.origin,    // Same-origin: works both dev & prod
});

// Exported hooks & methods:
useSession    // React hook — current session & user
signIn        // signIn.email({ email, password })
signUp        // signUp.email({ name, email, password })
signOut       // signOut()
```

### Design System

#### Color Palette (Warm, No Gradients)

| Token | HSL | Hex | Preview | Penggunaan |
|-------|-----|-----|---------|------------|
| `--primary` | `66 95% 53%` | `#F0FA13` | Lime/Chartreuse | Primary accent, badges |
| `--secondary` | `45 100% 63%` | `#FFDE42` | Golden Yellow | Buttons, highlights, brand |
| `--accent` | `33 100% 71%` | `#FFC76E` | Warm Orange | Icons, secondary accents |
| `--warm` | `18 100% 79%` | `#FFB895` | Peach/Salmon | Background decorations |
| `--background` | `36 100% 98%` | `#FFFCF5` | Off-White | Page background |
| `--foreground` | `234 33% 14%` | `#1A1A2E` | Deep Navy | Text, dark sections |
| `--destructive` | `0 84% 60%` | `#EF4444` | Red | Errors, delete actions |

#### Typography

- **Primary**: Inter (400–900) — Google Fonts
- **Monospace**: JetBrains Mono (400–600) — code blocks
- **Code block theme**: Catppuccin-style dark (`bg-[#1e1e2e]`, `text-[#cdd6f4]`)

#### Button Pattern

```
Primary:    bg-foreground text-background hover:bg-foreground/90
Secondary:  bg-secondary text-secondary-foreground hover:bg-secondary/90
Outline:    border border-input hover:bg-accent hover:text-accent-foreground
```

#### UI Components (shadcn/ui)

| Component | File | Variants |
|-----------|------|----------|
| Button | `ui/button.tsx` | default, destructive, outline, secondary, ghost, link × sm, default, lg, icon |
| Badge | `ui/badge.tsx` | default, secondary, destructive, outline, success, warning |
| Card | `ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Input | `ui/input.tsx` | Standard text input |
| Label | `ui/label.tsx` | Radix Label |
| Progress | `ui/progress.tsx` | Radix animated progress bar |
| Avatar | `ui/avatar.tsx` | Radix Avatar (Image + Fallback) |
| Separator | `ui/separator.tsx` | Radix horizontal/vertical separator |

### Animation System

#### Framer Motion Presets (`lib/animations.ts`)

```typescript
fadeInUp        // ↑ y: 30→0, opacity: 0→1, 0.6s ease-out
fadeIn           // opacity: 0→1, 0.6s ease-out
slideInLeft     // ← x: -30→0, opacity: 0→1, 0.6s ease-out
slideInRight    // → x: 30→0, opacity: 0→1, 0.6s ease-out
staggerContainer // Children stagger 0.1s delay
scaleIn         // Scale: 0.9→1, opacity: 0→1, 0.5s ease-out
```

#### Scroll Behavior

Semua section menggunakan `whileInView` dengan `viewport={{ once: false }}` sehingga animasi **re-trigger** saat scroll bolak-balik:

```tsx
<motion.div
  initial="initial"
  whileInView="animate"
  viewport={{ once: false, margin: "-50px" }}
  variants={fadeInUp}
>
```

#### Smooth Scrolling

**Lenis** (`components/smooth-scroll.tsx`) membungkus seluruh app:
- `lerp: 0.1` — smoothness factor
- `duration: 1.2` — scroll duration
- `smoothWheel: true` — smooth mouse wheel

---

## Backend Architecture

### API Routes

```
/api
├── /auth/*                    ← Better Auth handler (POST, GET)
├── /health                    ← Health check
│
├── /courses                   ← GET: List all published courses
├── /courses/:slug             ← GET: Course detail + lessons
├── /courses/:slug/lessons/:lessonSlug
│   ├── GET                    ← Lesson content + sibling nav
│   └── /complete   POST 🔒   ← Mark lesson complete
├── /courses/:slug/progress    ← GET 🔒: User progress
│
├── /discussions
│   ├── /course/:courseId      ← GET: Threaded discussions
│   ├── POST 🔒               ← Create post/reply
│   └── /:id   DELETE 🔒      ← Delete own post
│
├── /quizzes
│   ├── /lesson/:lessonId      ← GET: Quiz (answers stripped)
│   └── /:quizId
│       ├── /submit   POST 🔒  ← Submit answers, get score
│       └── /attempts GET 🔒   ← User's attempt history
│
├── /certificates
│   ├── /generate/:courseId POST 🔒 ← Generate cert (all lessons done)
│   ├── /my              GET 🔒    ← User's certificates
│   └── /verify/:certNumber GET    ← Public verification
│
└── /dashboard
    ├── /stats           GET 🔒    ← Aggregate stats
    └── /enrolled        GET 🔒    ← Enrolled courses + progress
```

> 🔒 = requires authentication (auth middleware)

### Authentication (Server)

File: `apps/server/src/auth.ts`

```typescript
betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: {...} }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
})
```

Better Auth mengelola:
- **Registration**: Hash password, simpan di tabel `account`
- **Login**: Verify password, buat session token
- **Session**: Cookie-based, auto-refresh
- **Tables**: `user`, `session`, `account`, `verification`

### Auth Middleware

File: `apps/server/src/middleware/auth.ts`

```typescript
// Extract session from request headers
const session = await auth.api.getSession({ headers: c.req.raw.headers });
if (!session) return c.json({ error: "Unauthorized" }, 401);

// Set on context for route handlers
c.set("user", session.user);
c.set("session", session.session);
```

Digunakan di route handlers:
```typescript
app.post("/complete", authMiddleware, async (c) => {
  const user = c.get("user");  // typed user object
  // ...
});
```

### Database Layer

File: `apps/server/src/db/index.ts`

```typescript
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },    // Required for Aiven
});

export const db = drizzle(pool, { schema });
```

- **Connection pooling** via `pg.Pool` (auto-managed)
- **SSL** enabled untuk Aiven cloud database
- **Query style**: Drizzle relational queries + raw SQL builder

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│   user   │     │ courses  │     │   lessons    │
│──────────│     │──────────│     │──────────────│
│ id (PK)  │◄─┐ │ id (PK)  │◄──┐ │ id (PK)     │
│ name     │  │ │ title    │   │ │ course_id FK │──▶ courses
│ email    │  │ │ slug     │   │ │ title       │
│ ...      │  │ │ desc     │   │ │ slug        │
└──────────┘  │ │ ...      │   │ │ content (md)│
              │ └──────────┘   │ │ order_index │
              │                │ └──────────────┘
              │                │        │
              │                │        │ 1:N
              │                │        ▼
              │    ┌───────────────────────────┐
              │    │     user_progress         │
              │    │───────────────────────────│
              │    │ id (PK)                   │
              ├────│ user_id FK                │
              │    │ lesson_id FK              │──▶ lessons
              │    │ completed                 │
              │    │ completed_at              │
              │    └───────────────────────────┘
              │
              │    ┌───────────────────────────┐
              │    │     discussions            │
              │    │───────────────────────────│
              │    │ id (PK)                   │
              ├────│ user_id FK                │
              │    │ course_id FK              │──▶ courses
              │    │ lesson_id FK (nullable)   │──▶ lessons
              │    │ parent_id (self-ref)      │──▶ discussions
              │    │ content                   │
              │    └───────────────────────────┘
              │
              │    ┌──────────┐    ┌──────────────────┐
              │    │ quizzes  │    │  quiz_questions   │
              │    │──────────│    │──────────────────│
              │    │ id (PK)  │◄───│ quiz_id FK       │
              │    │lesson_id │    │ question         │
              │    │title     │    │ options (jsonb)  │
              │    │pass_score│    │ explanation      │
              │    └──────────┘    │ order_index      │
              │         │          └──────────────────┘
              │         │
              │         │ 1:N
              │         ▼
              │    ┌───────────────────────────┐
              │    │   user_quiz_attempts       │
              │    │───────────────────────────│
              │    │ id (PK)                   │
              ├────│ user_id FK                │
              │    │ quiz_id FK                │──▶ quizzes
              │    │ score                     │
              │    │ answers (jsonb)            │
              │    │ passed                    │
              │    └───────────────────────────┘
              │
              │    ┌───────────────────────────┐
              │    │      certificates          │
              │    │───────────────────────────│
              │    │ id (PK)                   │
              └────│ user_id FK                │
                   │ course_id FK              │──▶ courses
                   │ certificate_number (UQ)   │
                   │ issued_at                 │
                   └───────────────────────────┘
```

### Tabel Detail

#### `user` (Better Auth managed)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `name` | `text` | NOT NULL |
| `email` | `text` | NOT NULL, UNIQUE |
| `email_verified` | `boolean` | NOT NULL, default `false` |
| `image` | `text` | nullable |
| `created_at` | `timestamp` | NOT NULL, default `now()` |
| `updated_at` | `timestamp` | NOT NULL, default `now()` |

#### `session`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `expires_at` | `timestamp` | NOT NULL |
| `token` | `text` | NOT NULL, UNIQUE |
| `ip_address` | `text` | nullable |
| `user_agent` | `text` | nullable |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |

#### `account`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `account_id` | `text` | NOT NULL |
| `provider_id` | `text` | NOT NULL |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |
| `password` | `text` | nullable (hashed) |
| `access_token`, `refresh_token`, `id_token` | `text` | nullable |

#### `courses`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `title` | `varchar(255)` | NOT NULL |
| `slug` | `varchar(255)` | NOT NULL, UNIQUE |
| `description` | `text` | nullable |
| `thumbnail` | `varchar(500)` | nullable |
| `difficulty` | `varchar(50)` | NOT NULL, default `'beginner'` |
| `category` | `varchar(100)` | nullable |
| `estimated_hours` | `integer` | nullable |
| `is_published` | `boolean` | default `false` |

#### `lessons`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `course_id` | `uuid` | FK → `courses.id` ON DELETE CASCADE |
| `title` | `varchar(255)` | NOT NULL |
| `slug` | `varchar(255)` | NOT NULL |
| `content` | `text` | nullable (Markdown) |
| `order_index` | `integer` | NOT NULL |
| `duration_minutes` | `integer` | nullable |

**Indexes**: UNIQUE(`course_id`, `slug`), INDEX(`course_id`, `order_index`)

#### `user_progress`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |
| `lesson_id` | `uuid` | FK → `lessons.id` ON DELETE CASCADE |
| `completed` | `boolean` | default `false` |
| `completed_at` | `timestamp` | nullable |

**Index**: UNIQUE(`user_id`, `lesson_id`)

#### `discussions`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `course_id` | `uuid` | FK → `courses.id` ON DELETE CASCADE |
| `lesson_id` | `uuid` | nullable, FK → `lessons.id` ON DELETE SET NULL |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |
| `parent_id` | `uuid` | nullable (self-ref untuk threading) |
| `content` | `text` | NOT NULL |

#### `quizzes`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `lesson_id` | `uuid` | FK → `lessons.id` ON DELETE CASCADE |
| `title` | `varchar(255)` | NOT NULL |
| `passing_score` | `integer` | default `70` |

#### `quiz_questions`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `quiz_id` | `uuid` | FK → `quizzes.id` ON DELETE CASCADE |
| `question` | `text` | NOT NULL |
| `options` | `jsonb` | `{ text: string; isCorrect: boolean }[]` |
| `explanation` | `text` | nullable |
| `order_index` | `integer` | NOT NULL |

#### `user_quiz_attempts`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |
| `quiz_id` | `uuid` | FK → `quizzes.id` ON DELETE CASCADE |
| `score` | `integer` | NOT NULL |
| `answers` | `jsonb` | `{ questionId: string; selectedIndex: number }[]` |
| `passed` | `boolean` | NOT NULL |

#### `certificates`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `user_id` | `text` | FK → `user.id` ON DELETE CASCADE |
| `course_id` | `uuid` | FK → `courses.id` ON DELETE CASCADE |
| `certificate_number` | `varchar(50)` | NOT NULL, UNIQUE |
| `issued_at` | `timestamp` | default `now()` |

**Index**: UNIQUE(`user_id`, `course_id`) — satu sertifikat per user per course

---

## Deployment Architecture

### Vercel Configuration

```
vercel.json
├── buildCommand: "npm run build -w apps/web"     # Build React SPA
├── outputDirectory: "apps/web/dist"               # Serve static files
├── installCommand: "npm install"                  # Install all workspaces
└── rewrites:
    └── /((?!api/).*)  →  /index.html              # SPA fallback
```

### Request Flow (Production)

```
Browser Request
      │
      ▼
┌─────────────┐
│  Vercel CDN  │
│  (Edge)      │
└──────┬──────┘
       │
       ├── /api/*  ──────────▶  Serverless Function (Node.js)
       │                         api/[[...path]].ts
       │                         └── handle(app)  ← Hono
       │                              └── routes, auth, DB queries
       │
       ├── /assets/*  ──────▶  Static files (CSS, JS, images)
       │                       from apps/web/dist/assets/
       │
       └── /* (else)  ──────▶  apps/web/dist/index.html
                                (React Router handles client-side)
```

### Serverless Entry Point

File: `api/[[...path]].ts`

```typescript
import { handle } from "hono/vercel";
import app from "../apps/server/src/index";

export const config = {
  runtime: "nodejs",      // Node.js runtime (required for pg driver)
  maxDuration: 30,        // 30 second timeout
};

export default handle(app);
```

- `[[...path]]` = Vercel optional catch-all, menangkap semua path di bawah `/api/`
- `handle()` dari `hono/vercel` membungkus Hono app ke format Web API yang Vercel harapkan
- Runtime `nodejs` diperlukan karena `pg` menggunakan `net` dan `tls` modules

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | PostgreSQL host (Aiven) |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `BETTER_AUTH_SECRET` | Yes | Auth signing secret |
| `BETTER_AUTH_URL` | Yes | Backend URL (e.g. `https://vibing-coder.vercel.app`) |
| `FRONTEND_URL` | Yes | Frontend URL (same as above for Vercel) |
| `VERCEL` | Auto | Set automatically by Vercel — guards local `serve()` |
| `PORT` | No | Local dev server port (default: 3000) |

### Development vs Production

```
                    DEVELOPMENT                         PRODUCTION
                    ───────────                         ──────────
Frontend        Vite dev server (:5173)             Vercel CDN (static)
Backend         Hono via tsx watch (:3000)           Vercel Serverless Function
API Proxy       Vite proxy /api → :3000             Same domain (no proxy)
Auth baseURL    window.location.origin (:5173)      window.location.origin
CORS            localhost:5173 → localhost:3000      Same-origin (no CORS)
DB Connection   pg.Pool (persistent)                pg.Pool (per cold start)
Env vars        .env files (dotenv)                 Vercel Dashboard
```

Startup conditional di `apps/server/src/index.ts`:
```typescript
export default app;  // Always export for Vercel

if (!process.env.VERCEL) {
  // Only start HTTP server locally
  serve({ fetch: app.fetch, port });
}
```

---

## Data Flow Diagrams

### User Learning Flow

```
Register/Login
      │
      ▼
Browse Courses (/courses)
      │
      ▼
Select Course (/courses/:slug)
      │
      ├── View Progress Sidebar
      │
      ▼
Read Lesson (/courses/:slug/lessons/:lessonSlug)
      │
      ├── Mark as Complete (POST /api/.../complete)
      │     └── Upsert user_progress record
      │
      ├── Take Quiz (/courses/:slug/lessons/:lessonSlug/quiz)
      │     ├── Answer questions
      │     ├── Submit (POST /api/quizzes/:id/submit)
      │     │     ├── Score calculated server-side
      │     │     ├── Answers stored in user_quiz_attempts
      │     │     └── Return score + pass/fail + per-question results
      │     └── Retry if failed
      │
      └── Join Discussion (/courses/:slug/discussions)
            ├── Post question/comment
            └── Reply (nested via parent_id)
      │
      ▼
All Lessons Complete?
      │
      ├── Yes → Generate Certificate
      │          ├── POST /api/certificates/generate/:courseId
      │          ├── Server verifies ALL lessons completed
      │          ├── Generate unique cert number (nanoid)
      │          └── Store in certificates table
      │
      └── No → Continue learning
```

### Certificate Verification Flow

```
Share cert link: /certificates/verify/:certNumber
      │
      ▼
GET /api/certificates/verify/:certNumber
      │
      ├── Found → Display: userName, courseTitle, certNumber, issuedAt
      │           Badge: ✓ Valid
      │
      └── Not Found → "Sertifikat Tidak Ditemukan"
```

### Authentication Flow

```
┌──────────┐     POST /api/auth/sign-up         ┌─────────────┐
│  Client   │────────────────────────────────────▶│ Better Auth │
│ (React)   │     { name, email, password }      │  (Server)   │
│           │                                     │             │
│           │◀────────────────────────────────────│  ┌────────┐ │
│           │     Set-Cookie: session_token       │  │Drizzle │ │
│           │                                     │  │   ↕    │ │
│           │     GET /api/auth/get-session       │  │  user  │ │
│           │────────────────────────────────────▶│  │session │ │
│           │     Cookie: session_token           │  │account │ │
│           │                                     │  └────────┘ │
│           │◀────────────────────────────────────│             │
│           │     { user, session }               │             │
└──────────┘                                     └─────────────┘
```

---

## Seed Data

File: `apps/server/src/db/seed.ts`

Seed script menyediakan 4 kursus dengan konten lengkap:

| Course | Difficulty | Lessons | Quiz |
|--------|-----------|---------|------|
| Dasar-Dasar Vibe Coding | beginner | 4 lessons (markdown) | ✓ Lesson 1 quiz (5 questions, 70% pass) |
| Build Full-Stack App dengan AI | intermediate | 3 lessons | — |
| Prompt Engineering untuk Developer | intermediate | 2 lessons | — |
| Deploy & DevOps dengan AI | advanced | 2 lessons | — |

Setiap lesson berisi konten markdown lengkap dengan heading, paragraphs, code blocks, dan tips. Total: **11 lessons**, **1 quiz** (5 questions), **4 courses**.

Run seed: `npm run db:seed` (dari root) atau `npm -w apps/server run db:seed`

---

> Dokumen ini di-generate pada 17 Juli 2026 berdasarkan state aktual codebase VibingCoder.
