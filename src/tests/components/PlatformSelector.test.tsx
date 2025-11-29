import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformSelector } from '@/components/PlatformSelector';

describe('PlatformSelector', () => {
  const mockOnSelectPlatform = () => {};

  it('should render all three platform options', () => {
    render(
      <PlatformSelector
        selectedPlatform={null}
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={[]}
      />
    );
    
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('Apple Music')).toBeInTheDocument();
    expect(screen.getByText('Deezer')).toBeInTheDocument();
  });

  it('should show "Not connected" for disconnected platforms', () => {
    render(
      <PlatformSelector
        selectedPlatform={null}
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={['spotify']}
      />
    );
    
    const notConnectedElements = screen.getAllByText('Not connected');
    expect(notConnectedElements).toHaveLength(2); // Apple Music and Deezer
  });

  it('should show "Selected" for the selected platform', () => {
    render(
      <PlatformSelector
        selectedPlatform="spotify"
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={['spotify', 'deezer']}
      />
    );
    
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('should show "Click to view" for connected but not selected platforms', () => {
    render(
      <PlatformSelector
        selectedPlatform="spotify"
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={['spotify', 'deezer']}
      />
    );
    
    expect(screen.getByText('Click to view')).toBeInTheDocument();
  });

  it('should apply correct styling for connected platforms', () => {
    const { container } = render(
      <PlatformSelector
        selectedPlatform={null}
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={['spotify']}
      />
    );
    
    const cards = container.querySelectorAll('[class*="cursor-pointer"]');
    expect(cards).toHaveLength(3);
  });

  it('should handle all platform selection', () => {
    render(
      <PlatformSelector
        selectedPlatform="all"
        onSelectPlatform={mockOnSelectPlatform}
        connectedPlatforms={['spotify', 'deezer', 'apple']}
      />
    );
    
    // Should render without crashing
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });
});
