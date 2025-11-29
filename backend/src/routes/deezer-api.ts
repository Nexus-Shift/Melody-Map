import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { DeezerApiService } from '../services/deezerApiService';

const router = express.Router();

// Get user's Deezer profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await DeezerApiService.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Deezer profile not found or connection invalid' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Failed to fetch Deezer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user's favorite tracks
router.get('/tracks', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const data = await DeezerApiService.getFavoriteTracks(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch favorite tracks' });
    }

    res.json({ tracks: data.data });
  } catch (error) {
    console.error('Failed to fetch Deezer tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Get user's favorite artists
router.get('/artists', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const data = await DeezerApiService.getFavoriteArtists(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch favorite artists' });
    }

    res.json({ artists: data.data });
  } catch (error) {
    console.error('Failed to fetch Deezer artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Get user's favorite albums
router.get('/albums', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const data = await DeezerApiService.getFavoriteAlbums(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch favorite albums' });
    }

    res.json({ albums: data.data });
  } catch (error) {
    console.error('Failed to fetch Deezer albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Get user's playlists
router.get('/playlists', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const data = await DeezerApiService.getUserPlaylists(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch playlists' });
    }

    res.json({ playlists: data.data });
  } catch (error) {
    console.error('Failed to fetch Deezer playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get user's recently played tracks
router.get('/recently-played', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const data = await DeezerApiService.getRecentlyPlayed(userId, limit);
    if (!data) {
      return res.status(404).json({ error: 'Unable to fetch recently played tracks' });
    }

    res.json({ tracks: data.data });
  } catch (error) {
    console.error('Failed to fetch recently played:', error);
    res.status(500).json({ error: 'Failed to fetch recently played' });
  }
});

// Get user's listening statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await DeezerApiService.getListeningStats(userId);
    if (!stats) {
      return res.status(404).json({ error: 'Unable to calculate listening statistics' });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Failed to calculate stats:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

export default router;
