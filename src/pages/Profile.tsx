import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Music, User, Settings, LogOut, Save, Upload, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiClient, Profile as ProfileData } from "@/lib/api";
import { getDisplayAvatarUrl, getAvatarFallback } from "@/lib/avatar";
import DefaultAvatar from "@/components/DefaultAvatar";

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    avatar: "",
  });
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          setFormData({
            displayName: profile.display_name || user.displayName || user.username || user.email?.split('@')[0] || "",
            username: user.username || "",
            bio: "",
            avatar: profile.avatar_url || "",
          });
        } catch (error) {
          console.log('Profile not found, using user data:', error);
          setFormData({
            displayName: user.displayName || user.username || user.email?.split('@')[0] || "",
            username: user.username || "",
            bio: "",
            avatar: "",
          });
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalAvatarUrl = formData.avatar;

      // If there's a pending avatar change, handle it
      if (pendingAvatarUrl !== null) {
        if (pendingAvatarUrl === "") {
          // User wants to remove avatar - call delete endpoint
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          
          const deleteResponse = await fetch(`${API_BASE_URL}/upload/avatar`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.error || 'Failed to delete avatar');
          }

          finalAvatarUrl = "";
        } else if (pendingAvatarUrl.startsWith("data:")) {
          // User uploaded a new avatar - need to upload to server
          const response = await fetch(pendingAvatarUrl);
          const blob = await response.blob();
          
          const formData = new FormData();
          formData.append('avatar', blob, 'avatar.jpg');

          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          
          const uploadResponse = await fetch(`${API_BASE_URL}/upload/avatar`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (!uploadResponse.ok) {
            let errorMessage = 'Upload failed';
            try {
              const errorData = await uploadResponse.json();
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              const errorText = await uploadResponse.text();
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const uploadData = await uploadResponse.json();
          finalAvatarUrl = uploadData.avatar_url;
        } else {
          // Already a valid URL
          finalAvatarUrl = pendingAvatarUrl;
        }
      }

      const { user: updatedUser } = await apiClient.updateProfile({
        display_name: formData.displayName,
        avatar_url: finalAvatarUrl || undefined,
      });

      // Refresh profile data
      const { profile: updatedProfile } = await apiClient.getProfile();
      setProfile(updatedProfile);
      
      // Update form data with saved values
      setFormData({
        displayName: updatedProfile.display_name || updatedUser.displayName || updatedUser.username || updatedUser.email?.split('@')[0] || "",
        username: updatedUser.username || "",
        bio: "",
        avatar: updatedProfile.avatar_url || "",
      });

      setPendingAvatarUrl(null);
      setHasUnsavedChanges(false);
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setPendingAvatarUrl(avatarUrl);
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingAvatarUrl(null);
    setHasUnsavedChanges(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        displayName: profile.display_name || user?.displayName || user?.username || user?.email?.split('@')[0] || "",
        username: user?.username || "",
        bio: "",
        avatar: profile.avatar_url || "",
      });
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
                <p className="text-sm text-muted-foreground leading-none mt-1 text-left">Profile Settings</p>
              </div>
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {(() => {
                    const avatarUrl = getDisplayAvatarUrl(profile?.avatar_url, user.email || "", 32, true);
                    
                    if (avatarUrl) {
                      return <AvatarImage src={avatarUrl} alt={user.email} />;
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <DefaultAvatar size={32} />
                        </div>
                      );
                    }
                  })()}
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {getAvatarFallback(profile?.display_name, user.username, user.email || "")}
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
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Music className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-gradient-card backdrop-blur-sm border-glass-border">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className={`w-32 h-32 border-4 border-glass-border ${pendingAvatarUrl === "" ? "opacity-50" : ""}`}>
                    {(() => {
                      // Show pending avatar if there's a change, otherwise show current avatar
                      let currentAvatarUrl;
                      if (pendingAvatarUrl !== null) {
                        // User has made a change (upload or remove)
                        currentAvatarUrl = pendingAvatarUrl;
                      } else {
                        // No pending change, show current avatar
                        currentAvatarUrl = profile?.avatar_url;
                      }
                      
                      if (currentAvatarUrl && currentAvatarUrl !== "") {
                        return <AvatarImage src={currentAvatarUrl} alt="Profile picture" />;
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <DefaultAvatar size={128} />
                          </div>
                        );
                      }
                    })()}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {getAvatarFallback(
                        profile?.display_name,
                        user?.username,
                        user?.email || ""
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Removal indicator */}
                  {pendingAvatarUrl === "" && (
                    <div className="absolute inset-0 bg-red-500/20 rounded-full flex items-center justify-center">
                      <div className="bg-red-500 text-white rounded-full p-2">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload overlay - only show when editing */}
                  {isEditing && pendingAvatarUrl !== "" && (
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Upload controls - only show when editing */}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="bg-glass-bg/50 border-glass-border"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    
                    {/* Show remove button if there's currently an avatar (either pending or existing) */}
                    {((pendingAvatarUrl !== null && pendingAvatarUrl !== "") || (pendingAvatarUrl === null && profile?.avatar_url)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAvatarChange("")}
                        className="bg-glass-bg/50 border-glass-border text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                )}

                {isEditing && pendingAvatarUrl === "" && (
                  <p className="text-xs text-red-500 text-center max-w-xs">
                    Avatar will be removed when you save changes
                  </p>
                )}

                {isEditing && pendingAvatarUrl !== "" && (
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    Upload a new profile picture. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </p>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      toast({
                        title: "Invalid file type",
                        description: "Please select an image file",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please select an image smaller than 5MB",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Create preview URL for immediate display
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result as string;
                      handleAvatarChange(result);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  disabled
                  className="bg-muted"
                  placeholder="Enter your username"
                />
                <p className="text-xs text-muted-foreground">
                  Your username cannot be changed after registration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  {hasUnsavedChanges && (
                    <p className="text-xs text-muted-foreground self-center ml-2">
                      You have unsaved changes
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
