import express from 'express';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Future routes for music platform integrations
router.get('/platforms', async (req: AuthRequest, res) => {
  res.json({
    platforms: [
      { id: 'spotify', name: 'Spotify', connected: false },
      { id: 'apple_music', name: 'Apple Music', connected: false },
      { id: 'deezer', name: 'Deezer', connected: false },
    ]
  });
});

// Get listening history
router.get('/history', async (req: AuthRequest, res) => {
  // TODO: Implement listening history
  res.json({ tracks: [] });
});

// Get top genres
router.get('/genres', async (req: AuthRequest, res) => {
  // TODO: Implement genre analysis
  res.json({ genres: [] });
});

// Get listening stats
router.get('/stats', async (req: AuthRequest, res) => {
  // TODO: Implement listening stats
  res.json({ 
    total_hours: 0,
    total_tracks: 0,
    total_artists: 0 
  });
});

export default router;
