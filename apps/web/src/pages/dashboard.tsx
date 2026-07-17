import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Layers,
  ArrowRight,
  Loader2,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.dashboard.stats,
  });

  const { data: enrolled, isLoading: enrolledLoading } = useQuery({
    queryKey: ["dashboard-enrolled"],
    queryFn: api.dashboard.enrolled,
  });

  if (!session?.user) return null;

  const statCards = [
    {
      label: "Course Diikuti",
      value: stats?.enrolledCourses || 0,
      icon: Layers,
      color: "bg-secondary/20 text-foreground",
    },
    {
      label: "Materi Selesai",
      value: stats?.completedLessons || 0,
      icon: BookOpen,
      color: "bg-accent/20 text-foreground",
    },
    {
      label: "Quiz Dikerjakan",
      value: stats?.quizAttempts || 0,
      icon: HelpCircle,
      color: "bg-warm/20 text-foreground",
    },
    {
      label: "Sertifikat",
      value: stats?.certificates || 0,
      icon: GraduationCap,
      color: "bg-primary/20 text-foreground",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial="initial"
        whileInView="animate" viewport={{ once: false, margin: "-50px" }}
        variants={fadeInUp}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          Halo, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Lanjutkan perjalanan belajar vibe coding Anda.
        </p>
      </motion.div>

      {statsLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="animate" viewport={{ once: false, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial="initial"
        whileInView="animate" viewport={{ once: false, margin: "-50px" }}
        variants={fadeInUp}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-xl font-semibold">Course Saya</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/courses">
            Lihat Semua
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {enrolledLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      ) : enrolled?.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Belum ada course yang diikuti</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mulai belajar dengan memilih course pertama Anda.
            </p>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
              <Link to="/courses">Jelajahi Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="initial"
          whileInView="animate" viewport={{ once: false, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {enrolled?.map((course: any) => (
            <motion.div key={course.id} variants={fadeInUp}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>
                          {course.completedLessons}/{course.totalLessons} materi
                        </span>
                        {course.progress === 100 && (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                            <Trophy className="h-2.5 w-2.5 mr-0.5" />
                            Selesai
                          </Badge>
                        )}
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link to={`/courses/${course.slug}`}>
                      {course.progress === 100 ? "Lihat Course" : "Lanjut Belajar"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
