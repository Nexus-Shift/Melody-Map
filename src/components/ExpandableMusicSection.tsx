import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink, Music, ListMusic, Disc3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ExpandableSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: any[];
  loading: boolean;
  renderItem: (item: any, index: number) => React.ReactNode;
  initialLimit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
  onTimeRangeChange?: (timeRange: 'short_term' | 'medium_term' | 'long_term') => void;
  showTimeSelector?: boolean;
  emptyMessage?: string;
}

export const ExpandableMusicSection: React.FC<ExpandableSectionProps> = ({
  title,
  description,
  icon,
  data,
  loading,
  renderItem,
  initialLimit = 5,
  timeRange = 'medium_term',
  onTimeRangeChange,
  showTimeSelector = false,
  emptyMessage = 'No data available'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [limit, setLimit] = useState(initialLimit);

  const displayData = isExpanded ? data.slice(0, limit) : data.slice(0, initialLimit);
  const hasMore = data.length > (isExpanded ? limit : initialLimit);

  const timeRangeLabels = {
    short_term: 'Last 4 weeks',
    medium_term: 'Last 6 months',
    long_term: 'All time'
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && limit < data.length) {
      setLimit(Math.min(limit + 10, data.length));
    }
  };

  const handleLoadMore = () => {
    setLimit(Math.min(limit + 10, data.length));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                {description}
                {showTimeSelector && timeRange && ` - ${timeRangeLabels[timeRange]}`}
              </CardDescription>
            </div>
          </div>
          
          {showTimeSelector && onTimeRangeChange && (
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short_term">Last 4 weeks</SelectItem>
                <SelectItem value="medium_term">Last 6 months</SelectItem>
                <SelectItem value="long_term">All time</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(initialLimit)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayData.map((item, index) => renderItem(item, index))}
            </div>

            {hasMore && (
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleExpandToggle}
                  className="w-full justify-center"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More ({data.length - initialLimit} more)
                    </>
                  )}
                </Button>

                {isExpanded && limit < data.length && (
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    className="w-full"
                  >
                    Load More ({Math.min(10, data.length - limit)} more)
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Track Item Component
export const TrackItem: React.FC<{ track: any; index: number }> = ({ track, index }) => (
  <div className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium text-muted-foreground">
      {index + 1}
    </div>
    
    {track.album?.images?.[0] && (
      <img 
        src={track.album.images[0].url} 
        alt={track.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
    )}
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium truncate">{track.name}</p>
        {track.external_urls?.spotify && (
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-4 h-4 text-green-600 hover:text-green-700" />
          </a>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">
        {track.artists?.map((artist: any) => artist.name).join(', ')}
      </p>
    </div>
    
    <div className="flex flex-col items-end text-sm text-muted-foreground">
      <Badge variant="secondary" className="text-xs">
        {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
      </Badge>
      {track.popularity && (
        <span className="text-xs mt-1">{track.popularity}% popular</span>
      )}
    </div>
  </div>
);

// Artist Item Component
export const ArtistItem: React.FC<{ artist: any; index: number }> = ({ artist, index }) => (
  <div className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium text-muted-foreground">
      {index + 1}
    </div>
    
    {artist.images?.[0] && (
      <img 
        src={artist.images[0].url} 
        alt={artist.name}
        className="w-12 h-12 rounded-full object-cover"
      />
    )}
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium truncate">{artist.name}</p>
        {artist.external_urls?.spotify && (
          <a
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-4 h-4 text-green-600 hover:text-green-700" />
          </a>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">
        {artist.genres?.slice(0, 3).join(', ')}
      </p>
    </div>
    
    <div className="flex flex-col items-end text-sm text-muted-foreground">
      <Badge variant="secondary" className="text-xs">
        {artist.followers?.total?.toLocaleString()} followers
      </Badge>
      {artist.popularity && (
        <span className="text-xs mt-1">{artist.popularity}% popular</span>
      )}
    </div>
  </div>
);

// Playlist Item Component
export const PlaylistItem: React.FC<{ playlist: any; index: number }> = ({ playlist, index }) => (
  <div className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
    {playlist.images?.[0] ? (
      <img 
        src={playlist.images[0].url} 
        alt={playlist.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
    ) : (
      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
        <ListMusic className="w-6 h-6 text-muted-foreground" />
      </div>
    )}
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium truncate">{playlist.name}</p>
        {playlist.external_urls?.spotify && (
          <a
            href={playlist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-4 h-4 text-green-600 hover:text-green-700" />
          </a>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">
        {playlist.owner?.display_name && `By ${playlist.owner.display_name} • `}
        {playlist.tracks?.total} tracks
      </p>
    </div>
    
    <div className="flex flex-col items-end text-sm text-muted-foreground">
      {playlist.public !== undefined && (
        <Badge variant={playlist.public ? "default" : "secondary"} className="text-xs">
          {playlist.public ? 'Public' : 'Private'}
        </Badge>
      )}
    </div>
  </div>
);

// Album Item Component
export const AlbumItem: React.FC<{ album: any; index: number }> = ({ album, index }) => (
  <div className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
    {album.images?.[0] ? (
      <img 
        src={album.images[0].url} 
        alt={album.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
    ) : (
      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
        <Disc3 className="w-6 h-6 text-muted-foreground" />
      </div>
    )}
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium truncate">{album.name}</p>
        {album.external_urls?.spotify && (
          <a
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-4 h-4 text-green-600 hover:text-green-700" />
          </a>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">
        {album.artists?.map((artist: any) => artist.name).join(', ')}
      </p>
    </div>
    
    <div className="flex flex-col items-end text-sm text-muted-foreground">
      <Badge variant="secondary" className="text-xs">
        {album.total_tracks} tracks
      </Badge>
      {album.release_date && (
        <span className="text-xs mt-1">{new Date(album.release_date).getFullYear()}</span>
      )}
    </div>
  </div>
);