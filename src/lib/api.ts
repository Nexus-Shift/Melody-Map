const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
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
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
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
    return this.request<{ message: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request<{ message: string; user: User }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request<{ message: string }>('/auth/signout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Profile methods
  async getProfile() {
    return this.request<{ profile: Profile }>('/user/profile');
  }

  async updateProfile(data: { display_name?: string; avatar_url?: string }) {
    return this.request<{ profile: Profile; user: User }>('/user/profile', {
      method: 'PUT',
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
    return this.request<{ platforms: Array<{ id: string; name: string; connected: boolean }> }>('/music/platforms');
  }

  async getListeningHistory() {
    return this.request<{ tracks: any[] }>('/music/history');
  }

  async getTopGenres() {
    return this.request<{ genres: any[] }>('/music/genres');
  }

  async getListeningStats() {
    return this.request<{ total_hours: number; total_tracks: number; total_artists: number }>('/music/stats');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
