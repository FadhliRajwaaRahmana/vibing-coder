import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  BookOpen,
  Code2,
  Users,
  Award,
  ArrowRight,
  Terminal,
  UserPlus,
  CheckCircle2,
  Laptop,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Materi Terstruktur",
    desc: "Kurikulum disusun dari dasar hingga lanjutan. Belajar step-by-step dengan panduan yang jelas.",
    bg: "bg-secondary/20",
  },
  {
    icon: Terminal,
    title: "Praktik Langsung",
    desc: "Setiap materi dilengkapi contoh praktis yang bisa langsung Anda coba di project nyata.",
    bg: "bg-accent/20",
  },
  {
    icon: Users,
    title: "Komunitas Aktif",
    desc: "Diskusikan materi dengan sesama learner. Tanya jawab dan berbagi pengalaman.",
    bg: "bg-warm/20",
  },
];

const steps = [
  { icon: UserPlus, title: "Daftar Akun", desc: "Buat akun gratis dalam hitungan detik" },
  { icon: BookOpen, title: "Pilih Course", desc: "Pilih materi sesuai level dan minat Anda" },
  { icon: Code2, title: "Belajar & Praktik", desc: "Ikuti materi dan langsung praktik coding" },
  { icon: Award, title: "Raih Sertifikat", desc: "Selesaikan course dan dapatkan sertifikat" },
];

const coursePreview = [
  {
    title: "Dasar-Dasar Vibe Coding",
    desc: "Pelajari fundamental vibe coding dan cara berkolaborasi dengan AI untuk membangun aplikasi.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop",
    badge: "Pemula",
    lessons: 4,
  },
  {
    title: "Build Full-Stack App dengan AI",
    desc: "Bangun aplikasi full-stack dari nol menggunakan AI assistant sebagai partner coding Anda.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop",
    badge: "Menengah",
    lessons: 3,
  },
  {
    title: "Prompt Engineering untuk Developer",
    desc: "Kuasai seni menulis prompt yang efektif untuk menghasilkan kode berkualitas tinggi.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=340&fit=crop",
    badge: "Menengah",
    lessons: 2,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="initial"
            whileInView="animate" viewport={{ once: false, margin: "-50px" }}
            variants={staggerContainer}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-secondary/20 text-foreground border-secondary/30 hover:bg-secondary/30">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                100% Gratis — Belajar Tanpa Batas
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
            >
              Belajar Coding Lebih Cepat dengan{" "}
              <span className="text-secondary">Vibe Coding</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Pelajari cara membangun aplikasi modern dengan bantuan AI assistant.
              Dari prompt engineering hingga deployment — semua dalam satu platform.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                size="lg"
                asChild
                className="text-base px-8 bg-foreground text-background hover:bg-foreground/90"
              >
                <Link to="/courses">
                  Mulai Belajar
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link to="/courses">Lihat Courses</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-secondary" />
                <span>10+ Materi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Laptop className="h-4 w-4 text-accent" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-warm" />
                <span>Sertifikat</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kenapa Belajar di VibingCoder?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vibe coding adalah cara baru dalam software development yang memaksimalkan
              kolaborasi antara developer dan AI.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} mb-4`}
                    >
                      <feature.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Course Populer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mulai dari dasar hingga membangun aplikasi full-stack. Semua materi gratis dan terstruktur.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {coursePreview.map((course) => (
              <motion.div key={course.title} variants={fadeInUp}>
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-secondary text-secondary-foreground border-0">
                        {course.badge}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.desc}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{course.lessons} Materi</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false }}
            variants={fadeInUp}
            className="text-center mt-10"
          >
            <Button variant="outline" size="lg" asChild className="group">
              <Link to="/courses">
                Lihat Semua Courses
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="roadmap" className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bagaimana Cara Belajar?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Empat langkah mudah untuk memulai perjalanan vibe coding Anda.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {steps.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background border mb-4 group-hover:shadow-md transition-shadow">
                  <item.icon className="h-7 w-7 text-foreground" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Code2 className="h-7 w-7 text-secondary-foreground" />
              </div>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-background"
            >
              Siap Memulai Perjalanan Coding?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-background/60 mb-8 max-w-lg mx-auto"
            >
              Bergabung sekarang dan mulai perjalanan Anda menuju cara baru dalam software development.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button
                size="lg"
                asChild
                className="text-base px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
              >
                <Link to="/register">
                  Daftar Sekarang — Gratis!
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
