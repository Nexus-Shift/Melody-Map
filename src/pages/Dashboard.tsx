import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Music, TrendingUp, Clock, User, Settings, ListMusic } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDisplayAvatarUrl, getAvatarFallback } from "@/lib/avatar";
import { apiClient, Profile } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import DefaultAvatar from "@/components/DefaultAvatar";
import { ExpandableMusicSection, TrackItem, ArtistItem, PlaylistItem } from "@/components/ExpandableMusicSection";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  // Get connections directly from user object (loaded during auth)
  const connections = user?.connectedPlatforms || [];
  const [actuallyConnected, setActuallyConnected] = useState<string[]>([]);
  const [connectionTesting, setConnectionTesting] = useState(false);
  const [spotifyData, setSpotifyData] = useState<{
    profile?: any;
    stats?: any;
    topTracks?: any[];
    topArtists?: any[];
    playlists?: any[];
    currentPlayback?: any;
  }>({});
  const [spotifyDataLoading, setSpotifyDataLoading] = useState(false);
  const [tracksTimeRange, setTracksTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [artistsTimeRange, setArtistsTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect unauthenticated users to signup tab
      navigate("/auth?tab=signup", { replace: true });
    }
  }, [user, loading, navigate]);

  // Fetch profile data and test actual connections
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { profile } = await apiClient.getProfile();
          setProfile(profile);
        } catch (error) {
          // Profile not found, user can create one later
        }
      }
    };

    const testConnections = async () => {
      if (user && connections.length > 0) {
        setConnectionTesting(true);
        
        try {
          // Test Spotify connection if it exists
          if (connections.includes('spotify')) {
            const result = await apiClient.testSpotifyConnection();
            
            if (result.connected) {
              setActuallyConnected(prev => [...prev.filter(p => p !== 'spotify'), 'spotify']);
              
              // Fetch Spotify data
              fetchSpotifyData();
            } else {
              setActuallyConnected(prev => prev.filter(p => p !== 'spotify'));
              
              // Show toast about connection issue
              if (result.reason) {
                toast({
                  title: "Spotify Connection Issue",
                  description: "Your Spotify connection needs to be refreshed. Please reconnect.",
                  variant: "destructive",
                });
              }
            }
          }
        } catch (error) {
          setActuallyConnected([]);
        } finally {
          setConnectionTesting(false);
        }
      } else {
        setActuallyConnected([]);
        setConnectionTesting(false);
      }
    };

    fetchProfile();
    testConnections();
  }, [user, connections]);

  const fetchSpotifyData = async () => {
    setSpotifyDataLoading(true);
    try {
      const [profileResult, statsResult, currentPlaybackResult] = await Promise.allSettled([
        apiClient.getSpotifyProfile(),
        apiClient.getSpotifyStats(),
        apiClient.getSpotifyCurrentPlayback()
      ]);

      const newSpotifyData: any = { ...spotifyData };
      
      if (profileResult.status === 'fulfilled') {
        newSpotifyData.profile = profileResult.value.profile;
      }
      
      if (statsResult.status === 'fulfilled') {
        newSpotifyData.stats = statsResult.value.stats;
      }
      
      if (currentPlaybackResult.status === 'fulfilled') {
        newSpotifyData.currentPlayback = currentPlaybackResult.value;
      }

      setSpotifyData(newSpotifyData);
      
      // Fetch initial tracks and artists with default time ranges
      await Promise.all([
        fetchSpotifyTracks(tracksTimeRange),
        fetchSpotifyArtists(artistsTimeRange),
        fetchSpotifyPlaylists()
      ]);
    } catch (error) {
      // Failed to fetch Spotify data, show error state in UI
    } finally {
      setSpotifyDataLoading(false);
    }
  };

  const fetchSpotifyTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
    try {
      const topTracksResult = await apiClient.getSpotifyTopTracks(timeRange, 50);
      setSpotifyData(prev => ({
        ...prev,
        topTracks: topTracksResult.tracks
      }));
    } catch (error) {
      console.error('Failed to fetch Spotify tracks:', error);
    }
  };

  const fetchSpotifyArtists = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
    try {
      const topArtistsResult = await apiClient.getSpotifyTopArtists(timeRange, 50);
      setSpotifyData(prev => ({
        ...prev,
        topArtists: topArtistsResult.artists
      }));
    } catch (error) {
      console.error('Failed to fetch Spotify artists:', error);
    }
  };

  const fetchSpotifyPlaylists = async () => {
    try {
      const playlistsResult = await apiClient.getSpotifyPlaylists(50);
      setSpotifyData(prev => ({
        ...prev,
        playlists: playlistsResult.playlists
      }));
    } catch (error) {
      console.error('Failed to fetch Spotify playlists:', error);
    }
  };

  const handleTracksTimeRangeChange = (newTimeRange: 'short_term' | 'medium_term' | 'long_term') => {
    setTracksTimeRange(newTimeRange);
    fetchSpotifyTracks(newTimeRange);
  };

  const handleArtistsTimeRangeChange = (newTimeRange: 'short_term' | 'medium_term' | 'long_term') => {
    setArtistsTimeRange(newTimeRange);
    fetchSpotifyArtists(newTimeRange);
  };

  // Handle Spotify connection callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected === 'spotify') {
      toast({
        title: "Spotify Connected!",
        description: "Your Spotify account has been successfully connected.",
      });
      
      // Clear the callback parameter
      setSearchParams({});
      
      // Refresh the page to get updated user data with new connections
      // This ensures the auth context gets the latest connection status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [searchParams, setSearchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleUploadSuccess = (avatarUrl: string) => {
    setShowUploadDialog(false);
    // Refresh profile data
    if (user) {
      apiClient.getProfile().then(({ profile }) => setProfile(profile)).catch(() => setProfile(null));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <Music className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarUrl = getDisplayAvatarUrl(profile?.avatar_url, user.email, 32, true);
  const fallbackText = getAvatarFallback(profile?.display_name, user.username, user.email);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-none text-left py-1">
                Melody Map
              </h1>
              <p className="text-sm text-muted-foreground leading-none mt-1 text-left">
                Welcome back,{" "}
                {user.displayName || user.username || user.email?.split("@")[0]}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? (
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={user.email} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DefaultAvatar size={32} />
                      </div>
                    )}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {fallbackText}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || user.displayName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Manage Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {connectionTesting ? (
          /* Testing Connections State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse mb-4">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying your connections...</h2>
            <p className="text-muted-foreground">
              Checking if your Spotify connection is still active
            </p>
          </div>
        ) : actuallyConnected.length === 0 ? (
          /* No Connections State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Music className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Oops! You're not connected to any platform</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Connect your music streaming platforms to start analyzing your listening habits and discover insights about your music taste.
            </p>
            
            {/* Connection Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/spotify`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Spotify</h3>
                  <p className="text-sm text-muted-foreground mb-4">Connect your Spotify account</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                    Connect Spotify
                  </Button>
                </div>
              </Card>

              <Card className="p-6 opacity-50">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Apple Music</h3>
                  <p className="text-sm text-muted-foreground mb-4">Coming soon</p>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </div>
              </Card>

              <Card className="p-6 opacity-50">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Deezer</h3>
                  <p className="text-sm text-muted-foreground mb-4">Coming soon</p>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Connected State */
          <div className="space-y-6">
            {/* Spotify Profile Section */}
            {actuallyConnected.includes('spotify') && (
              <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {spotifyData.profile?.images?.[0] ? (
                      <img 
                        src={spotifyData.profile.images[0].url} 
                        alt="Spotify Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-green-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span>
                          {spotifyData.profile?.display_name ? 
                            `${spotifyData.profile.display_name}'s Spotify` : 
                            'Connected to Spotify'
                          }
                        </span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </CardTitle>
                      <CardDescription>
                        {spotifyData.profile?.followers?.total ? 
                          `${spotifyData.profile.followers.total.toLocaleString()} followers` :
                          'Ready to analyze your music data'
                        }
                      </CardDescription>
                      {spotifyData.currentPlayback?.isPlaying && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          Currently playing: {spotifyData.currentPlayback.track?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Listening Time (Est.)</CardDescription>
                  <CardTitle className="text-2xl">
                    {spotifyDataLoading ? '...' : 
                     spotifyData.stats ? `${Math.round(spotifyData.stats.listeningTimeEstimate / 60)}h` : '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {spotifyDataLoading ? 'Loading...' : 
                     spotifyData.stats ? 'Based on top tracks' : 'Connect Spotify for data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top Tracks</CardDescription>
                  <CardTitle className="text-2xl">
                    {spotifyDataLoading ? '...' : 
                     spotifyData.stats ? spotifyData.stats.totalTracks : '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <Music className="w-4 h-4 inline mr-1" />
                    {spotifyDataLoading ? 'Loading...' : 
                     spotifyData.stats ? 'In your library' : 'Connect Spotify for data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top Genre</CardDescription>
                  <CardTitle className="text-2xl">
                    {spotifyDataLoading ? '...' : 
                     spotifyData.stats?.topGenres?.[0] ? 
                       spotifyData.stats.topGenres[0].genre.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 
                       '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {spotifyDataLoading ? 'Loading...' : 
                     spotifyData.stats?.topGenres?.[0] ? `${spotifyData.stats.topGenres[0].count} artists` : 'Connect Spotify for data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top Artists</CardDescription>
                  <CardTitle className="text-2xl">
                    {spotifyDataLoading ? '...' : 
                     spotifyData.stats ? spotifyData.stats.totalArtists : '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <User className="w-4 h-4 inline mr-1" />
                    {spotifyDataLoading ? 'Loading...' : 
                     spotifyData.stats ? 'In your rotation' : 'Connect Spotify for data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Playlists</CardDescription>
                  <CardTitle className="text-2xl">
                    {spotifyDataLoading ? '...' : 
                     spotifyData.playlists ? spotifyData.playlists.length : '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <ListMusic className="w-4 h-4 inline mr-1" />
                    {spotifyDataLoading ? 'Loading...' : 
                     spotifyData.playlists ? 'Created & followed' : 'Connect Spotify for data'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Tracks */}
            <ExpandableMusicSection
              title="Your Top Tracks"
              description="Your most played songs"
              icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
              data={spotifyData.topTracks || []}
              loading={spotifyDataLoading}
              renderItem={(track: any, index: number) => (
                <TrackItem key={track.id} track={track} index={index} />
              )}
              initialLimit={5}
              timeRange={tracksTimeRange}
              onTimeRangeChange={handleTracksTimeRangeChange}
              showTimeSelector={true}
              emptyMessage="No top tracks data available"
            />

            {/* Top Artists */}
            <ExpandableMusicSection
              title="Your Top Artists"
              description="Artists you listen to the most"
              icon={<User className="w-6 h-6 text-primary-foreground" />}
              data={spotifyData.topArtists || []}
              loading={spotifyDataLoading}
              renderItem={(artist: any, index: number) => (
                <ArtistItem key={artist.id} artist={artist} index={index} />
              )}
              initialLimit={5}
              timeRange={artistsTimeRange}
              onTimeRangeChange={handleArtistsTimeRangeChange}
              showTimeSelector={true}
              emptyMessage="No top artists data available"
            />

            {/* Top Playlists */}
            <ExpandableMusicSection
              title="Your Playlists"
              description="Your created and followed playlists"
              icon={<ListMusic className="w-6 h-6 text-primary-foreground" />}
              data={spotifyData.playlists || []}
              loading={spotifyDataLoading}
              renderItem={(playlist: any, index: number) => (
                <PlaylistItem key={playlist.id} playlist={playlist} index={index} />
              )}
              initialLimit={5}
              showTimeSelector={false}
              emptyMessage="No playlists found"
            />
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
          </DialogHeader>
          <AvatarUpload 
            currentAvatarUrl={profile?.avatar_url}
            fallbackText={fallbackText}
            onUploadSuccess={handleUploadSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
