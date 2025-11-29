import express from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get Deezer connection status
router.get('/deezer/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connection = await db('platform_connections')
      .where({ user_id: userId, platform: 'deezer' })
      .first();

    if (!connection) {
      return res.json({
        connected: false,
        message: 'Deezer not connected'
      });
    }

    res.json({
      connected: true,
      isActive: connection.is_active,
      externalId: connection.external_id,
      lastUpdated: connection.updated_at,
      connectedAt: connection.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check Deezer status' });
  }
});

// Deezer OAuth flow
router.get('/deezer', authenticate, async (req: AuthRequest, res) => {
  const appId = process.env.DEEZER_APP_ID;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/deezer/callback`;
  
  if (!appId || appId === 'YOUR_DEEZER_APP_ID_HERE') {
    return res.status(500).json({ 
      error: 'Deezer app ID not configured',
      message: 'Please add your Deezer credentials to the .env file. Get them from: https://developers.deezer.com/myapps'
    });
  }

  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Deezer uses a simpler OAuth flow - state parameter for user tracking
  const state = JSON.stringify({ userId, nonce: uuidv4() });
  
  // Deezer required permissions
  const perms = [
    'basic_access',
    'email',
    'offline_access',
    'manage_library',
    'listening_history'
  ].join(',');

  const authUrl = new URL('https://connect.deezer.com/oauth/auth.php');
  authUrl.searchParams.set('app_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('perms', perms);
  authUrl.searchParams.set('state', state);
  
  res.redirect(authUrl.toString());
});

// Deezer OAuth callback
router.get('/deezer/callback', async (req, res) => {
  const { code, error_reason, state } = req.query;

  if (error_reason) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=deezer_auth_failed&reason=${error_reason}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_code`);
  }

  try {
    const appId = process.env.DEEZER_APP_ID;
    const secret = process.env.DEEZER_SECRET;
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/deezer/callback`;

    // Exchange code for access token
    const tokenUrl = new URL('https://connect.deezer.com/oauth/access_token.php');
    tokenUrl.searchParams.set('app_id', appId!);
    tokenUrl.searchParams.set('secret', secret!);
    tokenUrl.searchParams.set('code', code as string);
    tokenUrl.searchParams.set('output', 'json');

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenText = await tokenResponse.text();
    
    // Deezer returns URL-encoded string or JSON
    let accessToken: string;
    try {
      const tokenData = JSON.parse(tokenText) as { access_token?: string; error?: string };
      if (tokenData.error) {
        throw new Error(tokenData.error);
      }
      accessToken = tokenData.access_token!;
    } catch {
      // Parse as URL parameters
      const params = new URLSearchParams(tokenText);
      const token = params.get('access_token');
      if (!token) {
        throw new Error('No access token received from Deezer');
      }
      accessToken = token;
    }

    // Get user info from Deezer
    const userResponse = await fetch(`https://api.deezer.com/user/me?access_token=${accessToken}`);
    const deezerUser = await userResponse.json() as {
      id?: number;
      name?: string;
      email?: string;
      picture?: string;
      error?: { type: string; message: string };
    };

    if (deezerUser.error) {
      throw new Error(deezerUser.error.message || 'Failed to get Deezer user info');
    }

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
    if (userId && accessToken && deezerUser.id) {
      // Deezer tokens don't expire, so we set a far future date
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      
      // Check if connection exists
      const existingConnection = await db('platform_connections')
        .where({ user_id: userId, platform: 'deezer' })
        .first();

      if (existingConnection) {
        // Update existing connection
        await db('platform_connections')
          .where({ user_id: userId, platform: 'deezer' })
          .update({
            external_id: deezerUser.id.toString(),
            access_token: accessToken,
            refresh_token: null, // Deezer doesn't use refresh tokens
            token_expires_at: expiresAt,
            is_active: true,
            updated_at: new Date()
          });
      } else {
        // Insert new connection
        await db('platform_connections').insert({
          id: uuidv4(),
          user_id: userId,
          platform: 'deezer',
          external_id: deezerUser.id.toString(),
          access_token: accessToken,
          refresh_token: null, // Deezer doesn't use refresh tokens
          token_expires_at: expiresAt,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      console.log(`Deezer connected for user ${userId}`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=deezer`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Deezer connection error:', errorMessage);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=deezer_connection_failed&details=${encodeURIComponent(errorMessage)}`);
  }
});

// Test Deezer connection
router.get('/test-deezer-connection', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connection = await db('platform_connections')
      .where({ user_id: userId, platform: 'deezer', is_active: true })
      .first();

    if (!connection) {
      return res.json({ 
        connected: false, 
        reason: 'No active Deezer connection found' 
      });
    }

    // Test the token by calling Deezer's user profile API
    const response = await fetch(`https://api.deezer.com/user/me?access_token=${connection.access_token}`);
    const userData = await response.json() as {
      id?: number;
      name?: string;
      error?: { type: string; message: string };
    };

    if (userData.error) {
      // Mark connection as inactive
      await db('platform_connections')
        .where({ user_id: userId, platform: 'deezer' })
        .update({ 
          is_active: false,
          updated_at: new Date()
        });
      
      return res.json({ 
        connected: false, 
        reason: userData.error.message || 'Invalid token'
      });
    }

    res.json({ 
      connected: true, 
      deezerUser: {
        id: userData.id,
        name: userData.name
      }
    });
  } catch (error) {
    console.error('Deezer connection test failed:', error);
    res.json({ 
      connected: false, 
      reason: 'Connection test failed' 
    });
  }
});

// Disconnect Deezer
router.post('/deezer/disconnect', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await db('platform_connections')
      .where({ user_id: userId, platform: 'deezer' })
      .update({ 
        is_active: false,
        updated_at: new Date()
      });

    if (result > 0) {
      res.json({ 
        message: 'Deezer disconnected successfully',
        success: true
      });
    } else {
      res.status(404).json({ 
        error: 'No Deezer connection found',
        success: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Deezer' });
  }
});

export default router;
