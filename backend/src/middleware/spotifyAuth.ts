import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { SpotifyTokenRefreshService } from '../services/spotifyTokenRefresh';

/**
 * Middleware to ensure valid Spotify token before API calls
 * Automatically refreshes expired tokens
 */
export const ensureSpotifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authUser?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get valid access token (will auto-refresh if needed)
    const accessToken = await SpotifyTokenRefreshService.getValidAccessToken(userId);

    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Spotify not connected or token expired. Please reconnect your Spotify account.',
        code: 'SPOTIFY_NOT_CONNECTED',
        action: 'reconnect'
      });
    }

    // Attach token to request for use in route handlers
    req.spotifyAccessToken = accessToken;
    
    next();
  } catch (error) {
    console.error('Error in ensureSpotifyToken middleware:', error);
    return res.status(500).json({ 
      error: 'Failed to validate Spotify connection',
      code: 'TOKEN_VALIDATION_ERROR'
    });
  }
};

// Extend AuthRequest type to include spotify token
declare global {
  namespace Express {
    interface Request {
      spotifyAccessToken?: string;
    }
  }
}

export interface SpotifyAuthRequest extends AuthRequest {
  spotifyAccessToken: string;
}
