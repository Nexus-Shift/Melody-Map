import request from 'supertest';
import express from 'express';
import { authenticate, AuthRequest } from '../../src/middleware/auth';
import '../setup';

// Mock dependencies
jest.mock('../../src/middleware/auth');

// Mock the Spotify API service
const mockSpotifyApiService = {
  getUserProfile: jest.fn(),
  getTopTracks: jest.fn(),
  getTopArtists: jest.fn(),
  getListeningStats: jest.fn()
};

jest.mock('../../src/services/spotifyApiService', () => ({
  SpotifyApiService: mockSpotifyApiService
}));

// Import after mocking
import spotifyApiRoutes from '../../src/routes/spotify-api';

const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe('Spotify API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to pass through and set authUser  
    mockAuthenticate.mockImplementation(async (req: AuthRequest, res, next) => {
      req.authUser = { 
        id: 'test-user-123',
        email: 'test@example.com',
        username: 'testuser',
        auth_provider: 'local',
        connectedPlatforms: ['spotify']
      };
      next();
      return undefined;
    });

    // Mount API routes like the actual server - with authentication middleware
    app.use('/api/spotify', mockAuthenticate, spotifyApiRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/spotify/profile', () => {
    it('should return user profile when connection exists', async () => {
      const mockProfile = {
        id: 'spotify-user-id',
        display_name: 'Test User',
        email: 'test@example.com'
      };

      mockSpotifyApiService.getUserProfile.mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/api/spotify/profile')
        .expect(200);

      expect(response.body).toEqual({ profile: mockProfile });
      expect(mockSpotifyApiService.getUserProfile).toHaveBeenCalledWith('test-user-123');
    });

    it('should return 404 when no Spotify connection exists', async () => {
      mockSpotifyApiService.getUserProfile.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/spotify/profile')
        .expect(404);

      expect(response.body.error).toBe('Spotify profile not found or connection invalid');
    });
  });

  describe('GET /api/spotify/top-tracks', () => {
    it('should return top tracks with default parameters', async () => {
      const mockTracks = {
        items: [
          { id: 'track1', name: 'Test Track' }
        ]
      };

      mockSpotifyApiService.getTopTracks.mockResolvedValue(mockTracks);

      const response = await request(app)
        .get('/api/spotify/top-tracks')
        .expect(200);

      expect(response.body).toEqual({ tracks: mockTracks.items });
      expect(mockSpotifyApiService.getTopTracks).toHaveBeenCalledWith('test-user-123', 'medium_term', 20);
    });
  });

  describe('GET /api/spotify/stats', () => {
    it('should return listening statistics', async () => {
      const mockStats = {
        totalTracks: 50,
        totalArtists: 25,
        topGenres: [{ genre: 'rock', count: 10 }],
        listeningTimeEstimate: 180
      };

      mockSpotifyApiService.getListeningStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/spotify/stats')
        .expect(200);

      expect(response.body).toEqual({ stats: mockStats });
      expect(mockSpotifyApiService.getListeningStats).toHaveBeenCalledWith('test-user-123');
    });
  });
});