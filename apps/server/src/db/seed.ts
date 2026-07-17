import "dotenv/config";
import { db } from "./index.js";
import { courses, lessons, quizzes, quizQuestions } from "../db/schema.js";

async function seed() {
  console.log("Seeding database...");

  const [course1] = await db
    .insert(courses)
    .values({
      title: "Dasar-Dasar Vibe Coding dengan AI",
      slug: "dasar-vibe-coding",
      description:
        "Pelajari cara menggunakan AI untuk mempercepat proses development. Dari prompt engineering hingga membangun aplikasi lengkap dengan bantuan AI assistant.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      difficulty: "beginner",
      category: "Vibe Coding",
      estimatedHours: 8,
      isPublished: true,
    })
    .returning();

  const [course2] = await db
    .insert(courses)
    .values({
      title: "Build Full-Stack App dengan AI Assistant",
      slug: "fullstack-ai-assistant",
      description:
        "Praktik langsung membangun aplikasi full-stack menggunakan AI coding assistant. Dari database design hingga deployment.",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
      difficulty: "intermediate",
      category: "Vibe Coding",
      estimatedHours: 15,
      isPublished: true,
    })
    .returning();

  const [course3] = await db
    .insert(courses)
    .values({
      title: "Prompt Engineering untuk Developer",
      slug: "prompt-engineering-dev",
      description:
        "Kuasai seni menulis prompt yang efektif untuk coding. Teknik advanced untuk memaksimalkan output AI assistant.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      difficulty: "intermediate",
      category: "Prompt Engineering",
      estimatedHours: 10,
      isPublished: true,
    })
    .returning();

  const [course4] = await db
    .insert(courses)
    .values({
      title: "Automasi Workflow dengan AI Tools",
      slug: "automasi-ai-tools",
      description:
        "Pelajari berbagai AI tools dan cara mengintegrasikannya ke dalam workflow development Anda untuk produktivitas maksimal.",
      thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800",
      difficulty: "advanced",
      category: "AI Tools",
      estimatedHours: 12,
      isPublished: true,
    })
    .returning();

  // Lessons for Course 1
  const course1Lessons = [
    {
      courseId: course1.id,
      title: "Apa itu Vibe Coding?",
      slug: "apa-itu-vibe-coding",
      orderIndex: 1,
      durationMinutes: 15,
      content: `# Apa itu Vibe Coding?

**Vibe Coding** adalah pendekatan baru dalam software development dimana developer berkolaborasi dengan AI assistant untuk menulis kode. Istilah ini dipopulerkan oleh Andrej Karpathy pada awal 2025.

## Konsep Utama

Vibe coding bukan berarti kita tidak perlu memahami programming. Sebaliknya, ini adalah cara untuk **mempercepat** proses development dengan memanfaatkan kekuatan AI.

### Bagaimana Cara Kerjanya?

1. **Describe** - Jelaskan apa yang ingin Anda buat dalam bahasa natural
2. **Generate** - AI assistant akan menghasilkan kode berdasarkan deskripsi Anda
3. **Review** - Tinjau kode yang dihasilkan, pahami logikanya
4. **Iterate** - Perbaiki dan tingkatkan melalui iterasi selanjutnya

## Mengapa Vibe Coding Penting?

- **Produktivitas** meningkat 2-5x lipat
- **Barrier to entry** lebih rendah untuk pemula
- Fokus pada **problem solving** bukan syntax
- Mempercepat **prototyping** dan **MVP development**

## Tools yang Digunakan

| Tool | Kegunaan |
|------|----------|
| Claude Code | AI coding assistant di terminal |
| Cursor | AI-powered code editor |
| GitHub Copilot | AI pair programmer |
| v0.dev | AI UI generator |
| Bolt.new | Full-stack AI builder |

> **Tips:** Mulailah dengan project kecil dan sederhana. Seiring waktu, Anda akan semakin mahir berkolaborasi dengan AI.

## Kesimpulan

Vibe coding bukan menggantikan skill programming, tapi **mengamplifikasi** kemampuan Anda. Semakin baik pemahaman Anda tentang programming concepts, semakin efektif Anda dalam vibe coding.`,
    },
    {
      courseId: course1.id,
      title: "Setup Environment untuk Vibe Coding",
      slug: "setup-environment",
      orderIndex: 2,
      durationMinutes: 20,
      content: `# Setup Environment untuk Vibe Coding

Sebelum mulai vibe coding, kita perlu menyiapkan environment yang optimal.

## Prerequisites

- **Node.js** v18+ (disarankan v20 LTS)
- **Git** untuk version control
- **Terminal** yang nyaman (Windows Terminal, iTerm2, dll)

## Install AI Coding Tools

### 1. Claude Code (Recommended)

\`\`\`bash
npm install -g @anthropic-ai/claude-code
claude
\`\`\`

Claude Code adalah AI assistant yang berjalan langsung di terminal Anda.

### 2. Cursor Editor

Download dari [cursor.com](https://cursor.com) dan install seperti VS Code biasa.

**Keunggulan Cursor:**
- Built-in AI chat
- Inline code generation (Cmd+K)
- Codebase-aware suggestions

### 3. VS Code + Extensions

Jika tetap ingin menggunakan VS Code:

\`\`\`
ext install GitHub.copilot
ext install Continue.continue
\`\`\`

## Konfigurasi Terminal

Buat alias yang berguna:

\`\`\`bash
# Tambahkan ke .bashrc atau .zshrc
alias cc="claude"
alias dev="npm run dev"
\`\`\`

## Project Structure Best Practices

\`\`\`
my-project/
├── CLAUDE.md          # Instruksi untuk AI assistant
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── package.json
└── README.md
\`\`\`

## Tips Penting

1. **Selalu gunakan Git** - Commit sering agar bisa rollback
2. **Buat CLAUDE.md** - File ini membantu AI memahami project Anda
3. **Gunakan TypeScript** - Type safety membantu AI menulis kode yang lebih akurat
4. **Test setiap perubahan** - Jangan blindly accept semua output AI`,
    },
    {
      courseId: course1.id,
      title: "Menulis Prompt yang Efektif",
      slug: "menulis-prompt-efektif",
      orderIndex: 3,
      durationMinutes: 25,
      content: `# Menulis Prompt yang Efektif

Prompt yang baik adalah kunci sukses vibe coding. Mari pelajari cara menulis prompt yang menghasilkan output berkualitas.

## Anatomi Prompt yang Baik

Sebuah prompt efektif memiliki 4 komponen:

### 1. Context (Konteks)
Berikan informasi tentang project, tech stack, dan constraints.

\`\`\`
Saya sedang membangun aplikasi e-commerce menggunakan React + TypeScript.
Database menggunakan PostgreSQL dengan Drizzle ORM.
\`\`\`

### 2. Task (Tugas)
Jelaskan secara spesifik apa yang ingin dibuat.

\`\`\`
Buatkan komponen ProductCard yang menampilkan:
- Gambar produk
- Nama produk
- Harga (format Rupiah)
- Tombol "Add to Cart"
\`\`\`

### 3. Format (Format Output)
Tentukan format output yang diinginkan.

\`\`\`
Gunakan TailwindCSS untuk styling.
Komponen harus menerima props: { product: Product }
Export sebagai default export.
\`\`\`

### 4. Examples (Contoh)
Berikan contoh jika memungkinkan.

## Anti-Patterns

❌ **Terlalu vague:**
> "Buatkan halaman login"

✅ **Spesifik dan jelas:**
> "Buatkan halaman login dengan email dan password. Gunakan React Hook Form untuk validation. Tampilkan error message di bawah input field. Setelah login berhasil, redirect ke /dashboard."

## Framework CRAFT

- **C**ontext - Apa konteks project ini?
- **R**ole - Peran apa yang diminta AI?
- **A**ction - Apa yang harus dilakukan?
- **F**ormat - Output format seperti apa?
- **T**arget - Untuk siapa/apa hasilnya?

## Latihan

Coba tulis prompt untuk:
1. Membuat REST API endpoint
2. Membuat React component
3. Menulis unit test
4. Melakukan code review`,
    },
    {
      courseId: course1.id,
      title: "Hands-On: Bangun Landing Page dengan AI",
      slug: "hands-on-landing-page",
      orderIndex: 4,
      durationMinutes: 30,
      content: `# Hands-On: Bangun Landing Page dengan AI

Saatnya praktik! Kita akan membangun landing page modern menggunakan AI assistant.

## Objektif

Membuat landing page untuk sebuah SaaS product dengan sections:
- Hero section
- Features
- Pricing
- CTA (Call to Action)

## Step 1: Inisialisasi Project

Buka terminal dan mulai dengan prompt berikut:

\`\`\`
Buatkan project React + Vite + TailwindCSS baru.
Nama project: awesome-saas
Gunakan TypeScript.
\`\`\`

## Step 2: Hero Section

\`\`\`
Buatkan Hero section dengan:
- Headline yang catchy
- Sub-headline
- CTA button "Get Started"
- Background gradient dari biru ke ungu
- Responsive untuk mobile dan desktop
\`\`\`

## Step 3: Iterasi dan Perbaikan

Setelah AI menghasilkan kode awal, iterasi dengan prompt seperti:

\`\`\`
Perbaiki Hero section:
- Tambahkan animasi fade-in saat scroll
- Buat button dengan hover effect
- Tambahkan ilustrasi di sebelah kanan (gunakan placeholder)
\`\`\`

## Step 4: Review Kode

Selalu review kode yang dihasilkan:

\`\`\`
Review kode ini dan jelaskan:
1. Apakah ada accessibility issues?
2. Apakah responsive design sudah benar?
3. Apakah ada performance concern?
\`\`\`

## Tips Penting

1. **Iterasi bertahap** - Jangan minta semuanya sekaligus
2. **Be specific** - Semakin detail prompt, semakin akurat hasilnya
3. **Review selalu** - AI bisa menghasilkan kode yang kurang optimal
4. **Commit sering** - Gunakan git untuk tracking perubahan

## Challenge

Coba kembangkan landing page ini dengan menambahkan:
- Dark mode toggle
- Testimonial section
- FAQ accordion
- Footer dengan social links`,
    },
    {
      courseId: course1.id,
      title: "Best Practices dan Etika Vibe Coding",
      slug: "best-practices-etika",
      orderIndex: 5,
      durationMinutes: 15,
      content: `# Best Practices dan Etika Vibe Coding

## Best Practices

### 1. Understand Before You Ship
Jangan deploy kode yang tidak Anda pahami. AI membantu menulis, tapi Anda tetap bertanggung jawab.

### 2. Version Control
\`\`\`bash
# Commit sebelum dan sesudah AI-assisted changes
git add .
git commit -m "feat: add landing page hero section (AI-assisted)"
\`\`\`

### 3. Code Review
Selalu review output AI untuk:
- **Security vulnerabilities** (SQL injection, XSS, dll)
- **Performance issues** (N+1 queries, memory leaks)
- **Error handling** yang proper
- **Edge cases** yang terlewat

### 4. Testing
\`\`\`
Buatkan unit test untuk fungsi calculateTotal.
Cover edge cases: empty cart, negative prices, discount > 100%.
\`\`\`

### 5. Documentation
Minta AI membantu dokumentasi:
\`\`\`
Buatkan JSDoc untuk semua public functions di file ini.
\`\`\`

## Etika Vibe Coding

### Do's ✅
- Credit AI tools yang digunakan di project documentation
- Pahami lisensi dan terms of service AI tools
- Gunakan untuk meningkatkan produktivitas, bukan menggantikan pemahaman
- Share knowledge dengan team

### Don'ts ❌
- Jangan submit AI-generated code tanpa review
- Jangan gunakan untuk bypass security measures
- Jangan claim 100% original jika menggunakan AI
- Jangan kirim data sensitif ke AI tools

## Kesimpulan Course

Selamat! Anda telah menyelesaikan course "Dasar-Dasar Vibe Coding dengan AI". Sekarang Anda memiliki fondasi yang kuat untuk memulai journey vibe coding Anda.

**Next Steps:**
1. Praktik setiap hari dengan project kecil
2. Lanjut ke course "Build Full-Stack App dengan AI Assistant"
3. Join komunitas dan share pengalaman Anda`,
    },
  ];

  const insertedLessons1 = await db.insert(lessons).values(course1Lessons).returning();

  // Lessons for Course 2 (abbreviated)
  const course2Lessons = [
    {
      courseId: course2.id,
      title: "Planning Full-Stack App dengan AI",
      slug: "planning-fullstack",
      orderIndex: 1,
      durationMinutes: 20,
      content: `# Planning Full-Stack App dengan AI

## Pendahuluan
Membangun aplikasi full-stack bisa terasa overwhelming. Tapi dengan bantuan AI, prosesnya menjadi jauh lebih terstruktur dan efisien.

## Step 1: Define Requirements
Mulai dengan menjelaskan apa yang ingin Anda buat:

\`\`\`
Saya ingin membangun aplikasi task management dengan fitur:
- User authentication
- CRUD tasks
- Categories/labels
- Due dates
- Priority levels
\`\`\`

## Step 2: Choose Tech Stack
Minta AI membantu pilih tech stack:

\`\`\`
Rekomendasikan tech stack untuk task management app.
Prioritas: developer experience, performance, deployment mudah.
\`\`\`

## Step 3: Database Design
\`\`\`
Desain database schema untuk task management app.
Tables yang dibutuhkan: users, tasks, categories, labels.
Gunakan PostgreSQL.
\`\`\`

## Step 4: API Design
\`\`\`
Desain REST API endpoints untuk task management.
Include authentication endpoints.
Format: method, path, description, request body, response.
\`\`\`

## Kesimpulan
Planning yang matang = development yang lancar. AI membantu mempercepat fase planning ini secara signifikan.`,
    },
    {
      courseId: course2.id,
      title: "Setup Database & ORM dengan AI",
      slug: "setup-database-orm",
      orderIndex: 2,
      durationMinutes: 25,
      content: `# Setup Database & ORM dengan AI

Kita akan menggunakan PostgreSQL + Drizzle ORM. AI akan membantu generate schema dan migrations.

## Langkah-langkah

### 1. Install Dependencies
\`\`\`bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
\`\`\`

### 2. Buat Schema dengan AI
Prompt:
\`\`\`
Buatkan Drizzle ORM schema untuk task management app.
- users: id, name, email, password hash, created_at
- tasks: id, title, description, status, priority, due_date, user_id, category_id
- categories: id, name, color, user_id
\`\`\`

### 3. Generate Migrations
\`\`\`bash
npx drizzle-kit generate
npx drizzle-kit migrate
\`\`\`

### 4. Seed Data
Minta AI buatkan seed data:
\`\`\`
Buatkan seed data realistis untuk testing.
Include 3 users, 10 tasks per user, 5 categories.
\`\`\`

## Tips
- Selalu review schema yang di-generate AI
- Pastikan foreign keys dan indexes sudah benar
- Test migrations di local sebelum deploy`,
    },
    {
      courseId: course2.id,
      title: "Building REST API dengan Hono + AI",
      slug: "building-rest-api",
      orderIndex: 3,
      durationMinutes: 30,
      content: `# Building REST API dengan Hono + AI

## Mengapa Hono?
- Ultra-ringan (~14kb)
- TypeScript-first
- Web Standard API
- Multi-runtime (Node.js, Deno, Bun, Cloudflare Workers)

## Setup
\`\`\`bash
npm install hono @hono/node-server
\`\`\`

## Prompt untuk Generate API
\`\`\`
Buatkan REST API dengan Hono untuk task management:

Endpoints:
- GET /api/tasks - List semua tasks user
- POST /api/tasks - Create task baru
- GET /api/tasks/:id - Get task detail
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

Requirements:
- Gunakan Drizzle ORM
- Validasi input
- Error handling yang proper
- Auth middleware
\`\`\`

## Iterasi
Setelah kode di-generate, iterasi:
\`\`\`
Tambahkan:
- Pagination untuk list endpoint
- Filter by status dan priority
- Sort by due_date atau created_at
- Search by title
\`\`\`

## Testing API
Gunakan AI untuk generate test:
\`\`\`
Buatkan integration test untuk semua API endpoints.
Gunakan Vitest dan supertest.
\`\`\``,
    },
  ];

  await db.insert(lessons).values(course2Lessons);

  // Lessons for Course 3
  const course3Lessons = [
    {
      courseId: course3.id,
      title: "Fundamental Prompt Engineering",
      slug: "fundamental-prompt-engineering",
      orderIndex: 1,
      durationMinutes: 20,
      content: `# Fundamental Prompt Engineering

## Apa itu Prompt Engineering?

Prompt engineering adalah seni dan ilmu merancang instruksi yang efektif untuk AI model agar menghasilkan output yang diinginkan.

## Prinsip Dasar

### 1. Clarity (Kejelasan)
Tulis instruksi sejelas mungkin. Hindari ambiguitas.

### 2. Specificity (Spesifisitas)
Berikan detail spesifik tentang format, style, dan constraints.

### 3. Context (Konteks)
Sediakan informasi latar belakang yang relevan.

### 4. Examples (Contoh)
Berikan contoh input-output yang diharapkan (few-shot prompting).

## Teknik Prompting

### Zero-shot
Langsung memberikan instruksi tanpa contoh.
\`\`\`
Buatkan fungsi JavaScript yang memvalidasi email address.
\`\`\`

### Few-shot
Memberikan beberapa contoh sebelum instruksi.
\`\`\`
Contoh naming convention di project ini:
- getUserById -> camelCase
- user_schema -> snake_case untuk database
- UserProfile -> PascalCase untuk components

Buatkan fungsi baru mengikuti convention yang sama.
\`\`\`

### Chain-of-thought
Minta AI menjelaskan langkah-langkahnya.
\`\`\`
Jelaskan step-by-step bagaimana cara implement
pagination di REST API, lalu buatkan kodenya.
\`\`\``,
    },
  ];

  await db.insert(lessons).values(course3Lessons);

  // Course 4 lessons
  const course4Lessons = [
    {
      courseId: course4.id,
      title: "Overview AI Tools untuk Developer",
      slug: "overview-ai-tools",
      orderIndex: 1,
      durationMinutes: 20,
      content: `# Overview AI Tools untuk Developer

## Landscape AI Tools 2025

### Code Generation
| Tool | Best For | Pricing |
|------|----------|---------|
| Claude Code | Terminal-based coding | API-based |
| Cursor | Full IDE experience | $20/mo |
| GitHub Copilot | Inline suggestions | $10/mo |
| Codeium | Free alternative | Free tier |

### UI/Design
- **v0.dev** - Generate React UI components
- **Galileo AI** - Design to code
- **Figma AI** - Design assistance

### Testing & Review
- **CodeRabbit** - AI code review
- **Codium AI** - Test generation
- **Snyk** - Security scanning

### Documentation
- **Mintlify** - AI docs generation
- **Readme.so** - README generator

## Cara Memilih Tool

1. **Evaluasi kebutuhan** - Apa bottleneck Anda?
2. **Try before buy** - Gunakan free tier dulu
3. **Integration** - Pastikan cocok dengan workflow
4. **Privacy** - Cek data handling policy
5. **ROI** - Hitung time saved vs cost`,
    },
  ];

  await db.insert(lessons).values(course4Lessons);

  // Add quiz for lesson 1 of course 1
  const [quiz1] = await db
    .insert(quizzes)
    .values({
      lessonId: insertedLessons1[0].id,
      title: "Quiz: Apa itu Vibe Coding?",
      passingScore: 60,
    })
    .returning();

  await db.insert(quizQuestions).values([
    {
      quizId: quiz1.id,
      question: "Siapa yang mempopulerkan istilah 'Vibe Coding'?",
      options: [
        { text: "Elon Musk", isCorrect: false },
        { text: "Andrej Karpathy", isCorrect: true },
        { text: "Sam Altman", isCorrect: false },
        { text: "Mark Zuckerberg", isCorrect: false },
      ],
      explanation:
        "Andrej Karpathy mempopulerkan istilah Vibe Coding pada awal 2025.",
      orderIndex: 1,
    },
    {
      quizId: quiz1.id,
      question:
        "Apa langkah pertama dalam proses Vibe Coding?",
      options: [
        { text: "Generate kode langsung", isCorrect: false },
        { text: "Describe (jelaskan apa yang ingin dibuat)", isCorrect: true },
        { text: "Deploy ke production", isCorrect: false },
        { text: "Menulis unit test", isCorrect: false },
      ],
      explanation:
        "Langkah pertama adalah Describe - menjelaskan apa yang ingin Anda buat dalam bahasa natural.",
      orderIndex: 2,
    },
    {
      quizId: quiz1.id,
      question: "Berapa kali lipat peningkatan produktivitas yang bisa dicapai dengan Vibe Coding?",
      options: [
        { text: "1-2x", isCorrect: false },
        { text: "2-5x", isCorrect: true },
        { text: "10-20x", isCorrect: false },
        { text: "100x", isCorrect: false },
      ],
      explanation: "Vibe coding dapat meningkatkan produktivitas 2-5x lipat.",
      orderIndex: 3,
    },
  ]);

  console.log("Seed completed!");
  console.log(`Created ${4} courses with lessons and quizzes`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
