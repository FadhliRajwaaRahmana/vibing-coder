import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUp } from "@/lib/auth";
import { Code2, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Mengandung huruf", valid: /[a-zA-Z]/.test(password) },
    { label: "Mengandung angka", valid: /[0-9]/.test(password) },
  ];

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Nama wajib diisi";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        const msg = result.error.message || "Registrasi gagal";
        toast.error("Registrasi Gagal", { description: msg });
      } else {
        toast.success("Akun Berhasil Dibuat!", {
          description: "Selamat datang di VibingCoder",
        });
        navigate("/dashboard");
      }
    } catch {
      toast.error("Terjadi Kesalahan", {
        description: "Tidak dapat terhubung ke server. Coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, margin: "-50px" }}
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
              <Code2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Vibing<span className="text-secondary">Coder</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
            <CardDescription>
              Daftar gratis dan mulai belajar vibe coding
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="name"
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="email"
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Buat password kuat"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1 pt-1"
                  >
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        {check.valid ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground/40" />
                        )}
                        <span
                          className={
                            check.valid
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-secondary font-medium hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
