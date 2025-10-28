const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  auth_provider: "local" | "google";
  connectedPlatforms?: string[];
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      credentials: "include", // Include cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async signUp(email: string, password: string, username?: string) {
    return this.request<{ message: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request<{ message: string; user: User }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request<{ message: string }>("/auth/signout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>("/auth/me");
  }

  async canChangePassword() {
    return this.request<{ canChangePassword: boolean; auth_provider: string }>(
      "/auth/can-change-password"
    );
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Profile methods
  async getProfile() {
    return this.request<{ profile: Profile }>("/user/profile");
  }

  async updateProfile(data: { display_name?: string; avatar_url?: string }) {
    return this.request<{ profile: Profile; user: User }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Avatar upload methods
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const url = `${this.baseURL}/upload/avatar`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteAvatar() {
    return this.request<{ message: string; profile: Profile }>('/upload/avatar', {
      method: 'DELETE',
    });
  }

  // Music methods
  async getPlatforms() {
    return this.request<{
      platforms: Array<{ id: string; name: string; connected: boolean }>;
    }>("/music/platforms");
  }



  async getListeningHistory() {
    return this.request<{ tracks: any[] }>("/music/history");
  }

  async getTopGenres() {
    return this.request<{ genres: any[] }>("/music/genres");
  }

  async getListeningStats() {
    return this.request<{
      total_hours: number;
      total_tracks: number;
      total_artists: number;
    }>("/music/stats");
  }

  async testSpotifyConnection() {
    return this.request<{
      connected: boolean;
      reason?: string;
      spotifyUser?: {
        id: string;
        display_name?: string;
        email?: string;
      };
    }>("/auth/test-connection");
  }

  // Spotify Data Methods
  async getSpotifyProfile() {
    return this.request<{
      profile: {
        id: string;
        display_name?: string;
        email?: string;
        followers?: { total: number };
        images?: Array<{ url: string; height: number; width: number }>;
        country?: string;
      };
    }>("/spotify/profile");
  }

  async getSpotifyTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) {
    return this.request<{
      tracks: Array<{
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
      }>;
    }>(`/spotify/top-tracks?time_range=${timeRange}&limit=${limit}`);
  }

  async getSpotifyTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) {
    return this.request<{
      artists: Array<{
        id: string;
        name: string;
        genres: string[];
        popularity: number;
        followers: { total: number };
        images: Array<{ url: string; height: number; width: number }>;
        external_urls: { spotify: string };
      }>;
    }>(`/spotify/top-artists?time_range=${timeRange}&limit=${limit}`);
  }

  async getSpotifyRecentlyPlayed(limit: number = 20) {
    return this.request<{
      tracks: Array<{
        track: any; // SpotifyTrack
        played_at: string;
      }>;
    }>(`/spotify/recently-played?limit=${limit}`);
  }

  async getSpotifyCurrentPlayback() {
    return this.request<{
      isPlaying: boolean;
      track?: any;
      progress?: number;
      device?: any;
    }>("/spotify/current-playback");
  }

  async getSpotifyStats() {
    return this.request<{
      stats: {
        totalTracks: number;
        totalArtists: number;
        topGenres: Array<{ genre: string; count: number }>;
        listeningTimeEstimate: number;
      };
    }>("/spotify/stats");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
