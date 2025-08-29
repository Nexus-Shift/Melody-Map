import express from 'express';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../utils/cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { db } from '../config/database';

const router = express.Router();

// Upload avatar endpoint
router.post('/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary not configured');
      return res.status(500).json({ error: 'Avatar upload is not configured. Please contact administrator.' });
    }

    // Note: This route expects the upload middleware to be applied in the main server file
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    // Get current user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await db('users').where('id', userId).first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current profile to check for existing avatar
    const existingProfile = await db('profiles').where('user_id', userId).first();
    
    // Delete existing avatar from Cloudinary if it exists
    if (existingProfile?.avatar_url) {
      const publicId = extractPublicIdFromUrl(existingProfile.avatar_url);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(file.buffer, {
      folder: 'melody-map/avatars',
      public_id: `user_${userId}_${Date.now()}`,
    });

    // Update or create profile with new avatar URL
    let profile;
    if (existingProfile) {
      [profile] = await db('profiles')
        .where('user_id', userId)
        .update({ 
          avatar_url: result.secure_url,
          updated_at: new Date()
        })
        .returning('*');
    } else {
      [profile] = await db('profiles')
        .insert({
          user_id: userId,
          avatar_url: result.secure_url,
          display_name: user.username || user.email.split('@')[0],
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: result.secure_url,
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Delete avatar endpoint
router.delete('/avatar', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get current profile
    const profile = await db('profiles').where('user_id', userId).first();
    
    if (!profile?.avatar_url) {
      return res.status(404).json({ error: 'No avatar to delete' });
    }

    // Delete from Cloudinary
    const publicId = extractPublicIdFromUrl(profile.avatar_url);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Update profile to remove avatar URL
    const [updatedProfile] = await db('profiles')
      .where('user_id', userId)
      .update({ 
        avatar_url: null,
        updated_at: new Date()
      })
      .returning('*');

    res.json({
      message: 'Avatar deleted successfully',
      profile: {
        id: updatedProfile.id,
        user_id: updatedProfile.user_id,
        display_name: updatedProfile.display_name,
        avatar_url: updatedProfile.avatar_url,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at
      }
    });

  } catch (error: any) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

export default router;
