import { db } from '../config/database';

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

export class SpotifyTokenRefreshService {
  /**
   * Refresh Spotify access token using refresh token
   */
  static async refreshToken(connectionId: string): Promise<boolean> {
    try {
      const connection = await db('platform_connections')
        .where({ id: connectionId, platform: 'spotify' })
        .first();

      if (!connection || !connection.refresh_token) {
        return false;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: connection.refresh_token
        })
      });

      const tokenData = await response.json() as SpotifyTokenResponse;

      if (!response.ok || tokenData.error) {
        console.error(`Token refresh failed for connection ${connectionId}:`, tokenData.error);
        
        // If refresh token is invalid, mark connection as inactive
        if (tokenData.error === 'invalid_grant') {
          await db('platform_connections')
            .where({ id: connectionId })
            .update({ 
              is_active: false,
              updated_at: new Date()
            });
          console.warn(`Connection ${connectionId} marked as inactive due to invalid grant`);
        }
        
        return false;
      }

      // Update connection with new tokens
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
      
      await db('platform_connections')
        .where({ id: connectionId })
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || connection.refresh_token, // Keep old refresh token if not provided
          token_expires_at: expiresAt,
          updated_at: db.fn.now()
        });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh all expired Spotify tokens
   */
  static async refreshAllExpiredTokens(): Promise<void> {
    try {
      // Find all Spotify connections that are about to expire (within 5 minutes)
      const expiringSoon = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      const expiringConnections = await db('platform_connections')
        .where({ platform: 'spotify', is_active: true })
        .where('token_expires_at', '<', expiringSoon)
        .select('id', 'user_id');

      if (expiringConnections.length > 0) {
        console.log(`Refreshing ${expiringConnections.length} expiring Spotify token(s)...`);
      }

      let successCount = 0;
      let failCount = 0;

      for (const connection of expiringConnections) {
        const success = await this.refreshToken(connection.id);
        if (success) {
          successCount++;
          console.log(`Refreshed token for connection ${connection.id}`);
        } else {
          failCount++;
          console.log(`Failed to refresh token for connection ${connection.id}`);
        }
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (expiringConnections.length > 0) {
        console.log(`Token refresh complete: ${successCount} succeeded, ${failCount} failed`);
      }
    } catch (error) {
      console.error('Error in refreshAllExpiredTokens:', error);
    }
  }

  /**
   * Get a valid access token for a user's Spotify connection
   */
  static async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      const connection = await db('platform_connections')
        .where({ user_id: userId, platform: 'spotify', is_active: true })
        .first();

      if (!connection) {
        return null;
      }

      // Check if token is expired (with 5 minute buffer)
      const expiryBuffer = new Date(Date.now() + 5 * 60 * 1000);
      if (new Date(connection.token_expires_at) <= expiryBuffer) {
        const refreshSuccess = await this.refreshToken(connection.id);
        
        if (!refreshSuccess) {
          return null;
        }

        // Get updated token
        const updatedConnection = await db('platform_connections')
          .where({ id: connection.id })
          .first();
        
        return updatedConnection?.access_token || null;
      }

      return connection.access_token;
    } catch (error) {
      return null;
    }
  }
}