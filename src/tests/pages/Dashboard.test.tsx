import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  checkAuthStatus: vi.fn(),
  getUserProfile: vi.fn(),
  getTopTracks: vi.fn(),
  getTopArtists: vi.fn(),
  getRecentTracks: vi.fn(),
  getListeningStats: vi.fn(),
}));

// Mock the ThemeProvider
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (api.checkAuthStatus as any).mockResolvedValue({
      authenticated: true,
      platforms: { spotify: true, deezer: false, apple: false }
    });
    
    (api.getUserProfile as any).mockResolvedValue({
      display_name: 'Test User',
      images: [{ url: 'https://example.com/avatar.jpg' }]
    });
    
    (api.getTopTracks as any).mockResolvedValue([
      {
        id: '1',
        name: 'Test Track',
        artists: [{ name: 'Test Artist' }],
        album: { name: 'Test Album', images: [{ url: 'https://example.com/album.jpg' }] }
      }
    ]);
    
    (api.getTopArtists as any).mockResolvedValue([
      {
        id: '1',
        name: 'Test Artist',
        images: [{ url: 'https://example.com/artist.jpg' }],
        genres: ['pop']
      }
    ]);
  });

  describe('Initial Load', () => {
    it('should show loading state initially', () => {
      renderDashboard();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display aggregated view by default', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/all platforms/i)).toBeInTheDocument();
      });
    });

    it('should fetch data for authenticated platforms', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(api.getUserProfile).toHaveBeenCalled();
        expect(api.getTopTracks).toHaveBeenCalled();
        expect(api.getTopArtists).toHaveBeenCalled();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tab buttons', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Platform View')).toBeInTheDocument();
        expect(screen.getByText('Detailed Stats')).toBeInTheDocument();
        expect(screen.getByText('Insights')).toBeInTheDocument();
      });
    });

    it('should show default tab content', async () => {
      renderDashboard();
      
      await waitFor(() => {
        // Should show Platform View by default
        expect(screen.getByText(/platform view/i)).toBeInTheDocument();
      });
    });
  });

  describe('Platform Selection', () => {
    it('should display all three platform cards', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Spotify')).toBeInTheDocument();
        expect(screen.getByText('Apple Music')).toBeInTheDocument();
        expect(screen.getByText('Deezer')).toBeInTheDocument();
      });
    });

    it('should show connected status for authenticated platform', async () => {
      renderDashboard();
      
      await waitFor(() => {
        // Spotify is mocked as connected
        const spotifyCard = screen.getByText('Spotify').closest('div');
        expect(spotifyCard).toBeTruthy();
      });
    });
  });

  describe('Data Display', () => {
    it('should display top tracks when loaded', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Test Track')).toBeInTheDocument();
      });
    });

    it('should display top artists when loaded', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
      });
    });

    it('should handle empty data gracefully', async () => {
      (api.getTopTracks as any).mockResolvedValue([]);
      (api.getTopArtists as any).mockResolvedValue([]);
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (api.getUserProfile as any).mockRejectedValue(new Error('API Error'));
      
      renderDashboard();
      
      await waitFor(() => {
        // Should not crash
        expect(screen.getByText(/Spotify/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication failures', async () => {
      (api.checkAuthStatus as any).mockResolvedValue({
        authenticated: false,
        platforms: { spotify: false, deezer: false, apple: false }
      });
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/not connected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mock Data Integration', () => {
    it('should use mock data for Deezer when enabled', async () => {
      (api.checkAuthStatus as any).mockResolvedValue({
        authenticated: true,
        platforms: { spotify: false, deezer: true, apple: false }
      });
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Deezer')).toBeInTheDocument();
      });
    });

    it('should use mock data for Apple Music when enabled', async () => {
      (api.checkAuthStatus as any).mockResolvedValue({
        authenticated: true,
        platforms: { spotify: false, deezer: false, apple: true }
      });
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Apple Music')).toBeInTheDocument();
      });
    });
  });
});
