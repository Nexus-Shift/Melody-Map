import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Music, User, Settings as SettingsIcon, LogOut, Bell, Shield, Palette, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weeklyReport: true,
      newFeatures: true,
    },
    privacy: {
      publicProfile: false,
      shareListeningHistory: false,
      allowDataCollection: true,
    },
    preferences: {
      language: "en",
      timezone: "auto",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSettingChange = (
    category: SettingCategory,
    setting: NotificationSetting | PrivacySetting | PreferencesSetting | "theme",
    value: boolean | string
  ) => {
    if (category === SettingCategory.Theme) {
      setTheme(value as 'light' | 'dark' | 'system');
      toast({
        title: "Theme updated",
        description: `Theme changed to ${value}`,
      });
      return;
    }

    if (category === "notifications" || category === "privacy" || category === "preferences") {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value
        }
      }));

      toast({
        title: "Setting updated",
        description: "Your preferences have been saved.",
      });
    } else {
      // Optionally, handle invalid category error
      console.warn(`Invalid settings category: ${category}`);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-none text-left">
                  Melody Map
                </h1>
                <p className="text-sm text-muted-foreground leading-none mt-1 text-left">Settings</p>
              </div>
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.email} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Music className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Manage Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new insights
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly summary of your listening habits
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "weeklyReport", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Learn about new features and updates
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.newFeatures}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "newFeatures", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "publicProfile", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Listening History</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your listening history
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.shareListeningHistory}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "shareListeningHistory", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve our service with usage analytics
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.allowDataCollection}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "allowDataCollection", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Settings */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value) => handleSettingChange("theme", "theme", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language
                  </p>
                </div>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) => handleSettingChange("preferences", "language", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Timezone</Label>
                  <p className="text-sm text-muted-foreground">
                    Set your timezone for accurate timestamps
                  </p>
                </div>
                <Select
                  value={settings.preferences.timezone}
                  onValueChange={(value) => handleSettingChange("preferences", "timezone", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                    <SelectItem value="pst">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
