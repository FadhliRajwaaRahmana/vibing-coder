import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { GraduationCap, Loader2, ExternalLink, Award } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function CertificatesPage() {
  const { data: session } = useSession();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: api.certificates.getMy,
    enabled: !!session?.user,
  });

  if (!session?.user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial="initial" whileInView="animate" viewport={{ once: false, margin: "-50px" }} variants={fadeInUp} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-secondary" />
          Sertifikat Saya
        </h1>
        <p className="text-muted-foreground">
          Koleksi sertifikat dari course yang telah Anda selesaikan.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      ) : certificates?.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Belum ada sertifikat</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Selesaikan semua materi dalam sebuah course untuk mendapatkan sertifikat.
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {certificates?.map((cert: any) => (
            <motion.div key={cert.id} variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="bg-foreground p-6 text-background">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-sm font-medium opacity-80">VibingCoder</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Sertifikat Penyelesaian</h3>
                  <p className="text-background/70 text-sm">{cert.courseTitle}</p>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nomor Sertifikat</span>
                      <span className="font-mono font-medium">{cert.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Terbit</span>
                      <span>
                        {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/certificates/verify/${cert.certificateNumber}`}>
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Verifikasi Sertifikat
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
