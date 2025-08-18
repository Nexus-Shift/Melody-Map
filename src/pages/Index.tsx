import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import AuthSection from "@/components/AuthSection";
import DashboardPreview from "@/components/DashboardPreview";

const Index = () => {
  const authSectionRef = useRef<HTMLElement>(null);

  const scrollToSignup = () => {
    authSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStartedClick={scrollToSignup} />
      <DashboardPreview />
      <AuthSection ref={authSectionRef} />
    </div>
  );
};

export default Index;
