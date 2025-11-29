import { DeezerTokenRefreshService } from './deezerTokenRefresh';

interface DeezerUser {
  id: number;
  name: string;
  email?: string;
  country?: string;
  picture?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  duration: number; // in seconds
  preview: string;
  link: string;
  rank: number;
  artist: {
    id: number;
    name: string;
    picture?: string;
    picture_small?: string;
    picture_medium?: string;
    picture_big?: string;
    picture_xl?: string;
  };
  album: {
    id: number;
    title: string;
    cover?: string;
    cover_small?: string;
    cover_medium?: string;
    cover_big?: string;
    cover_xl?: string;
  };
}

interface DeezerArtist {
  id: number;
  name: string;
  link: string;
  picture?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  nb_fan?: number;
  nb_album?: number;
}

interface DeezerAlbum {
  id: number;
  title: string;
  link: string;
  cover?: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  genre_id?: number;
  fans?: number;
  release_date?: string;
  record_type?: string;
  artist: {
    id: number;
    name: string;
    picture?: string;
  };
}

interface DeezerPlaylist {
  id: number;
  title: string;
  description?: string;
  duration: number;
  public: boolean;
  is_loved_track: boolean;
  collaborative: boolean;
  nb_tracks: number;
  fans?: number;
  link: string;
  picture?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  creator: {
    id: number;
    name: string;
  };
}

export class DeezerApiService {
  /**
   * Make authenticated request to Deezer API
   * Note: Deezer uses access_token as a query parameter
   */
  private static async makeDeezerRequest<T>(
    userId: string,
    endpoint: string
  ): Promise<T | null> {
    try {
      const accessToken = await DeezerTokenRefreshService.getValidAccessToken(userId);
      if (!accessToken) {
        return null;
      }

      // Add access_token as query parameter
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `https://api.deezer.com${endpoint}${separator}access_token=${accessToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as T & { error?: { type: string; message: string; code: number } };
      
      // Check if Deezer returned an error
      if ('error' in data && data.error) {
        console.error('Deezer API error:', data.error);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Deezer API request failed:', error);
      return null;
    }
  }

  /**
   * Get current user's Deezer profile
   */
  static async getUserProfile(userId: string): Promise<DeezerUser | null> {
    return this.makeDeezerRequest<DeezerUser>(userId, '/user/me');
  }

  /**
   * Get user's favorite/loved tracks
   */
  static async getFavoriteTracks(userId: string, limit: number = 50): Promise<{ data: DeezerTrack[] } | null> {
    return this.makeDeezerRequest<{ data: DeezerTrack[] }>(userId, `/user/me/tracks?limit=${limit}`);
  }

  /**
   * Get user's favorite artists
   */
  static async getFavoriteArtists(userId: string, limit: number = 50): Promise<{ data: DeezerArtist[] } | null> {
    return this.makeDeezerRequest<{ data: DeezerArtist[] }>(userId, `/user/me/artists?limit=${limit}`);
  }

  /**
   * Get user's favorite albums
   */
  static async getFavoriteAlbums(userId: string, limit: number = 50): Promise<{ data: DeezerAlbum[] } | null> {
    return this.makeDeezerRequest<{ data: DeezerAlbum[] }>(userId, `/user/me/albums?limit=${limit}`);
  }

  /**
   * Get user's playlists
   */
  static async getUserPlaylists(userId: string, limit: number = 50): Promise<{ data: DeezerPlaylist[] } | null> {
    return this.makeDeezerRequest<{ data: DeezerPlaylist[] }>(userId, `/user/me/playlists?limit=${limit}`);
  }

  /**
   * Get user's listening history
   * Note: Deezer doesn't provide a direct history endpoint, so we use recently added tracks
   */
  static async getRecentlyPlayed(userId: string, limit: number = 50): Promise<{ data: DeezerTrack[] } | null> {
    // Using favorite tracks as a proxy for recently played
    // Deezer doesn't have a direct "recently played" endpoint in their public API
    return this.makeDeezerRequest<{ data: DeezerTrack[] }>(userId, `/user/me/tracks?limit=${limit}`);
  }

  /**
   * Get user's flow (personalized radio) - Note: This might not work without premium
   */
  static async getFlow(userId: string): Promise<{ data: DeezerTrack[] } | null> {
    return this.makeDeezerRequest<{ data: DeezerTrack[] }>(userId, '/user/me/flow');
  }

  /**
   * Get listening statistics (derived from favorite tracks/artists)
   */
  static async getListeningStats(userId: string): Promise<{
    totalTracks: number;
    totalArtists: number;
    totalAlbums: number;
    topGenres: Array<{ genre: string; count: number }>;
    listeningTimeEstimate: number; // in minutes
  } | null> {
    try {
      const [favoriteTracks, favoriteArtists, favoriteAlbums] = await Promise.all([
        this.getFavoriteTracks(userId, 50),
        this.getFavoriteArtists(userId, 50),
        this.getFavoriteAlbums(userId, 50)
      ]);

      if (!favoriteTracks || !favoriteArtists || !favoriteAlbums) {
        return null;
      }

      // Get genre information from albums
      const genreIds = new Map<number, number>();
      favoriteAlbums.data.forEach(album => {
        if (album.genre_id) {
          genreIds.set(album.genre_id, (genreIds.get(album.genre_id) || 0) + 1);
        }
      });

      // Deezer doesn't provide direct genre names in these endpoints
      // We'll use a placeholder structure
      const topGenres = Array.from(genreIds.entries())
        .map(([genreId, count]) => ({ 
          genre: `Genre ${genreId}`, // Placeholder - would need genre lookup
          count 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Estimate listening time based on track duration
      const listeningTimeEstimate = favoriteTracks.data.reduce((total, track) => {
        return total + (track.duration / 60); // Convert seconds to minutes
      }, 0);

      return {
        totalTracks: favoriteTracks.data.length,
        totalArtists: favoriteArtists.data.length,
        totalAlbums: favoriteAlbums.data.length,
        topGenres,
        listeningTimeEstimate: Math.round(listeningTimeEstimate)
      };
    } catch (error) {
      console.error('Error calculating Deezer stats:', error);
      return null;
    }
  }
}
