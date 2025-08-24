import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../config/database';

const router = express.Router();

// Get user profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const profile = await db('profiles').where('user_id', req.user!.id).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { display_name, avatar_url } = req.body;

    await db('profiles')
      .where('user_id', req.user!.id)
      .update({
        display_name,
        avatar_url,
        updated_at: new Date(),
      });

    const updatedProfile = await db('profiles').where('user_id', req.user!.id).first();
    
    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
