import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Music, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DashboardPreview from "@/components/DashboardPreview";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
          <Music className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Melody Map
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.email?.split('@')[0]}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-card backdrop-blur-sm border-glass-border">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Your Music Dashboard
            </CardTitle>
            <CardDescription>
              Connect your music platforms to start tracking your listening journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-glass-bg/30 border border-glass-border">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Spotify</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-glass-bg/30 border border-glass-border">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Apple Music</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-glass-bg/30 border border-glass-border">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Deezer</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Preview */}
        <DashboardPreview />
      </main>
    </div>
  );
};

export default Dashboard;