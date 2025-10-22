import express from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { SpotifyTokenRefreshService } from '../services/spotifyTokenRefresh';

const router = express.Router();

// Test endpoint to verify backend is accessible
router.get('/test-callback', (req, res) => {
  res.json({ 
    message: 'Backend is accessible!', 
    timestamp: new Date().toISOString(),
    url: req.originalUrl 
  });
});

// Test endpoint to verify Spotify credentials
router.get('/spotify/test', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const backendUrl = process.env.BACKEND_URL;
  
  res.json({
    spotify_configured: !!clientId && !!clientSecret,
    client_id_present: !!clientId,
    client_secret_present: !!clientSecret,
    backend_url: backendUrl,
    redirect_uri: `${backendUrl || 'http://localhost:3001'}/api/auth/spotify/callback`
  });
});

// Spotify OAuth flow
router.get('/spotify', authenticate, async (req: AuthRequest, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/spotify/callback`;
  
  if (!clientId) {
    return res.status(500).json({ error: 'Spotify client ID not configured' });
  }

  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');

  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Include user ID in state for retrieval in callback
  const state = JSON.stringify({ userId, nonce: uuidv4() });
  
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  
  res.redirect(authUrl.toString());
});

// Spotify OAuth callback
router.get('/spotify/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=spotify_auth_failed`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_code`);
  }

  try {
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/spotify/callback`
      })
    });

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to get access token');
    }

    // Get user info from Spotify
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const spotifyUser = await userResponse.json() as {
      id?: string;
      email?: string;
      display_name?: string;
      images?: Array<{ url: string }>;
    };


    // Extract user ID from state parameter
    let userId: string | undefined;
    try {
      if (state) {
        const stateData = JSON.parse(state as string);
        userId = stateData.userId;
      }
    } catch (error) {
      // Invalid state parameter format
    }

    // Store connection in database
    if (userId && tokenData.access_token && tokenData.refresh_token) {
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);
      
      await db('platform_connections')
        .insert({
          id: db.raw('gen_random_uuid()'),
          user_id: userId,
          platform: 'spotify',
          external_id: spotifyUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          is_active: true
        })
        .onConflict(['user_id', 'platform'])
        .merge({
          external_id: spotifyUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          is_active: true,
          updated_at: db.fn.now()
        });
      
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=spotify`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=spotify_connection_failed&details=${encodeURIComponent(errorMessage)}`);
  }
});

// Get user's platform connections with token status
router.get('/connections', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connections = await db('platform_connections')
      .where({ user_id: userId, is_active: true })
      .select('platform', 'external_id', 'created_at', 'token_expires_at');

    // Add token status for each connection
    const connectionsWithStatus = connections.map(conn => ({
      ...conn,
      tokenValid: new Date(conn.token_expires_at) > new Date(),
      expiresIn: Math.max(0, Math.floor((new Date(conn.token_expires_at).getTime() - Date.now()) / 1000))
    }));

    res.json({ connections: connectionsWithStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Refresh connection tokens manually
router.post('/refresh-tokens', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const spotifyConnections = await db('platform_connections')
      .where({ user_id: userId, platform: 'spotify', is_active: true })
      .select('id');

    const results = [];
    for (const connection of spotifyConnections) {
      const success = await SpotifyTokenRefreshService.refreshToken(connection.id);
      results.push({ connectionId: connection.id, success });
    }

    res.json({ message: 'Token refresh completed', results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
});

// Test actual Spotify API connectivity
router.get('/test-connection', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const accessToken = await SpotifyTokenRefreshService.getValidAccessToken(userId);
    if (!accessToken) {
      return res.json({ 
        connected: false, 
        reason: 'No valid access token found' 
      });
    }

    // Test the token by calling Spotify's user profile API
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const userData = await response.json() as {
        id: string;
        display_name?: string;
        email?: string;
      };
      res.json({ 
        connected: true, 
        spotifyUser: {
          id: userData.id,
          display_name: userData.display_name,
          email: userData.email
        }
      });
    } else {
      // If token is invalid, mark connection as inactive
      if (response.status === 401) {
        await db('platform_connections')
          .where({ user_id: userId, platform: 'spotify' })
          .update({ is_active: false });
      }
      
      res.json({ 
        connected: false, 
        reason: `Spotify API returned ${response.status}` 
      });
    }
  } catch (error) {
    res.json({ 
      connected: false, 
      reason: 'Connection test failed' 
    });
  }
});

export default router;