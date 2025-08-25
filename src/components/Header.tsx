import React, { useState, useEffect } from 'react';
import { UserMenu } from './UserMenu';
import { AvatarUpload } from './AvatarUpload';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient, Profile } from '@/lib/api';
import { getAvatarFallback } from '@/lib/avatar';

export function Header() {
  const { user } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

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

  const handleUploadSuccess = (avatarUrl: string) => {
    setShowUploadDialog(false);
    // Refresh profile data
    if (user) {
      apiClient.getProfile().then(({ profile }) => setProfile(profile)).catch(() => setProfile(null));
    }
  };

  const fallbackText = user ? getAvatarFallback(profile?.display_name, user.username, user.email) : '';

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Melody Map</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <UserMenu onUploadClick={() => setShowUploadDialog(true)} />
            </div>
          )}
        </div>
      </header>

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
    </>
  );
}
