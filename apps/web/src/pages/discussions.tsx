import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function DiscussionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: course } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.courses.get(slug!),
    enabled: !!slug,
  });

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions", course?.id],
    queryFn: () => api.discussions.getByCourse(course!.id),
    enabled: !!course?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      api.discussions.create({ courseId: course!.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", course?.id] });
      setContent("");
      setReplyContent("");
      setReplyTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.discussions.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", course?.id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ content: content.trim() });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    createMutation.mutate({ content: replyContent.trim(), parentId });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        to={`/courses/${slug}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke {course?.title || "Course"}
      </Link>

      <motion.div initial="initial" whileInView="animate" viewport={{ once: false, margin: "-50px" }} variants={fadeInUp}>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-secondary" />
          Diskusi
        </h1>
        <p className="text-muted-foreground mb-8">
          Tanya, jawab, dan berdiskusi tentang materi di course ini.
        </p>
      </motion.div>

      {session?.user ? (
        <Card className="mb-8">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                placeholder="Tulis pertanyaan atau komentar..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || !content.trim()} size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  {createMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 h-4 w-4" />
                  )}
                  Kirim
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-3">Login untuk ikut berdiskusi</p>
            <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              <Link to="/login">Masuk</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      ) : discussions?.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada diskusi. Jadilah yang pertama!</p>
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="animate" viewport={{ once: false, margin: "-50px" }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {discussions?.map((post: any) => (
            <motion.div key={post.id} variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary/20 text-foreground text-xs">
                        {post.userName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                      <div className="flex items-center gap-2 mt-2">
                        {session?.user && (
                          <button
                            onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                            className="text-xs text-muted-foreground hover:text-secondary transition-colors"
                          >
                            Balas
                          </button>
                        )}
                        {session?.user?.id === post.userId && (
                          <button
                            onClick={() => deleteMutation.mutate(post.id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      {replyTo === post.id && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Tulis balasan..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleReply(post.id);
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleReply(post.id)}
                            disabled={createMutation.isPending}
                            className="bg-foreground text-background hover:bg-foreground/90"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}

                      {post.replies?.length > 0 && (
                        <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
                          {post.replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-secondary/20 text-foreground text-[10px]">
                                  {reply.userName?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-xs">{reply.userName}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
