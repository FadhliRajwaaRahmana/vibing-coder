import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { marked } from "marked";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["lesson", slug, lessonSlug],
    queryFn: () => api.courses.getLesson(slug!, lessonSlug!),
    enabled: !!slug && !!lessonSlug,
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", slug],
    queryFn: () => api.courses.getProgress(slug!),
    enabled: !!slug && !!session?.user,
  });

  const completeMutation = useMutation({
    mutationFn: () => api.courses.completeLesson(slug!, lessonSlug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", slug] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!data) return null;

  const { course, lesson, allLessons } = data;
  const currentIndex = allLessons.findIndex((l: any) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const completedIds = new Set(progress?.completedLessonIds || []);
  const isCompleted = completedIds.has(lesson.id);

  const htmlContent = marked.parse(lesson.content || "");

  const handleComplete = async () => {
    if (!session?.user) {
      navigate("/login");
      return;
    }
    await completeMutation.mutateAsync();
    if (nextLesson) {
      navigate(`/courses/${slug}/lessons/${nextLesson.slug}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-80 border-r bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <Link
            to={`/courses/${slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {course.title}
          </Link>
          <div className="space-y-1">
            {allLessons.map((l: any, i: number) => {
              const active = l.slug === lessonSlug;
              const done = completedIds.has(l.id);
              return (
                <Link
                  key={l.id}
                  to={`/courses/${slug}/lessons/${l.slug}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-secondary/20 text-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                      done
                        ? "bg-emerald-100 text-emerald-600"
                        : active
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="truncate">{l.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <BookOpen className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r overflow-y-auto"
            >
              <div className="p-4">
                <Link
                  to={`/courses/${slug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {course.title}
                </Link>
                <div className="space-y-1">
                  {allLessons.map((l: any, i: number) => {
                    const active = l.slug === lessonSlug;
                    const done = completedIds.has(l.id);
                    return (
                      <Link
                        key={l.id}
                        to={`/courses/${slug}/lessons/${l.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? "bg-secondary/20 text-foreground font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                            done
                              ? "bg-emerald-100 text-emerald-600"
                              : active
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Materi {currentIndex + 1} dari {allLessons.length}</span>
              {lesson.durationMinutes && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {lesson.durationMinutes} menit
                  </span>
                </>
              )}
              {isCompleted && (
                <>
                  <span>·</span>
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selesai
                  </Badge>
                </>
              )}
            </div>
          </div>

          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <Separator className="my-10" />

          <div className="flex items-center justify-between gap-4">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link to={`/courses/${slug}/lessons/${prevLesson.slug}`}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Sebelumnya
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {!isCompleted ? (
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Tandai Selesai
                {nextLesson && " & Lanjut"}
              </Button>
            ) : nextLesson ? (
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
                <Link to={`/courses/${slug}/lessons/${nextLesson.slug}`}>
                  Materi Selanjutnya
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
                <Link to={`/courses/${slug}`}>
                  Kembali ke Course
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/courses/${slug}/discussions`}>
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Diskusi
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
