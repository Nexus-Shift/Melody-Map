import { describe, it, expect } from 'vitest';
import {
  useMockDeezerData,
  useMockAppleMusicData,
  mockDeezerProfile,
  mockDeezerTracks,
  mockDeezerArtists,
  mockDeezerStats,
  mockAppleMusicProfile,
  mockAppleMusicTracks,
  mockAppleMusicArtists,
  mockAppleMusicStats,
} from '@/lib/mockData';

describe('Mock Data', () => {
  describe('Feature Detection', () => {
    it('should detect when to use mock Deezer data', () => {
      const shouldUseMock = useMockDeezerData();
      expect(typeof shouldUseMock).toBe('boolean');
    });

    it('should always return true for Apple Music mock data', () => {
      const shouldUseMock = useMockAppleMusicData();
      expect(shouldUseMock).toBe(true);
    });
  });

  describe('Deezer Mock Data Structure', () => {
    it('should have valid Deezer profile data', () => {
      expect(mockDeezerProfile).toHaveProperty('id');
      expect(mockDeezerProfile).toHaveProperty('name');
      expect(mockDeezerProfile).toHaveProperty('country');
      expect(mockDeezerProfile).toHaveProperty('picture_medium');
    });

    it('should have valid Deezer tracks array', () => {
      expect(Array.isArray(mockDeezerTracks)).toBe(true);
      expect(mockDeezerTracks.length).toBeGreaterThan(0);
      
      const track = mockDeezerTracks[0];
      expect(track).toHaveProperty('id');
      expect(track).toHaveProperty('title');
      expect(track).toHaveProperty('duration');
      expect(track).toHaveProperty('artist');
      expect(track).toHaveProperty('album');
    });

    it('should have valid Deezer artists array', () => {
      expect(Array.isArray(mockDeezerArtists)).toBe(true);
      expect(mockDeezerArtists.length).toBeGreaterThan(0);
      
      const artist = mockDeezerArtists[0];
      expect(artist).toHaveProperty('id');
      expect(artist).toHaveProperty('name');
      expect(artist).toHaveProperty('picture_medium');
      expect(artist).toHaveProperty('nb_fan');
    });

    it('should have valid Deezer stats', () => {
      expect(mockDeezerStats).toHaveProperty('totalTracks');
      expect(mockDeezerStats).toHaveProperty('totalArtists');
      expect(mockDeezerStats).toHaveProperty('totalAlbums');
      expect(mockDeezerStats).toHaveProperty('listeningTimeEstimate');
      expect(mockDeezerStats).toHaveProperty('topGenres');
      expect(Array.isArray(mockDeezerStats.topGenres)).toBe(true);
    });
  });

  describe('Apple Music Mock Data Structure', () => {
    it('should have valid Apple Music profile data', () => {
      expect(mockAppleMusicProfile).toHaveProperty('id');
      expect(mockAppleMusicProfile).toHaveProperty('name');
      expect(mockAppleMusicProfile).toHaveProperty('membershipType');
      expect(mockAppleMusicProfile).toHaveProperty('avatar');
    });

    it('should have valid Apple Music tracks array', () => {
      expect(Array.isArray(mockAppleMusicTracks)).toBe(true);
      expect(mockAppleMusicTracks.length).toBeGreaterThan(0);
      
      const track = mockAppleMusicTracks[0];
      expect(track).toHaveProperty('id');
      expect(track).toHaveProperty('name');
      expect(track).toHaveProperty('artist');
      expect(track).toHaveProperty('album');
      expect(track).toHaveProperty('duration');
      expect(track).toHaveProperty('artwork');
    });

    it('should have valid Apple Music artists array', () => {
      expect(Array.isArray(mockAppleMusicArtists)).toBe(true);
      expect(mockAppleMusicArtists.length).toBeGreaterThan(0);
      
      const artist = mockAppleMusicArtists[0];
      expect(artist).toHaveProperty('id');
      expect(artist).toHaveProperty('name');
      expect(artist).toHaveProperty('artwork');
      expect(artist).toHaveProperty('genres');
      expect(Array.isArray(artist.genres)).toBe(true);
    });

    it('should have valid Apple Music stats', () => {
      expect(mockAppleMusicStats).toHaveProperty('totalTracks');
      expect(mockAppleMusicStats).toHaveProperty('totalArtists');
      expect(mockAppleMusicStats).toHaveProperty('listeningTimeEstimate');
      expect(mockAppleMusicStats).toHaveProperty('topGenres');
      expect(Array.isArray(mockAppleMusicStats.topGenres)).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent track duration formats', () => {
      // Deezer uses seconds
      mockDeezerTracks.forEach(track => {
        expect(typeof track.duration).toBe('number');
        expect(track.duration).toBeGreaterThan(0);
      });

      // Apple Music uses duration_ms (milliseconds)
      mockAppleMusicTracks.forEach(track => {
        expect(typeof track.duration_ms).toBe('number');
        expect(track.duration_ms).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs for tracks', () => {
      const deezerIds = new Set(mockDeezerTracks.map(t => t.id));
      expect(deezerIds.size).toBe(mockDeezerTracks.length);

      const appleIds = new Set(mockAppleMusicTracks.map(t => t.id));
      expect(appleIds.size).toBe(mockAppleMusicTracks.length);
    });

    it('should have unique IDs for artists', () => {
      const deezerIds = new Set(mockDeezerArtists.map(a => a.id));
      expect(deezerIds.size).toBe(mockDeezerArtists.length);

      const appleIds = new Set(mockAppleMusicArtists.map(a => a.id));
      expect(appleIds.size).toBe(mockAppleMusicArtists.length);
    });

    it('should have realistic genre counts', () => {
      mockDeezerStats.topGenres.forEach(genre => {
        expect(genre.count).toBeGreaterThan(0);
        expect(typeof genre.genre).toBe('string');
      });

      mockAppleMusicStats.topGenres.forEach(genre => {
        expect(genre.count).toBeGreaterThan(0);
        expect(typeof genre.genre).toBe('string');
      });
    });
  });
});
