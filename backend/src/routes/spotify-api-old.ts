import express, { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SpotifyApiService } from '../services/spotifyApiService';

const router = express.Router();

// Get user's Spotify data
router.get('/spotify/profile', async (req: Request, res: Response) => {
  try {
    // Get user's Spotify connection
    const connection = await db('platform_connections')
      .where({
        user_id: req.authUser!.id,
        platform: 'spotify',
        is_active: true
      })
      .first();

    if (!connection || !connection.access_token) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    // Check if token is expired and refresh if needed
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      // TODO: Implement token refresh
      return res.status(401).json({ error: 'Token expired, please reconnect' });
    }

    // Fetch user profile from Spotify
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`
      }
    });

    const profile = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch Spotify profile' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Spotify profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's top tracks
router.get('/spotify/top-tracks', async (req: Request, res: Response) => {
  try {
    const { time_range = 'medium_term', limit = 20 } = req.query;

    const connection = await db('platform_connections')
      .where({
        user_id: req.authUser!.id,
        platform: 'spotify',
        is_active: true
      })
      .first();

    if (!connection || !connection.access_token) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch top tracks' });
    }

    res.json(data);

  } catch (error) {
    console.error('Spotify top tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's top artists
router.get('/spotify/top-artists', async (req: Request, res: Response) => {
  try {
    const { time_range = 'medium_term', limit = 20 } = req.query;

    const connection = await db('platform_connections')
      .where({
        user_id: req.authUser!.id,
        platform: 'spotify',
        is_active: true
      })
      .first();

    if (!connection || !connection.access_token) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch top artists' });
    }

    res.json(data);

  } catch (error) {
    console.error('Spotify top artists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recently played tracks
router.get('/spotify/recently-played', async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const connection = await db('platform_connections')
      .where({
        user_id: req.authUser!.id,
        platform: 'spotify',
        is_active: true
      })
      .first();

    if (!connection || !connection.access_token) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch recently played' });
    }

    res.json(data);

  } catch (error) {
    console.error('Spotify recently played error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current playing track
router.get('/spotify/currently-playing', async (req: Request, res: Response) => {
  try {
    const connection = await db('platform_connections')
      .where({
        user_id: req.authUser!.id,
        platform: 'spotify',
        is_active: true
      })
      .first();

    if (!connection || !connection.access_token) {
      return res.status(404).json({ error: 'Spotify not connected' });
    }

    const response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    if (response.status === 204) {
      return res.json({ is_playing: false });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch currently playing' });
    }

    res.json(data);

  } catch (error) {
    console.error('Spotify currently playing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;