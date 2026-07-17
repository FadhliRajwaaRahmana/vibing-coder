import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.courses.get(slug!),
    enabled: !!slug,
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", slug],
    queryFn: () => api.courses.getProgress(slug!),
    enabled: !!slug && !!session?.user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Course Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">Course yang Anda cari tidak tersedia.</p>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <Link to="/courses">Kembali ke Courses</Link>
        </Button>
      </div>
    );
  }

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const completedIds = new Set(progress?.completedLessonIds || []);

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial="initial"
        whileInView="animate" viewport={{ once: false, margin: "-50px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        <div className="lg:col-span-2">
          <motion.div variants={fadeInUp} className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/50" />
            <div className="absolute bottom-6 left-6">
              <Badge className="mb-3 bg-secondary text-secondary-foreground border-0">
                {course.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {course.title}
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed mb-8">
            {course.description}
          </motion.p>

          <Separator className="my-8" />

          <motion.h2 variants={fadeInUp} className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-secondary" />
            Daftar Materi ({course.lessons?.length || 0} Lessons)
          </motion.h2>

          <motion.div
            initial="initial"
            whileInView="animate" viewport={{ once: false, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-3"
          >
            {course.lessons?.map((lesson: any, i: number) => {
              const isCompleted = completedIds.has(lesson.id);
              return (
                <motion.div key={lesson.id} variants={fadeInUp}>
                  <Link
                    to={`/courses/${slug}/lessons/${lesson.slug}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md hover:border-secondary/30 transition-all group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-secondary/20 text-foreground"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span>{String(i + 1).padStart(2, "0")}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium group-hover:text-secondary transition-colors">
                            {lesson.title}
                          </h3>
                          {lesson.durationMinutes && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {lesson.durationMinutes} menit
                            </p>
                          )}
                        </div>
                        <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div variants={fadeInUp}>
          <div className="sticky top-24 space-y-6">
            <Card className="shadow-md">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className="capitalize">
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Materi</span>
                    <span className="font-medium">{course.lessons?.length || 0}</span>
                  </div>
                  {course.estimatedHours && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimasi Waktu</span>
                      <span className="font-medium">{course.estimatedHours} jam</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Harga</span>
                    <span className="font-bold text-emerald-600">GRATIS</span>
                  </div>
                </div>

                {session?.user && progress && progress.total > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {progress.completed}/{progress.total} materi selesai
                      </p>
                    </div>
                  </>
                )}

                {course.lessons?.length > 0 && (
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90" size="lg" asChild>
                    <Link to={`/courses/${slug}/lessons/${course.lessons[0].slug}`}>
                      {progress?.completed > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {progressPercent === 100 && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to={`/courses/${slug}/certificate`}>
                      <GraduationCap className="h-4 w-4" />
                      Ambil Sertifikat
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
