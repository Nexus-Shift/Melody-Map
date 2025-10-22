import request from 'supertest';
import express from 'express';
import spotifyRoutes from '../../src/routes/spotify';
import spotifyApiRoutes from '../../src/routes/spotify-api';
import { authenticate, AuthRequest } from '../../src/middleware/auth';

// Mock dependencies
jest.mock('../../src/middleware/auth');
jest.mock('../../src/services/spotifyTokenRefresh');
jest.mock('../../src/services/spotifyApiService');

const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe('Spotify Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to pass through
    mockAuthenticate.mockImplementation(async (req: AuthRequest, res, next) => {
      req.authUser = { 
        id: 'test-user-123',
        email: 'test@example.com',
        username: 'testuser',
        auth_provider: 'local',
        connectedPlatforms: []
      };
      next();
      return undefined;
    });

    // Mount routes like the actual server
    app.use('/api/auth', spotifyRoutes);
  });

  describe('GET /api/auth/spotify', () => {
    it('should redirect to Spotify authorization URL', async () => {
      // Mock environment variables
      process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
      process.env.BACKEND_URL = 'http://localhost:3001';

      const response = await request(app)
        .get('/api/auth/spotify')
        .expect(302);

      expect(response.headers.location).toContain('accounts.spotify.com/authorize');
      expect(response.headers.location).toContain('client_id=test-client-id');
      expect(response.headers.location).toContain('response_type=code');
      expect(response.headers.location).toContain('scope=');
    });

    it('should return 500 when client ID is missing', async () => {
      delete process.env.SPOTIFY_CLIENT_ID;

      const response = await request(app)
        .get('/api/auth/spotify')
        .expect(500);

      expect(response.body.error).toBe('Spotify client ID not configured');
    });
  });
});

describe('Spotify API Routes', () => {
  let app: express.Application;
  const { SpotifyApiService } = require('../../src/services/spotifyApiService');

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
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

      SpotifyApiService.getUserProfile.mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/api/spotify/profile')
        .expect(200);

      expect(response.body).toEqual({ profile: mockProfile });
      expect(SpotifyApiService.getUserProfile).toHaveBeenCalledWith('test-user-123');
    });

    it('should return 404 when no Spotify connection exists', async () => {
      SpotifyApiService.getUserProfile.mockResolvedValue(null);

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

      SpotifyApiService.getTopTracks.mockResolvedValue(mockTracks);

      const response = await request(app)
        .get('/api/spotify/top-tracks')
        .expect(200);

      expect(response.body).toEqual({ tracks: mockTracks.items });
      expect(SpotifyApiService.getTopTracks).toHaveBeenCalledWith('test-user-123', 'medium_term', 20);
    });

    it('should use query parameters when provided', async () => {
      const mockTracks = { items: [] };
      SpotifyApiService.getTopTracks.mockResolvedValue(mockTracks);

      await request(app)
        .get('/api/spotify/top-tracks?time_range=short_term&limit=10')
        .expect(200);

      expect(SpotifyApiService.getTopTracks).toHaveBeenCalledWith('test-user-123', 'short_term', 10);
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

      SpotifyApiService.getListeningStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/spotify/stats')
        .expect(200);

      expect(response.body).toEqual({ stats: mockStats });
      expect(SpotifyApiService.getListeningStats).toHaveBeenCalledWith('test-user-123');
    });
  });
});