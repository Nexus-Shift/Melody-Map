import { SpotifyTokenRefreshService } from './spotifyTokenRefresh';

interface SpotifyUser {
  id: string;
  display_name?: string;
  email?: string;
  followers?: { total: number };
  images?: Array<{ url: string; height: number; width: number }>;
  country?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  popularity: number;
  preview_url?: string;
  external_urls: { spotify: string };
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
}

interface SpotifyPlaylistTrack {
  track: SpotifyTrack;
  added_at: string;
}

interface SpotifyRecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
  context?: {
    type: string;
    href: string;
    external_urls: { spotify: string };
  };
}

export class SpotifyApiService {
  /**
   * Make authenticated request to Spotify API
   */
  private static async makeSpotifyRequest<T>(
    userId: string, 
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      const accessToken = await SpotifyTokenRefreshService.getValidAccessToken(userId);
      if (!accessToken) {
        return null;
      }

      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json() as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user's Spotify profile
   */
  static async getUserProfile(userId: string): Promise<SpotifyUser | null> {
    return this.makeSpotifyRequest<SpotifyUser>(userId, '/me');
  }

  /**
   * Get user's top tracks
   */
  static async getTopTracks(
    userId: string, 
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<{ items: SpotifyTrack[] } | null> {
    return this.makeSpotifyRequest<{ items: SpotifyTrack[] }>(
      userId, 
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
  }

  /**
   * Get user's top artists
   */
  static async getTopArtists(
    userId: string, 
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<{ items: SpotifyArtist[] } | null> {
    return this.makeSpotifyRequest<{ items: SpotifyArtist[] }>(
      userId, 
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
  }

  /**
   * Get user's recently played tracks
   */
  static async getRecentlyPlayed(
    userId: string, 
    limit: number = 50
  ): Promise<{ items: SpotifyRecentlyPlayed[] } | null> {
    return this.makeSpotifyRequest<{ items: SpotifyRecentlyPlayed[] }>(
      userId, 
      `/me/player/recently-played?limit=${limit}`
    );
  }

  /**
   * Get user's current playback state
   */
  static async getCurrentPlayback(userId: string): Promise<{
    is_playing: boolean;
    item?: SpotifyTrack;
    progress_ms?: number;
    device?: {
      id: string;
      is_active: boolean;
      name: string;
      type: string;
      volume_percent: number;
    };
  } | null> {
    return this.makeSpotifyRequest(userId, '/me/player');
  }

  /**
   * Get user's playlists
   */
  static async getUserPlaylists(
    userId: string, 
    limit: number = 20
  ): Promise<{ items: Array<{
    id: string;
    name: string;
    description?: string;
    images: Array<{ url: string }>;
    tracks: { total: number };
    public: boolean;
    collaborative: boolean;
    owner: { display_name: string; id: string };
  }> } | null> {
    return this.makeSpotifyRequest(userId, `/me/playlists?limit=${limit}`);
  }

  /**
   * Get user's saved albums
   */
  static async getSavedAlbums(
    userId: string, 
    limit: number = 20
  ): Promise<{ items: Array<{
    added_at: string;
    album: {
      id: string;
      name: string;
      artists: Array<{ id: string; name: string }>;
      images: Array<{ url: string }>;
      total_tracks: number;
      release_date: string;
    };
  }> } | null> {
    return this.makeSpotifyRequest(userId, `/me/albums?limit=${limit}`);
  }

  /**
   * Get listening statistics (derived from top tracks/artists)
   */
  static async getListeningStats(userId: string): Promise<{
    totalTracks: number;
    totalArtists: number;
    topGenres: Array<{ genre: string; count: number }>;
    listeningTimeEstimate: number; // in minutes
  } | null> {
    try {
      const [topTracks, topArtists] = await Promise.all([
        this.getTopTracks(userId, 'long_term', 50),
        this.getTopArtists(userId, 'long_term', 50)
      ]);

      if (!topTracks || !topArtists) {
        return null;
      }

      // Calculate genres from top artists
      const genreCount = new Map<string, number>();
      topArtists.items.forEach(artist => {
        artist.genres.forEach(genre => {
          genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
        });
      });

      const topGenres = Array.from(genreCount.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Estimate listening time based on track duration and popularity
      const listeningTimeEstimate = topTracks.items.reduce((total, track) => {
        return total + (track.duration_ms / 1000 / 60); // Convert to minutes
      }, 0);

      return {
        totalTracks: topTracks.items.length,
        totalArtists: topArtists.items.length,
        topGenres,
        listeningTimeEstimate: Math.round(listeningTimeEstimate)
      };
    } catch (error) {
      return null;
    }
  }
}