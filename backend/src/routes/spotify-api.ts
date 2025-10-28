import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { SpotifyApiService } from '../services/spotifyApiService';

const router = express.Router();

// Get user's Spotify profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await SpotifyApiService.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Spotify profile not found or connection invalid' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user's top tracks
router.get('/top-tracks', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = (req.query.time_range as 'short_term' | 'medium_term' | 'long_term') || 'medium_term';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const data = await SpotifyApiService.getTopTracks(userId, timeRange, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch top tracks' });
    }

    res.json({ tracks: data.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get user's top artists
router.get('/top-artists', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = (req.query.time_range as 'short_term' | 'medium_term' | 'long_term') || 'medium_term';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const data = await SpotifyApiService.getTopArtists(userId, timeRange, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch top artists' });
    }

    res.json({ artists: data.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Get user's recently played tracks
router.get('/recently-played', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const data = await SpotifyApiService.getRecentlyPlayed(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch recently played tracks' });
    }

    res.json({ tracks: data.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recently played' });
  }
});

// Get user's current playback
router.get('/current-playback', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const playback = await SpotifyApiService.getCurrentPlayback(userId);
    if (!playback) {
      return res.status(200).json({ isPlaying: false, track: null });
    }

    res.json({
      isPlaying: playback.is_playing,
      track: playback.item,
      progress: playback.progress_ms,
      device: playback.device
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current playback' });
  }
});

// Get user's playlists
router.get('/playlists', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const data = await SpotifyApiService.getUserPlaylists(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch playlists' });
    }

    res.json({ playlists: data.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get user's listening statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await SpotifyApiService.getListeningStats(userId);
    if (!stats) {
      return res.status(404).json({ error: 'Unable to calculate listening statistics' });
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

export default router;