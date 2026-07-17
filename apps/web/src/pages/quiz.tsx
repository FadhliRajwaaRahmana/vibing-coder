import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  HelpCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function QuizPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const { data: session } = useSession();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [result, setResult] = useState<any>(null);

  const { data: lessonData } = useQuery({
    queryKey: ["lesson", slug, lessonSlug],
    queryFn: () => api.courses.getLesson(slug!, lessonSlug!),
    enabled: !!slug && !!lessonSlug,
  });

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", lessonData?.lesson?.id],
    queryFn: () => api.quizzes.getByLesson(lessonData!.lesson.id),
    enabled: !!lessonData?.lesson?.id,
  });

  const submitMutation = useMutation({
    mutationFn: () => api.quizzes.submit(quiz!.id, answers),
    onSuccess: (data) => setResult(data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Quiz Tidak Tersedia</h2>
        <p className="text-muted-foreground mb-6">Belum ada quiz untuk materi ini.</p>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <Link to={`/courses/${slug}/lessons/${lessonSlug}`}>Kembali ke Materi</Link>
        </Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQ];
  const progressPercent = result ? 100 : ((currentQ) / questions.length) * 100;

  const selectAnswer = (selectedIndex: number) => {
    const existing = answers.findIndex((a) => a.questionId === currentQuestion.id);
    const newAnswer = { questionId: currentQuestion.id, selectedIndex };
    if (existing >= 0) {
      const updated = [...answers];
      updated[existing] = newAnswer;
      setAnswers(updated);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  const resetQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: false, margin: "-50px" }} variants={fadeIn}>
          <Card className="overflow-hidden">
            <div
              className={`p-8 text-center text-white ${
                result.passed ? "bg-emerald-600" : "bg-amber-600"
              }`}
            >
              {result.passed ? (
                <Trophy className="h-14 w-14 mx-auto mb-3" />
              ) : (
                <RotateCcw className="h-14 w-14 mx-auto mb-3" />
              )}
              <h2 className="text-2xl font-bold mb-1">
                {result.passed ? "Selamat! Anda Lulus!" : "Belum Lulus"}
              </h2>
              <p className="text-white/80">
                Score Anda: <span className="font-bold text-2xl">{result.score}%</span>
              </p>
              <p className="text-white/60 text-sm mt-1">
                Passing score: {quiz.passingScore}%
              </p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                {result.results?.map((r: any, i: number) => {
                  const q = questions[i];
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        r.correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {r.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{q?.question}</p>
                      </div>
                      {r.explanation && (
                        <p className="text-xs text-muted-foreground ml-7">{r.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetQuiz} className="flex-1">
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Coba Lagi
                </Button>
                <Button asChild className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                  <Link to={`/courses/${slug}/lessons/${lessonSlug}`}>Kembali ke Materi</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link
        to={`/courses/${slug}/lessons/${lessonSlug}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Materi
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">{quiz.title}</h1>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-muted-foreground">
            Pertanyaan {currentQ + 1} dari {questions.length}
          </span>
          <Badge variant="outline">Passing score: {quiz.passingScore}%</Badge>
        </div>
        <Progress value={progressPercent} />
      </div>

      <motion.div key={currentQ} initial="initial" whileInView="animate" viewport={{ once: false, margin: "-50px" }} variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion?.options?.map((opt: any, i: number) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.selectedIndex === i
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/30 hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      currentAnswer?.selectedIndex === i
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </div>
              </button>
            ))}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
              >
                Sebelumnya
              </Button>

              {currentQ < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  disabled={!currentAnswer}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={answers.length < questions.length || submitMutation.isPending}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : null}
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
