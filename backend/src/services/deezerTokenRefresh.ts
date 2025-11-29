import { db } from '../config/database';

export class DeezerTokenRefreshService {
  /**
   * Get valid access token for a user's Deezer connection
   * Note: Deezer tokens don't expire, but we check if connection is still active
   */
  static async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      const connection = await db('platform_connections')
        .where({ user_id: userId, platform: 'deezer', is_active: true })
        .first();

      if (!connection) {
        console.log(`No active Deezer connection found for user ${userId}`);
        return null;
      }

      // Deezer tokens don't expire, so just return the access token
      return connection.access_token;
    } catch (error) {
      console.error('Error getting Deezer access token:', error);
      return null;
    }
  }

  /**
   * Verify if a Deezer token is still valid by making a test API call
   */
  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.deezer.com/user/me?access_token=${accessToken}`);
      const data = await response.json() as { error?: { type: string; message: string; code: number } };
      
      // If we get an error in the response, the token is invalid
      if (data.error) {
        console.log('Deezer token verification failed:', data.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying Deezer token:', error);
      return false;
    }
  }

  /**
   * Mark a Deezer connection as inactive
   */
  static async markConnectionInactive(userId: string): Promise<void> {
    try {
      await db('platform_connections')
        .where({ user_id: userId, platform: 'deezer' })
        .update({
          is_active: false,
          updated_at: new Date()
        });
      console.log(`Marked Deezer connection as inactive for user ${userId}`);
    } catch (error) {
      console.error('Error marking Deezer connection inactive:', error);
    }
  }
}
