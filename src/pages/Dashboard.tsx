import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Music, TrendingUp, Clock, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import DashboardPreview from "@/components/DashboardPreview";
import { getDisplayAvatarUrl, getAvatarFallback } from "@/lib/avatar";
import { apiClient, Profile } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import DefaultAvatar from "@/components/DefaultAvatar";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { profile } = await apiClient.getProfile();
          setProfile(profile);
        } catch (error) {
          console.log('Profile not found:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleUploadSuccess = (avatarUrl: string) => {
    setShowUploadDialog(false);
    // Refresh profile data
    if (user) {
      apiClient.getProfile().then(({ profile }) => setProfile(profile)).catch(() => setProfile(null));
    }
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

  const avatarUrl = getDisplayAvatarUrl(profile?.avatar_url, user.email, 32, true);
  const fallbackText = getAvatarFallback(profile?.display_name, user.username, user.email);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-none text-left py-1">
                Melody Map
              </h1>
              <p className="text-sm text-muted-foreground leading-none mt-1 text-left">
                Welcome back, {user.displayName || user.username || user.email?.split('@')[0]}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? (
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={user.email} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DefaultAvatar size={32} />
                      </div>
                    )}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {fallbackText}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || user.displayName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Manage Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
          </DialogHeader>
          <AvatarUpload 
            currentAvatarUrl={profile?.avatar_url}
            fallbackText={fallbackText}
            onUploadSuccess={handleUploadSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;