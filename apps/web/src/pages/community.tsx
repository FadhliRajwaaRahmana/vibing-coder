import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import {
  MessageSquare,
  ThumbsUp,
  Loader2,
  Send,
  Search,
  TrendingUp,
  Clock,
  Filter,
  Plus,
  X,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} minggu lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCourseId, setNewCourseId] = useState("");

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: api.courses.list,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["community-discussions", sort, courseFilter, page],
    queryFn: () =>
      api.discussions.list({
        sort,
        courseId: courseFilter || undefined,
        page,
        limit: 15,
        userId: session?.user?.id,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      courseId: string;
      title?: string;
      content: string;
    }) => api.discussions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-discussions"] });
      setNewTitle("");
      setNewContent("");
      setNewCourseId("");
      setShowCreateForm(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: (id: string) => api.discussions.vote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["community-discussions"],
      });
      const prev = queryClient.getQueryData(["community-discussions", sort, courseFilter, page]);
      queryClient.setQueryData(
        ["community-discussions", sort, courseFilter, page],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p: any) =>
              p.id === id
                ? {
                    ...p,
                    hasVoted: !p.hasVoted,
                    voteCount: p.hasVoted
                      ? p.voteCount - 1
                      : p.voteCount + 1,
                  }
                : p
            ),
          };
        }
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          ["community-discussions", sort, courseFilter, page],
          context.prev
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community-discussions"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newCourseId) return;
    createMutation.mutate({
      courseId: newCourseId,
      title: newTitle.trim() || undefined,
      content: newContent.trim(),
    });
  };

  const filteredPosts = data?.posts?.filter((p: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/10 via-accent/5 to-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full bg-secondary/15 border border-secondary/20 px-4 py-1.5 text-sm font-medium text-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              Forum Komunitas
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            >
              Diskusi &{" "}
              <span className="text-secondary">Berbagi</span>{" "}
              Bersama
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto"
            >
              Tempat para vibe coders bertanya, berbagi insight, dan saling
              membantu. Semua diskusi terbuka untuk semua orang.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Action Bar */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari diskusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>

          {/* Create Button */}
          {session?.user && (
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
              }}
              className="bg-foreground text-background hover:bg-foreground/90 gap-2 h-10 rounded-xl shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Tulis Diskusi</span>
            </Button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8"
        >
          {/* Sort Tabs */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border">
            <button
              onClick={() => {
                setSort("newest");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                sort === "newest"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Terbaru
            </button>
            <button
              onClick={() => {
                setSort("popular");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                sort === "popular"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Populer
            </button>
          </div>

          {/* Course Filter */}
          <div className="relative flex-1 sm:max-w-[220px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-8 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Semua Course</option>
              {courses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          {data && (
            <div className="text-xs text-muted-foreground sm:ml-auto">
              {data.pagination.total} diskusi
            </div>
          )}
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="border-secondary/30 shadow-lg shadow-secondary/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-secondary" />
                      Diskusi Baru
                    </h3>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-3">
                    <select
                      value={newCourseId}
                      onChange={(e) => setNewCourseId(e.target.value)}
                      required
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Pilih Course *</option>
                      {courses?.map((course: any) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Judul diskusi (opsional)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      maxLength={255}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    <textarea
                      placeholder="Tulis pertanyaan, insight, atau apa saja... *"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        * Wajib diisi
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCreateForm(false)}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            createMutation.isPending ||
                            !newContent.trim() ||
                            !newCourseId
                          }
                          className="bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Kirim
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login CTA */}
        {!session?.user && (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <Card className="mb-8 border-secondary/20 bg-secondary/5">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-secondary mx-auto mb-3" />
                <p className="font-medium mb-1">Mau ikut diskusi?</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Login untuk membuat diskusi dan vote
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">Masuk</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Link to="/register">Daftar Gratis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Discussion List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts?.length === 0 ? (
          <motion.div
            initial="initial"
            animate="animate"
            variants={scaleIn}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Belum ada diskusi</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Jadilah yang pertama memulai diskusi!"}
            </p>
            {session?.user && !searchQuery && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-foreground text-background hover:bg-foreground/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Mulai Diskusi
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-3"
            >
              {filteredPosts?.map((post: any) => (
                <DiscussionCard
                  key={post.id}
                  post={post}
                  isLoggedIn={!!session?.user}
                  onVote={() => voteMutation.mutate(post.id)}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex items-center justify-center gap-2 mt-8"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, data.pagination.totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      const total = data.pagination.totalPages;
                      if (total <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= total - 2) {
                        pageNum = total - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
                            pageNum === page
                              ? "bg-foreground text-background shadow-sm"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.pagination.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Loading indicator for refetch */}
        {isFetching && !isLoading && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm shadow-lg">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat...
            </div>
          </div>
        )}
      </div>

      {/* Floating Create Button - Mobile */}
      {session?.user && !showCreateForm && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          onClick={() => {
            setShowCreateForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 z-40 sm:hidden h-14 w-14 rounded-2xl bg-foreground text-background shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
}

function DiscussionCard({
  post,
  isLoggedIn,
  onVote,
}: {
  post: any;
  isLoggedIn: boolean;
  onVote: () => void;
}) {
  const contentPreview =
    post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="group hover:shadow-md hover:border-secondary/20 transition-all duration-300">
        <CardContent className="p-4 md:p-5">
          <div className="flex gap-3">
            {/* Vote Column */}
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.preventDefault();
                  if (isLoggedIn) onVote();
                }}
                disabled={!isLoggedIn}
                className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all ${
                  post.hasVoted
                    ? "bg-secondary/20 text-secondary"
                    : isLoggedIn
                      ? "hover:bg-muted text-muted-foreground hover:text-secondary"
                      : "text-muted-foreground/40 cursor-default"
                }`}
                title={isLoggedIn ? "Vote" : "Login untuk vote"}
              >
                <ThumbsUp
                  className={`h-4 w-4 transition-transform ${post.hasVoted ? "scale-110" : ""}`}
                  fill={post.hasVoted ? "currentColor" : "none"}
                />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.span
                  key={post.voteCount}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`text-xs font-semibold tabular-nums ${
                    post.hasVoted ? "text-secondary" : "text-muted-foreground"
                  }`}
                >
                  {post.voteCount}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-accent/20 text-foreground text-xs font-semibold">
                      {post.userName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {post.userName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>

              {post.title && (
                <h3 className="font-semibold text-sm md:text-base mb-1.5 line-clamp-2 group-hover:text-secondary transition-colors">
                  {post.title}
                </h3>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap mb-3">
                {contentPreview}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3 flex-wrap">
                {post.courseTitle && (
                  <Link to={`/courses/${post.courseSlug}`}>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {post.courseTitle}
                    </Badge>
                  </Link>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post.replyCount} balasan</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
