import { Link } from "react-router-dom";
import { Code2, Github, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function Footer() {
  return (
    <motion.footer
      initial="initial"
      whileInView="animate"
      viewport={{ once: false, margin: "-50px" }}
      variants={fadeInUp}
      className="bg-foreground text-background/80"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-background">
                Vibing<span className="text-secondary">Coder</span>
              </span>
            </Link>
            <p className="text-sm text-background/60 max-w-sm mb-4">
              Platform belajar vibe coding gratis. Pelajari cara membangun aplikasi
              modern dengan bantuan AI assistant.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-background">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses" className="hover:text-background transition-colors">
                  Semua Course
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-background transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/certificates" className="hover:text-background transition-colors">
                  Sertifikat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-background">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Kontak
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} VibingCoder. Dibuat dengan semangat vibe coding.</p>
        </div>
      </div>
    </motion.footer>
  );
}
