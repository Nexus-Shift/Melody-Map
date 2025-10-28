import { SpotifyTokenRefreshService } from '../../src/services/spotifyTokenRefresh';
import { db } from '../../src/config/database';

// Mock database
jest.mock('../../src/config/database');
const mockDb = db as jest.MockedFunction<typeof db>;

// Mock fetch
global.fetch = jest.fn();

describe('SpotifyTokenRefreshService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('should successfully refresh a valid token', async () => {
      const mockConnection = {
        id: 'test-connection-id',
        refresh_token: 'valid-refresh-token',
        platform: 'spotify'
      };

      const mockTokenResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
        refresh_token: 'new-refresh-token'
      };

      // Mock database queries using the correct pattern from auth tests
      const mockConnectionQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockConnection)
      };
      const mockUpdateQuery = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([1])
      };
      
      mockDb.mockReturnValueOnce(mockConnectionQuery as any)
            .mockReturnValueOnce(mockUpdateQuery as any);

      // Mock fetch response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse)
      } as any);

      const result = await SpotifyTokenRefreshService.refreshToken('test-connection-id');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': expect.stringContaining('Basic ')
        },
        body: expect.any(URLSearchParams)
      });
    });

    it('should handle invalid refresh token', async () => {
      const mockConnection = {
        id: 'test-connection-id',
        refresh_token: 'invalid-refresh-token',
        platform: 'spotify'
      };

      const mockErrorResponse = {
        error: 'invalid_grant',
        error_description: 'Refresh token revoked'
      };

      // Mock database queries
      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockConnection)
      });

      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1)
      });

      // Mock fetch response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockErrorResponse)
      } as any);

      const result = await SpotifyTokenRefreshService.refreshToken('test-connection-id');

      expect(result).toBe(false);
    });

    it('should return false for non-existent connection', async () => {
      // Mock database query returning null
      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const result = await SpotifyTokenRefreshService.refreshToken('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getValidAccessToken', () => {
    it('should return token if not expired', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      const mockConnection = {
        id: 'test-connection-id',
        access_token: 'valid-token',
        token_expires_at: futureDate
      };

      // Mock database query
      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockConnection)
      });

      const result = await SpotifyTokenRefreshService.getValidAccessToken('test-user-id');

      expect(result).toBe('valid-token');
    });

    it('should refresh token if expired and return new token', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const mockConnection = {
        id: 'test-connection-id',
        access_token: 'expired-token',
        token_expires_at: pastDate
      };

      const mockUpdatedConnection = {
        id: 'test-connection-id',
        access_token: 'new-valid-token',
        token_expires_at: new Date(Date.now() + 60 * 60 * 1000)
      };

      // Mock database queries
      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockConnection)
      });

      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockConnection)
      });

      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1)
      });

      (mockDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUpdatedConnection)
      });

      // Mock successful token refresh
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'new-valid-token',
          expires_in: 3600
        })
      } as any);

      const result = await SpotifyTokenRefreshService.getValidAccessToken('test-user-id');

      expect(result).toBe('new-valid-token');
    });
  });
});