import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, TrendingUp, Headphones, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-music.jpg";

interface HeroSectionProps {
  onGetStartedClick?: () => void;
}

const HeroSection = ({ onGetStartedClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero/80" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <Music className="w-8 h-8 text-electric-purple opacity-60" />
      </div>
      <div className="absolute top-40 right-20 animate-float delay-1000">
        <Headphones className="w-12 h-12 text-neon-blue opacity-40" />
      </div>
      <div className="absolute bottom-32 left-20 animate-float delay-2000">
        <Sparkles className="w-6 h-6 text-electric-pink opacity-50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="max-w-4xl">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 bg-glass-bg/30 backdrop-blur-sm border border-glass-border rounded-full px-4 py-2 mb-8">
            <TrendingUp className="w-4 h-4 text-electric-purple" />
            <span className="text-sm font-medium text-foreground">Music Analytics Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight p-4">
            Melody Map
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Connect your streaming platforms and discover insights about your music taste
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-12 max-w-xl mx-auto">
            Sync your Spotify, Apple Music, and Deezer history to see your top genres, listening patterns, and musical journey
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={onGetStartedClick}
            >
              Get Started Free
            </Button>
          </div>

          {/* Feature Cards Preview */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-gradient-card backdrop-blur-sm border-glass-border p-6 shadow-card hover:shadow-glow transition-smooth">
              <Music className="w-8 h-8 text-electric-purple mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Recent Tracks</h3>
              <p className="text-muted-foreground text-sm">View your recently played songs across all platforms</p>
            </Card>
            
            <Card className="bg-gradient-card backdrop-blur-sm border-glass-border p-6 shadow-card hover:shadow-glow transition-smooth">
              <TrendingUp className="w-8 h-8 text-neon-blue mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Top Genres</h3>
              <p className="text-muted-foreground text-sm">Discover your favorite genres from the past week</p>
            </Card>
            
            <Card className="bg-gradient-card backdrop-blur-sm border-glass-border p-6 shadow-card hover:shadow-glow transition-smooth">
              <Headphones className="w-8 h-8 text-electric-pink mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Listening Time</h3>
              <p className="text-muted-foreground text-sm">Track your total listening hours and habits</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;