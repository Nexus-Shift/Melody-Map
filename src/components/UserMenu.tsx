import React, { useEffect, useState } from 'react';
import { User, LogOut, Settings, Upload, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/auth-context';
import { getDisplayAvatarUrl, getAvatarFallback } from '@/lib/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiClient, Profile } from '@/lib/api';

interface UserMenuProps {
  onUploadClick?: () => void;
}

export function UserMenu({ onUploadClick }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { profile } = await apiClient.getProfile();
          setProfile(profile);
        } catch (error) {
          // Profile might not exist yet
          console.log('Profile not found:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return null;
  }

  const avatarUrl = getDisplayAvatarUrl(profile?.avatar_url, user.email);
  const fallbackText = getAvatarFallback(profile?.display_name, user.username, user.email);

  const handleRemoveAvatar = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove avatar';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed successfully",
      });

      // Refresh profile data
      try {
        const { profile: updatedProfile } = await apiClient.getProfile();
        setProfile(updatedProfile);
      } catch (error) {
        // Profile might not exist anymore
        setProfile(null);
      }
      
    } catch (error: any) {
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove avatar",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={user.displayName || user.email} />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.display_name || user.displayName || user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          <span>Upload Picture</span>
        </DropdownMenuItem>
        {profile?.avatar_url && (
          <DropdownMenuItem onClick={handleRemoveAvatar}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Remove Picture</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
