import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { BookOpen, Clock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const difficultyConfig = {
  beginner: { label: "Pemula", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  intermediate: { label: "Menengah", color: "bg-secondary/20 text-secondary-foreground border-secondary/30" },
  advanced: { label: "Lanjutan", color: "bg-warm/20 text-foreground border-warm/30" },
};

export default function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: api.courses.list,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial="initial"
        whileInView="animate" viewport={{ once: false, margin: "-50px" }}
        variants={fadeInUp}
        className="max-w-3xl mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Semua Course</h1>
        <p className="text-muted-foreground text-lg">
          Pilih course dan mulai perjalanan vibe coding Anda. Semua materi 100% gratis.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="animate" viewport={{ once: false, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses?.map((course: any) => {
            const diff = difficultyConfig[course.difficulty as keyof typeof difficultyConfig] || difficultyConfig.beginner;
            return (
              <motion.div key={course.id} variants={fadeInUp}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`${diff.color} border`}>{diff.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessonCount} Materi
                      </span>
                      {course.estimatedHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.estimatedHours} Jam
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button variant="outline" className="w-full group/btn" asChild>
                      <Link to={`/courses/${course.slug}`}>
                        Lihat Course
                        <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
