import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ComparisonPanel } from '@/components/ComparisonPanel';

describe('ComparisonPanel', () => {
  it('should render nothing when less than 2 platforms', () => {
    const { container } = render(<ComparisonPanel platforms={['spotify']} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render comparison panel with multiple platforms', () => {
    render(<ComparisonPanel platforms={['spotify', 'deezer']} />);
    
    expect(screen.getByText('Multi-Platform Insights')).toBeInTheDocument();
    expect(screen.getByText(/Your music journey across 2 platforms/)).toBeInTheDocument();
  });

  it('should display all connected platforms', () => {
    render(<ComparisonPanel platforms={['spotify', 'deezer', 'apple']} />);
    
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('Deezer')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('should show multi-platform advantages', () => {
    render(<ComparisonPanel platforms={['spotify', 'deezer']} />);
    
    expect(screen.getByText('Your Multi-Platform Advantage')).toBeInTheDocument();
    expect(screen.getByText(/Broader music catalog and exclusive releases/)).toBeInTheDocument();
    expect(screen.getByText(/Multiple recommendation algorithms/)).toBeInTheDocument();
  });

  it('should display correct platform count', () => {
    const { rerender } = render(<ComparisonPanel platforms={['spotify', 'deezer']} />);
    expect(screen.getByText(/2 platforms/)).toBeInTheDocument();
    
    rerender(<ComparisonPanel platforms={['spotify', 'deezer', 'apple']} />);
    expect(screen.getByText(/3 platforms/)).toBeInTheDocument();
  });

  it('should show all insight cards', () => {
    render(<ComparisonPanel platforms={['spotify', 'deezer']} />);
    
    expect(screen.getByText('Multi-Platform User')).toBeInTheDocument();
    expect(screen.getByText('Cross-Platform Listener')).toBeInTheDocument();
    expect(screen.getByText('Discovery Optimized')).toBeInTheDocument();
  });
});
