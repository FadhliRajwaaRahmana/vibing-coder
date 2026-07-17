import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CheckCircle2, Loader2, XCircle, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function VerifyCertificatePage() {
  const { certNumber } = useParams<{ certNumber: string }>();

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ["verify-cert", certNumber],
    queryFn: () => api.certificates.verify(certNumber!),
    enabled: !!certNumber,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg">
      <motion.div initial="initial" whileInView="animate" viewport={{ once: false, margin: "-50px" }} variants={fadeIn}>
        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Sertifikat Tidak Ditemukan</h2>
              <p className="text-muted-foreground">
                Nomor sertifikat "{certNumber}" tidak valid atau tidak ditemukan dalam sistem.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="bg-foreground p-8 text-center text-background">
              <GraduationCap className="h-12 w-12 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-1">Sertifikat Terverifikasi</h2>
              <Badge className="bg-secondary text-secondary-foreground border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Diberikan kepada</p>
                <h3 className="text-xl font-bold">{cert.userName}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-medium">{cert.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Sertifikat</span>
                  <span className="font-mono">{cert.certificateNumber}</span>
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
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
