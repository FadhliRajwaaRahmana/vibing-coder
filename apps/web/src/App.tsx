import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth";
import LenisProvider from "@/components/smooth-scroll";
import { useEffect } from "react";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import CoursesPage from "@/pages/courses";
import CourseDetailPage from "@/pages/course-detail";
import LessonPage from "@/pages/lesson";
import DashboardPage from "@/pages/dashboard";
import DiscussionsPage from "@/pages/discussions";
import QuizPage from "@/pages/quiz";
import CertificatesPage from "@/pages/certificates";
import VerifyCertificatePage from "@/pages/verify-certificate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  if (isPending) return null;
  if (!session?.user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children, hideFooter }: { children: React.ReactNode; hideFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
        <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
        <Route path="/register" element={<AppLayout><RegisterPage /></AppLayout>} />
        <Route path="/courses" element={<AppLayout><CoursesPage /></AppLayout>} />
        <Route path="/courses/:slug" element={<AppLayout><CourseDetailPage /></AppLayout>} />
        <Route
          path="/courses/:slug/lessons/:lessonSlug"
          element={<AppLayout hideFooter><LessonPage /></AppLayout>}
        />
        <Route path="/courses/:slug/discussions" element={<AppLayout><DiscussionsPage /></AppLayout>} />
        <Route
          path="/courses/:slug/lessons/:lessonSlug/quiz"
          element={<AppLayout><QuizPage /></AppLayout>}
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/dashboard/certificates"
          element={
            <AppLayout>
              <ProtectedRoute><CertificatesPage /></ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/certificates/verify/:certNumber"
          element={<AppLayout><VerifyCertificatePage /></AppLayout>}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LenisProvider>
          <AppRoutes />
        </LenisProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
