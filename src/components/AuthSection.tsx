import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";

const AuthSection = forwardRef<HTMLElement>((props, ref) => {
  const navigate = useNavigate();

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="bg-gradient-card backdrop-blur-sm border-glass-border shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Join Melody Map
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create your account to start tracking your music journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Get Started
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Coming Soon</span>
              </div>
            </div>

            {/* Platform Connections (Preview) */}
            <div className="space-y-3">
              <Button variant="glass" className="w-full justify-start" disabled>
                <div className="w-5 h-5 bg-green-500 rounded-full mr-3" />
                Connect Spotify
                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
              </Button>
              
              <Button variant="glass" className="w-full justify-start" disabled>
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3" />
                Connect Apple Music
                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
              </Button>
              
              <Button variant="glass" className="w-full justify-start" disabled>
                <div className="w-5 h-5 bg-orange-500 rounded-full mr-3" />
                Connect Deezer
                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth?tab=signin")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
});

AuthSection.displayName = "AuthSection";

export default AuthSection;