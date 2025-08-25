import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  fallbackText: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onDeleteSuccess?: () => void;
  className?: string;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  fallbackText,
  onUploadSuccess,
  onDeleteSuccess,
  className
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Try to parse as JSON, but handle cases where it's not JSON
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, get text content
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });

      onUploadSuccess?.(data.avatar_url);
      setPreviewUrl(null);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteAvatar = async () => {
    if (!currentAvatarUrl) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });

      onDeleteSuccess?.();
      
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete avatar",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <Avatar className="w-32 h-32 border-4 border-glass-border">
          <AvatarImage src={displayUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        
        {/* Loading overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="bg-glass-bg/50 border-glass-border"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
        
        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAvatar}
            disabled={isUploading || isDeleting}
            className="bg-glass-bg/50 border-glass-border text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4 mr-2" />
            {isDeleting ? 'Removing...' : 'Remove'}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Click upload to change your profile picture. Supported formats: JPG, PNG, GIF. Max size: 5MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
