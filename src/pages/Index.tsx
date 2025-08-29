import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-context";
import HeroSection from "@/components/HeroSection";
import AuthSection from "@/components/AuthSection";
import DashboardPreview from "@/components/DashboardPreview";

const Index = () => {
  const authSectionRef = useRef<HTMLElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const scrollToSignup = () => {
    authSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 bg-primary-foreground rounded-full" />
        </div>
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStartedClick={scrollToSignup} />
      <DashboardPreview />
      <AuthSection ref={authSectionRef} />
    </div>
  );
};

export default Index;
