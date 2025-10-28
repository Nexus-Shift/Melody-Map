import { SpotifyTokenRefreshService } from '../services/spotifyTokenRefresh';
import { db } from '../config/database';

export class TokenRefreshScheduler {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the token refresh scheduler
   * Runs every 30 minutes to check for expiring tokens
   */
  static start(): void {
    if (this.intervalId) {
      return;
    }
    
    // Run immediately on start
    SpotifyTokenRefreshService.refreshAllExpiredTokens();
    this.cleanupExpiredConnections();
    
    // Then run every 30 minutes
    this.intervalId = setInterval(() => {
      SpotifyTokenRefreshService.refreshAllExpiredTokens();
      this.cleanupExpiredConnections();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Clean up connections that have been expired for more than 7 days
   */
  private static async cleanupExpiredConnections(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await db('platform_connections')
        .where('token_expires_at', '<', sevenDaysAgo)
        .where('is_active', true)
        .update({ is_active: false });

      if (result > 0) {
      }
    } catch (error) {
    }
  }

  /**
   * Stop the token refresh scheduler
   */
  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}