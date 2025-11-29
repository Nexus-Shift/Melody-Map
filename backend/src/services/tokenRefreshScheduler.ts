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
      console.log('Token refresh scheduler already running');
      return;
    }
    
    console.log('Starting token refresh scheduler...');
    
    // Run immediately on start
    this.runRefreshCycle();
    
    // Then run every 30 minutes
    this.intervalId = setInterval(() => {
      this.runRefreshCycle();
    }, 30 * 60 * 1000); // 30 minutes
    
    console.log('Token refresh scheduler started (runs every 30 minutes)');
  }

  /**
   * Run a complete refresh cycle
   */
  private static async runRefreshCycle(): Promise<void> {
    console.log(`Token refresh cycle starting at ${new Date().toISOString()}`);
    await SpotifyTokenRefreshService.refreshAllExpiredTokens();
    await this.cleanupExpiredConnections();
    console.log('Token refresh cycle completed');
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
        .update({ 
          is_active: false,
          updated_at: new Date()
        });

      if (result > 0) {
        console.log(`Cleaned up ${result} expired connection(s)`);
      }
    } catch (error) {
      console.error('Error cleaning up expired connections:', error);
    }
  }

  /**
   * Stop the token refresh scheduler
   */
  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Token refresh scheduler stopped');
    }
  }

  /**
   * Get scheduler status
   */
  static isRunning(): boolean {
    return this.intervalId !== null;
  }
}