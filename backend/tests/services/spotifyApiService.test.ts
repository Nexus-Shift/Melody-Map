import { SpotifyApiService } from '../../src/services/spotifyApiService';
import { SpotifyTokenRefreshService } from '../../src/services/spotifyTokenRefresh';

// Mock dependencies
jest.mock('../../src/services/spotifyTokenRefresh');
const mockTokenService = SpotifyTokenRefreshService as jest.Mocked<typeof SpotifyTokenRefreshService>;

// Mock fetch
global.fetch = jest.fn();

describe('SpotifyApiService', () => {
  const testUserId = 'test-user-123';
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenService.getValidAccessToken.mockResolvedValue(testAccessToken);
  });

  describe('getUserProfile', () => {
    it('should return user profile on successful API call', async () => {
      const mockProfile = {
        id: 'spotify-user-id',
        display_name: 'Test User',
        email: 'test@example.com',
        followers: { total: 100 }
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProfile)
      } as any);

      const result = await SpotifyApiService.getUserProfile(testUserId);

      expect(result).toEqual(mockProfile);
      expect(fetch).toHaveBeenCalledWith('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${testAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
    });

    it('should return null when no access token available', async () => {
      mockTokenService.getValidAccessToken.mockResolvedValue(null);

      const result = await SpotifyApiService.getUserProfile(testUserId);

      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return null on API error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as any);

      const result = await SpotifyApiService.getUserProfile(testUserId);

      expect(result).toBeNull();
    });
  });

  describe('getTopTracks', () => {
    it('should return top tracks with correct parameters', async () => {
      const mockTracks = {
        items: [
          {
            id: 'track1',
            name: 'Test Track',
            artists: [{ id: 'artist1', name: 'Test Artist' }],
            duration_ms: 210000
          }
        ]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTracks)
      } as any);

      const result = await SpotifyApiService.getTopTracks(testUserId, 'short_term', 10);

      expect(result).toEqual(mockTracks);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testAccessToken}`
          })
        })
      );
    });
  });

  describe('getListeningStats', () => {
    it('should calculate stats from top tracks and artists', async () => {
      const mockTopTracks = {
        items: [
          { id: 'track1', duration_ms: 180000 }, // 3 minutes
          { id: 'track2', duration_ms: 240000 }  // 4 minutes
        ]
      };

      const mockTopArtists = {
        items: [
          { id: 'artist1', genres: ['rock', 'indie'] },
          { id: 'artist2', genres: ['rock', 'pop'] },
          { id: 'artist3', genres: ['jazz'] }
        ]
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTopTracks)
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTopArtists)
        } as any);

      const result = await SpotifyApiService.getListeningStats(testUserId);

      expect(result).toEqual({
        totalTracks: 2,
        totalArtists: 3,
        topGenres: [
          { genre: 'rock', count: 2 },
          { genre: 'indie', count: 1 },
          { genre: 'pop', count: 1 },
          { genre: 'jazz', count: 1 }
        ],
        listeningTimeEstimate: 7 // (180000 + 240000) / 1000 / 60
      });
    });

    it('should return null if API calls fail', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500
      } as any);

      const result = await SpotifyApiService.getListeningStats(testUserId);

      expect(result).toBeNull();
    });
  });
});