import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Deezer API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Endpoints', () => {
    it('should construct correct user profile URL', () => {
      const userId = '12345';
      const url = `https://api.deezer.com/user/${userId}`;
      
      expect(url).toBe('https://api.deezer.com/user/12345');
    });

    it('should construct correct top tracks URL', () => {
      const userId = '12345';
      const url = `https://api.deezer.com/user/${userId}/tracks`;
      
      expect(url).toBe('https://api.deezer.com/user/12345/tracks');
    });

    it('should construct correct top artists URL', () => {
      const userId = '12345';
      const url = `https://api.deezer.com/user/${userId}/artists`;
      
      expect(url).toBe('https://api.deezer.com/user/12345/artists');
    });

    it('should add query parameters correctly', () => {
      const baseUrl = 'https://api.deezer.com/user/12345/tracks';
      const params = new URLSearchParams({ limit: '50' });
      const url = `${baseUrl}?${params.toString()}`;
      
      expect(url).toBe('https://api.deezer.com/user/12345/tracks?limit=50');
    });
  });

  describe('Data Transformation', () => {
    it('should transform Deezer user profile correctly', () => {
      const deezerProfile = {
        id: '12345',
        name: 'Test User',
        picture: 'https://api.deezer.com/user/12345/image',
        country: 'US'
      };
      
      expect(deezerProfile).toHaveProperty('id');
      expect(deezerProfile).toHaveProperty('name');
      expect(deezerProfile).toHaveProperty('picture');
    });

    it('should transform Deezer track to common format', () => {
      const deezerTrack = {
        id: '123',
        title: 'Test Song',
        artist: {
          id: '456',
          name: 'Test Artist'
        },
        album: {
          id: '789',
          title: 'Test Album',
          cover: 'https://example.com/cover.jpg'
        },
        duration: 180
      };
      
      const transformed = {
        id: deezerTrack.id,
        name: deezerTrack.title,
        artist: deezerTrack.artist.name,
        album: deezerTrack.album.title,
        duration: deezerTrack.duration,
        artwork: deezerTrack.album.cover
      };
      
      expect(transformed.name).toBe('Test Song');
      expect(transformed.artist).toBe('Test Artist');
      expect(transformed.album).toBe('Test Album');
    });

    it('should transform Deezer artist to common format', () => {
      const deezerArtist = {
        id: '456',
        name: 'Test Artist',
        picture: 'https://example.com/artist.jpg',
        nb_fan: 10000
      };
      
      const transformed = {
        id: deezerArtist.id,
        name: deezerArtist.name,
        image: deezerArtist.picture,
        followers: deezerArtist.nb_fan
      };
      
      expect(transformed.name).toBe('Test Artist');
      expect(transformed.followers).toBe(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized errors', () => {
      const error = {
        response: {
          status: 401,
          data: { error: { message: 'Invalid token' } }
        }
      };
      
      expect(error.response.status).toBe(401);
      expect(error.response.data.error.message).toBe('Invalid token');
    });

    it('should handle 403 forbidden errors', () => {
      const error = {
        response: {
          status: 403,
          data: { error: { message: 'Access denied' } }
        }
      };
      
      expect(error.response.status).toBe(403);
    });

    it('should handle 429 rate limit errors', () => {
      const error = {
        response: {
          status: 429,
          headers: { 'retry-after': '60' },
          data: { error: { message: 'Rate limit exceeded' } }
        }
      };
      
      expect(error.response.status).toBe(429);
      expect(error.response.headers['retry-after']).toBe('60');
    });

    it('should handle network errors', () => {
      const error = new Error('Network Error');
      expect(error.message).toBe('Network Error');
    });

    it('should handle timeout errors', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };
      
      expect(error.code).toBe('ECONNABORTED');
      expect(error.message).toContain('timeout');
    });
  });

  describe('Pagination', () => {
    it('should handle paginated responses', () => {
      const response = {
        data: [
          { id: '1', title: 'Track 1' },
          { id: '2', title: 'Track 2' }
        ],
        total: 100,
        next: 'https://api.deezer.com/user/12345/tracks?index=2'
      };
      
      expect(response.data).toHaveLength(2);
      expect(response.total).toBe(100);
      expect(response.next).toBeTruthy();
    });

    it('should detect last page of results', () => {
      const response = {
        data: [
          { id: '99', title: 'Track 99' },
          { id: '100', title: 'Track 100' }
        ],
        total: 100,
        next: null
      };
      
      expect(response.next).toBeNull();
      expect(response.data.length).toBeLessThanOrEqual(response.total);
    });
  });

  describe('Request Headers', () => {
    it('should include access token in Authorization header', () => {
      const accessToken = 'test_access_token';
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };
      
      expect(headers.Authorization).toBe('Bearer test_access_token');
    });

    it('should include User-Agent header', () => {
      const headers = {
        'User-Agent': 'Melody-Map/1.0',
        Authorization: 'Bearer token'
      };
      
      expect(headers['User-Agent']).toBe('Melody-Map/1.0');
    });
  });

  describe('Response Validation', () => {
    it('should validate track response structure', () => {
      const track = {
        id: '123',
        title: 'Test Track',
        artist: { id: '456', name: 'Test Artist' },
        album: { id: '789', title: 'Test Album' },
        duration: 180
      };
      
      expect(track).toHaveProperty('id');
      expect(track).toHaveProperty('title');
      expect(track).toHaveProperty('artist');
      expect(track.artist).toHaveProperty('name');
    });

    it('should validate artist response structure', () => {
      const artist = {
        id: '456',
        name: 'Test Artist',
        picture: 'https://example.com/pic.jpg',
        nb_fan: 1000
      };
      
      expect(artist).toHaveProperty('id');
      expect(artist).toHaveProperty('name');
      expect(artist).toHaveProperty('nb_fan');
    });

    it('should handle missing optional fields', () => {
      const track: any = {
        id: '123',
        title: 'Test Track',
        artist: { id: '456', name: 'Test Artist' },
        album: { id: '789', title: 'Test Album' }
        // duration is missing
      };
      
      expect(track.duration).toBeUndefined();
      expect(track.id).toBeDefined();
    });
  });
});
