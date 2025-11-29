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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Music, TrendingUp, Clock, User, Settings, Calendar, Headphones, Heart, BarChart3, PieChart, Activity, Award, Zap, Target } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useAuth } from "@/hooks/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDisplayAvatarUrl, getAvatarFallback } from "@/lib/avatar";
import { apiClient, Profile } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import DefaultAvatar from "@/components/DefaultAvatar";
import { PlatformSelector } from "@/components/PlatformSelector";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { OverallListeningPanel } from "@/components/OverallListeningPanel";
import {
  mockDeezerProfile,
  mockDeezerTracks,
  mockDeezerArtists,
  mockDeezerStats,
  mockAppleMusicProfile,
  mockAppleMusicTracks,
  mockAppleMusicArtists,
  mockAppleMusicStats,
  useMockDeezerData,
  useMockAppleMusicData,
} from "@/lib/mockData";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"spotify" | "apple" | "deezer" | "all" | null>("all");
  // Get connections directly from user object (loaded during auth)
  const connections = user?.connectedPlatforms || [];
  const [actuallyConnected, setActuallyConnected] = useState<string[]>([]);
  const [connectionTesting, setConnectionTesting] = useState(false);
  const [spotifyData, setSpotifyData] = useState<{
    profile?: any;
    stats?: any;
    topTracks?: any[];
    topArtists?: any[];
    currentPlayback?: any;
  }>({});
  const [spotifyDataLoading, setSpotifyDataLoading] = useState(false);
  const [deezerData, setDeezerData] = useState<{
    profile?: any;
    stats?: any;
    tracks?: any[];
    artists?: any[];
    albums?: any[];
  }>({});
  const [deezerDataLoading, setDeezerDataLoading] = useState(false);
  const [appleMusicData, setAppleMusicData] = useState<{
    profile?: any;
    stats?: any;
    tracks?: any[];
    artists?: any[];
  }>({});
  const [appleMusicDataLoading, setAppleMusicDataLoading] = useState(false);
  
  // Check if we should use mock data
  const shouldUseMockDeezer = useMockDeezerData();
  const shouldUseMockAppleMusic = useMockAppleMusicData();
  
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

          // Test Deezer connection if it exists (or use mock data)
          if (connections.includes('deezer') || shouldUseMockDeezer) {
            if (shouldUseMockDeezer) {
              // Use mock data for Deezer
              setActuallyConnected(prev => [...prev.filter(p => p !== 'deezer'), 'deezer']);
              fetchDeezerData();
            } else {
              const result = await apiClient.testDeezerConnection();
              
              if (result.connected) {
                setActuallyConnected(prev => [...prev.filter(p => p !== 'deezer'), 'deezer']);
                
                // Fetch Deezer data
                fetchDeezerData();
              } else {
                setActuallyConnected(prev => prev.filter(p => p !== 'deezer'));
                
                // Show toast about connection issue
                if (result.reason) {
                  toast({
                    title: "Deezer Connection Issue",
                    description: "Your Deezer connection needs to be refreshed. Please reconnect.",
                    variant: "destructive",
                  });
                }
              }
            }
          }

          // Always use mock data for Apple Music (API is paid)
          if (shouldUseMockAppleMusic) {
            setActuallyConnected(prev => [...prev.filter(p => p !== 'apple'), 'apple']);
            fetchAppleMusicData();
          }
        } catch (error) {
          setActuallyConnected([]);
        } finally {
          setConnectionTesting(false);
        }
      } else {
        // Even without connections, load mock data
        if (shouldUseMockDeezer) {
          setActuallyConnected(prev => {
            if (!prev.includes('deezer')) {
              return [...prev, 'deezer'];
            }
            return prev;
          });
          fetchDeezerData();
        }
        if (shouldUseMockAppleMusic) {
          setActuallyConnected(prev => {
            if (!prev.includes('apple')) {
              return [...prev, 'apple'];
            }
            return prev;
          });
          fetchAppleMusicData();
        }
        setConnectionTesting(false);
      }
    };

    fetchProfile();
    testConnections();
  }, [user, connections]);

  const fetchSpotifyData = async () => {
    setSpotifyDataLoading(true);
    try {
      const [profileResult, statsResult, topTracksResult, topArtistsResult, currentPlaybackResult] = await Promise.allSettled([
        apiClient.getSpotifyProfile(),
        apiClient.getSpotifyStats(),
        apiClient.getSpotifyTopTracks('medium_term', 5),
        apiClient.getSpotifyTopArtists('medium_term', 5),
        apiClient.getSpotifyCurrentPlayback()
      ]);

      const newSpotifyData: any = {};
      
      if (profileResult.status === 'fulfilled') {
        newSpotifyData.profile = profileResult.value.profile;
      }
      
      if (statsResult.status === 'fulfilled') {
        newSpotifyData.stats = statsResult.value.stats;
      }
      
      if (topTracksResult.status === 'fulfilled') {
        newSpotifyData.topTracks = topTracksResult.value.tracks;
      }
      
      if (topArtistsResult.status === 'fulfilled') {
        newSpotifyData.topArtists = topArtistsResult.value.artists;
      }
      
      if (currentPlaybackResult.status === 'fulfilled') {
        newSpotifyData.currentPlayback = currentPlaybackResult.value;
      }

      setSpotifyData(newSpotifyData);
    } catch (error) {
      // Failed to fetch Spotify data, show error state in UI
    } finally {
      setSpotifyDataLoading(false);
    }
  };

  const fetchDeezerData = async () => {
    setDeezerDataLoading(true);
    try {
      // Use mock data if credentials not configured
      if (shouldUseMockDeezer) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeezerData({
          profile: mockDeezerProfile,
          tracks: mockDeezerTracks,
          artists: mockDeezerArtists,
          stats: mockDeezerStats,
        });
        setDeezerDataLoading(false);
        return;
      }

      const [profileResult, statsResult, tracksResult, artistsResult, albumsResult] = await Promise.allSettled([
        apiClient.getDeezerProfile(),
        apiClient.getDeezerStats(),
        apiClient.getDeezerTracks(5),
        apiClient.getDeezerArtists(5),
        apiClient.getDeezerAlbums(5)
      ]);

      const newDeezerData: any = {};
      
      if (profileResult.status === 'fulfilled') {
        newDeezerData.profile = profileResult.value.profile;
      }
      
      if (statsResult.status === 'fulfilled') {
        newDeezerData.stats = statsResult.value.stats;
      }
      
      if (tracksResult.status === 'fulfilled') {
        newDeezerData.tracks = tracksResult.value.tracks;
      }
      
      if (artistsResult.status === 'fulfilled') {
        newDeezerData.artists = artistsResult.value.artists;
      }
      
      if (albumsResult.status === 'fulfilled') {
        newDeezerData.albums = albumsResult.value.albums;
      }

      setDeezerData(newDeezerData);
    } catch (error) {
      // Failed to fetch Deezer data, show error state in UI
    } finally {
      setDeezerDataLoading(false);
    }
  };

  const fetchAppleMusicData = async () => {
    setAppleMusicDataLoading(true);
    try {
      // Always use mock data for Apple Music (API is paid)
      await new Promise(resolve => setTimeout(resolve, 500));
      setAppleMusicData({
        profile: mockAppleMusicProfile,
        tracks: mockAppleMusicTracks,
        artists: mockAppleMusicArtists,
        stats: mockAppleMusicStats,
      });
    } catch (error) {
      console.error('Failed to fetch Apple Music data:', error);
    } finally {
      setAppleMusicDataLoading(false);
    }
  };

  // Handle platform connection callbacks
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else if (connected === 'deezer') {
      toast({
        title: "Deezer Connected!",
        description: "Your Deezer account has been successfully connected.",
      });
      
      // Clear the callback parameter
      setSearchParams({});
      
      // Refresh the page to get updated user data with new connections
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
              Checking if your platform connections are still active
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

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/deezer`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Deezer</h3>
                  <p className="text-sm text-muted-foreground mb-4">Connect your Deezer account</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full">
                    Connect Deezer
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Connected State - Multi-Platform Dashboard */
          <div className="space-y-8">
            {/* Platform Selector */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Select a Platform</h2>
              <PlatformSelector
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
                connectedPlatforms={actuallyConnected}
              />
            </div>

            {/* Platform-Specific Content */}
            {selectedPlatform && selectedPlatform !== 'all' ? (
              <Tabs defaultValue="overall" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                  <TabsTrigger value="overview">Platform View</TabsTrigger>
                  <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Overall Tab - Aggregated Data from All Platforms */}
                <TabsContent value="overall" className="space-y-6 mt-6">
                  {/* Overall Header */}
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Your Complete Music Profile
                    </h2>
                    <p className="text-muted-foreground">
                      Aggregated data from {actuallyConnected.length} platform{actuallyConnected.length !== 1 ? 's' : ''}
                      {actuallyConnected.length > 0 && ` (${actuallyConnected.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')})`}
                      {shouldUseMockDeezer && actuallyConnected.includes('deezer') && (
                        <span className="ml-2 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">Deezer: Mock Data</span>
                      )}
                      {shouldUseMockAppleMusic && actuallyConnected.includes('apple') && (
                        <span className="ml-2 text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded">Apple Music: Mock Data</span>
                      )}
                    </p>
                  </div>

                  {(() => {
                    // Calculate overall statistics
                    const totalListeningTime = (
                      (spotifyData.stats?.listeningTimeEstimate || 0) +
                      (deezerData.stats?.listeningTimeEstimate || 0) +
                      (appleMusicData.stats?.listeningTimeEstimate || 0)
                    );
                    const totalTracks = (
                      (spotifyData.stats?.totalTracks || 0) +
                      (deezerData.stats?.totalTracks || 0) +
                      (appleMusicData.stats?.totalTracks || 0)
                    );
                    const totalArtists = (
                      (spotifyData.stats?.totalArtists || 0) +
                      (deezerData.stats?.totalArtists || 0) +
                      (appleMusicData.stats?.totalArtists || 0)
                    );
                    const totalAlbums = (
                      (spotifyData.stats?.totalAlbums || 0) +
                      (deezerData.stats?.totalAlbums || 0)
                    );

                    // Aggregate top genres from all platforms
                    const genreMap = new Map<string, number>();
                    [spotifyData.stats?.topGenres, deezerData.stats?.topGenres, appleMusicData.stats?.topGenres]
                      .filter(Boolean)
                      .forEach(genres => {
                        genres?.forEach((g: any) => {
                          const genre = g.genre.toLowerCase();
                          genreMap.set(genre, (genreMap.get(genre) || 0) + g.count);
                        });
                      });
                    const topGenres = Array.from(genreMap.entries())
                      .map(([genre, count]) => ({ genre, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5);

                    const isLoading = spotifyDataLoading || deezerDataLoading || appleMusicDataLoading;

                    return (
                      <>
                        {/* Overall Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription>Total Listening Time</CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : `${Math.round(totalListeningTime / 60)}h`}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {isLoading ? 'Loading...' : 'Across all platforms'}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription>Total Tracks</CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : totalTracks}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                <Music className="w-4 h-4 inline mr-1" />
                                {isLoading ? 'Loading...' : 'In your libraries'}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription>Total Artists</CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : totalArtists}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                <User className="w-4 h-4 inline mr-1" />
                                {isLoading ? 'Loading...' : 'Unique artists'}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription>Total Albums</CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : totalAlbums || '--'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                <Music className="w-4 h-4 inline mr-1" />
                                {isLoading ? 'Loading...' : 'In collections'}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Top Genres Across All Platforms */}
                        {topGenres.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Top Genres Across All Platforms</CardTitle>
                              <CardDescription>
                                Your most listened genres from all connected services
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {topGenres.map((genre, index) => (
                                  <div key={genre.genre} className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground mr-3">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium capitalize">{genre.genre}</span>
                                        <span className="text-sm text-muted-foreground">{genre.count} artists</span>
                                      </div>
                                      <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                          className="bg-gradient-primary h-2 rounded-full transition-all"
                                          style={{ width: `${(genre.count / topGenres[0].count) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Platform Breakdown */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Platform Breakdown</CardTitle>
                            <CardDescription>Your listening statistics by platform</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                              {/* Spotify Platform Card */}
                              {actuallyConnected.includes('spotify') && spotifyData.stats && (
                                <Card className="bg-green-500/5 border-green-500/20">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <Music className="w-4 h-4 text-white" />
                                      </div>
                                      Spotify
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Tracks:</span>
                                      <span className="font-medium">{spotifyData.stats.totalTracks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Artists:</span>
                                      <span className="font-medium">{spotifyData.stats.totalArtists}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Time:</span>
                                      <span className="font-medium">{Math.round(spotifyData.stats.listeningTimeEstimate / 60)}h</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Deezer Platform Card */}
                              {actuallyConnected.includes('deezer') && deezerData.stats && (
                                <Card className="bg-orange-500/5 border-orange-500/20">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                        <Music className="w-4 h-4 text-white" />
                                      </div>
                                      Deezer
                                      {shouldUseMockDeezer && (
                                        <span className="ml-1 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">Mock</span>
                                      )}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Tracks:</span>
                                      <span className="font-medium">{deezerData.stats.totalTracks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Artists:</span>
                                      <span className="font-medium">{deezerData.stats.totalArtists}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Time:</span>
                                      <span className="font-medium">{Math.round(deezerData.stats.listeningTimeEstimate / 60)}h</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Apple Music Platform Card */}
                              {actuallyConnected.includes('apple') && appleMusicData.stats && (
                                <Card className="bg-pink-500/5 border-pink-500/20">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                        <Music className="w-4 h-4 text-white" />
                                      </div>
                                      Apple Music
                                      <span className="ml-1 text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded">Mock</span>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Tracks:</span>
                                      <span className="font-medium">{appleMusicData.stats.totalTracks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Artists:</span>
                                      <span className="font-medium">{appleMusicData.stats.totalArtists}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Time:</span>
                                      <span className="font-medium">{Math.round(appleMusicData.stats.listeningTimeEstimate / 60)}h</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {selectedPlatform === 'spotify' && actuallyConnected.includes('spotify') ? (
                    <>
                      {/* Spotify Profile Section */}
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

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      </div>
                    </>
                  ) : selectedPlatform === 'deezer' && actuallyConnected.includes('deezer') ? (
                    <>
                      {/* Deezer Profile Section */}
                      <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            {deezerData.profile?.picture_medium ? (
                              <img 
                                src={deezerData.profile.picture_medium} 
                                alt="Deezer Profile"
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <Music className="w-8 h-8 text-orange-400" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <span>
                                  {deezerData.profile?.name ? 
                                    `${deezerData.profile.name}'s Deezer` : 
                                    'Connected to Deezer'
                                  }
                                </span>
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              </CardTitle>
                              <CardDescription>
                                {deezerData.profile?.country ? 
                                  `Country: ${deezerData.profile.country}` :
                                  'Ready to analyze your music data'
                                }
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Listening Time (Est.)</CardDescription>
                            <CardTitle className="text-2xl">
                              {deezerDataLoading ? '...' : 
                              deezerData.stats ? `${Math.round(deezerData.stats.listeningTimeEstimate / 60)}h` : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              {deezerDataLoading ? 'Loading...' : 
                              deezerData.stats ? 'Based on favorite tracks' : 'Connect Deezer for data'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Favorite Tracks</CardDescription>
                            <CardTitle className="text-2xl">
                              {deezerDataLoading ? '...' : 
                              deezerData.stats ? deezerData.stats.totalTracks : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <Music className="w-4 h-4 inline mr-1" />
                              {deezerDataLoading ? 'Loading...' : 
                              deezerData.stats ? 'In your library' : 'Connect Deezer for data'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Albums</CardDescription>
                            <CardTitle className="text-2xl">
                              {deezerDataLoading ? '...' : 
                              deezerData.stats?.totalAlbums || '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              {deezerDataLoading ? 'Loading...' : 
                              deezerData.stats ? 'Favorite albums' : 'Connect Deezer for data'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Favorite Artists</CardDescription>
                            <CardTitle className="text-2xl">
                              {deezerDataLoading ? '...' : 
                              deezerData.stats ? deezerData.stats.totalArtists : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <User className="w-4 h-4 inline mr-1" />
                              {deezerDataLoading ? 'Loading...' : 
                              deezerData.stats ? 'In your collection' : 'Connect Deezer for data'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : selectedPlatform === 'apple' && actuallyConnected.includes('apple') ? (
                    <>
                      {/* Apple Music Profile Section */}
                      <Card className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border-pink-500/20">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            {appleMusicData.profile?.avatar ? (
                              <img 
                                src={appleMusicData.profile.avatar} 
                                alt="Apple Music Profile"
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center">
                                <Music className="w-8 h-8 text-pink-400" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <span>
                                  {appleMusicData.profile?.name ? 
                                    `${appleMusicData.profile.name}'s Apple Music` : 
                                    'Connected to Apple Music'
                                  }
                                </span>
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                              </CardTitle>
                              <CardDescription>
                                {shouldUseMockAppleMusic ? (
                                  <span className="text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded">Using Mock Data</span>
                                ) : appleMusicData.profile?.membershipType ? 
                                  `${appleMusicData.profile.membershipType} Member` :
                                  'Ready to analyze your music data'
                                }
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Listening Time (Est.)</CardDescription>
                            <CardTitle className="text-2xl">
                              {appleMusicDataLoading ? '...' : 
                              appleMusicData.stats ? `${Math.round(appleMusicData.stats.listeningTimeEstimate / 60)}h` : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              {appleMusicDataLoading ? 'Loading...' : 
                              appleMusicData.stats ? 'Based on your library' : 'No data available'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Library Tracks</CardDescription>
                            <CardTitle className="text-2xl">
                              {appleMusicDataLoading ? '...' : 
                              appleMusicData.stats ? appleMusicData.stats.totalTracks : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <Music className="w-4 h-4 inline mr-1" />
                              {appleMusicDataLoading ? 'Loading...' : 
                              appleMusicData.stats ? 'In your library' : 'No data available'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Favorite Artists</CardDescription>
                            <CardTitle className="text-2xl">
                              {appleMusicDataLoading ? '...' : 
                              appleMusicData.stats ? appleMusicData.stats.totalArtists : '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <User className="w-4 h-4 inline mr-1" />
                              {appleMusicDataLoading ? 'Loading...' : 
                              appleMusicData.stats ? 'Following' : 'No data available'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Top Genres</CardDescription>
                            <CardTitle className="text-2xl">
                              {appleMusicDataLoading ? '...' : 
                              appleMusicData.stats?.topGenres?.length || '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              {appleMusicDataLoading ? 'Loading...' : 
                              appleMusicData.stats?.topGenres?.length ? 'Unique genres' : 'No data available'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Genres */}
                      {appleMusicData.stats?.topGenres && appleMusicData.stats.topGenres.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Your Top Genres</CardTitle>
                            <CardDescription>
                              Music genres you listen to the most
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {appleMusicData.stats.topGenres.slice(0, 5).map((genre: any, index: number) => (
                                <div key={genre.genre} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-sm font-bold text-white">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium capitalize">{genre.genre}</span>
                                      <span className="text-sm text-muted-foreground">{genre.count} artists</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(genre.count / appleMusicData.stats.topGenres[0].count) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Favorite Tracks */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Your Favorite Tracks
                          </CardTitle>
                          <CardDescription>
                            Your most loved songs on Apple Music
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {appleMusicDataLoading ? (
                            <div className="text-center py-8">
                              <Music className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite tracks...</p>
                            </div>
                          ) : appleMusicData.tracks?.length ? (
                            <div className="space-y-3">
                              {appleMusicData.tracks.slice(0, 5).map((track: any, index: number) => (
                                <div key={track.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-sm font-medium text-white">
                                    {index + 1}
                                  </div>
                                  {track.artwork && (
                                    <img 
                                      src={track.artwork} 
                                      alt={track.album}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {track.artist}
                                    </p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(track.duration / 60)}:
                                    {(track.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite tracks data available</p>
                              <p className="text-sm">Add tracks to your Apple Music library</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Favorite Artists */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Favorite Artists
                          </CardTitle>
                          <CardDescription>
                            Artists you love on Apple Music
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {appleMusicDataLoading ? (
                            <div className="text-center py-8">
                              <User className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite artists...</p>
                            </div>
                          ) : appleMusicData.artists?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {appleMusicData.artists.slice(0, 4).map((artist: any) => (
                                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20">
                                  {artist.artwork && (
                                    <img 
                                      src={artist.artwork} 
                                      alt={artist.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{artist.name}</p>
                                    {artist.genres && artist.genres.length > 0 && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {artist.genres.slice(0, 2).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite artists data available</p>
                              <p className="text-sm">Follow artists on Apple Music</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Select a Platform</h3>
                        <p className="text-muted-foreground">
                          Choose a connected platform to view your stats
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="space-y-6 mt-6">
                  {selectedPlatform === 'spotify' && actuallyConnected.includes('spotify') ? (
                    <>
                      {/* Top Tracks */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Your Top Tracks
                          </CardTitle>
                          <CardDescription>
                            Your most played songs this month
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {spotifyDataLoading ? (
                            <div className="text-center py-8">
                              <Music className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your top tracks...</p>
                            </div>
                          ) : spotifyData.topTracks?.length ? (
                            <div className="space-y-3">
                              {spotifyData.topTracks.slice(0, 5).map((track: any, index: number) => (
                                <div key={track.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  {track.album.images?.[0] && (
                                    <img 
                                      src={track.album.images[0].url} 
                                      alt={track.album.name}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {track.artists.map((artist: any) => artist.name).join(', ')}
                                    </p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(track.duration_ms / 60000)}:
                                    {Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No top tracks data available</p>
                              <p className="text-sm">Listen to more music to see your favorites</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Top Artists */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Top Artists
                          </CardTitle>
                          <CardDescription>
                            Artists you listen to the most
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {spotifyDataLoading ? (
                            <div className="text-center py-8">
                              <User className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your top artists...</p>
                            </div>
                          ) : spotifyData.topArtists?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {spotifyData.topArtists.slice(0, 4).map((artist: any) => (
                                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                  {artist.images?.[0] && (
                                    <img 
                                      src={artist.images[0].url} 
                                      alt={artist.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{artist.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {artist.followers.total.toLocaleString()} followers
                                    </p>
                                    {artist.genres.length > 0 && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {artist.genres.slice(0, 2).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No top artists data available</p>
                              <p className="text-sm">Listen to more music to see your favorites</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : selectedPlatform === 'deezer' && actuallyConnected.includes('deezer') ? (
                    <>
                      {/* Favorite Tracks */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Your Favorite Tracks
                          </CardTitle>
                          <CardDescription>
                            Your most loved songs on Deezer
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {deezerDataLoading ? (
                            <div className="text-center py-8">
                              <Music className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite tracks...</p>
                            </div>
                          ) : deezerData.tracks?.length ? (
                            <div className="space-y-3">
                              {deezerData.tracks.slice(0, 5).map((track: any, index: number) => (
                                <div key={track.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  {track.album.cover_medium && (
                                    <img 
                                      src={track.album.cover_medium} 
                                      alt={track.album.title}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.title}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {track.artist.name}
                                    </p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(track.duration / 60)}:
                                    {(track.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite tracks data available</p>
                              <p className="text-sm">Add more tracks to your favorites</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Favorite Artists */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Favorite Artists
                          </CardTitle>
                          <CardDescription>
                            Artists you love the most
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {deezerDataLoading ? (
                            <div className="text-center py-8">
                              <User className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite artists...</p>
                            </div>
                          ) : deezerData.artists?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {deezerData.artists.slice(0, 4).map((artist: any) => (
                                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                  {artist.picture_medium && (
                                    <img 
                                      src={artist.picture_medium} 
                                      alt={artist.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{artist.name}</p>
                                    {artist.nb_fan && (
                                      <p className="text-sm text-muted-foreground">
                                        {artist.nb_fan.toLocaleString()} fans
                                      </p>
                                    )}
                                    {artist.nb_album && (
                                      <p className="text-xs text-muted-foreground">
                                        {artist.nb_album} albums
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite artists data available</p>
                              <p className="text-sm">Add more artists to your favorites</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : selectedPlatform === 'deezer' && actuallyConnected.includes('deezer') ? (
                    <>
                      {/* Deezer Stats with Mock Badge */}
                      {shouldUseMockDeezer && (
                        <Card className="bg-orange-500/10 border-orange-500/20">
                          <CardContent className="py-4 flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                            <Music className="w-5 h-5" />
                            <span className="font-medium">Using Mock Data - Connect Real Deezer Account for Live Stats</span>
                          </CardContent>
                        </Card>
                      )}

                      {/* Listening Overview with Charts */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Genre Distribution Pie Chart */}
                        {deezerData.stats?.topGenres && deezerData.stats.topGenres.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <PieChart className="w-5 h-5" />
                                Genre Distribution
                              </CardTitle>
                              <CardDescription>Your music taste breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer config={{}} className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPieChart>
                                    <Pie
                                      data={deezerData.stats.topGenres.slice(0, 6).map((g: any, idx: number) => ({
                                        name: g.genre,
                                        value: g.count,
                                        fill: ['hsl(39, 100%, 50%)', 'hsl(20, 100%, 60%)', 'hsl(340, 82%, 52%)', 'hsl(291, 64%, 42%)', 'hsl(262, 52%, 47%)', 'hsl(217, 91%, 60%)'][idx % 6]
                                      }))}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={(entry) => entry.name}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {deezerData.stats.topGenres.slice(0, 6).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} />
                                      ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        )}

                        {/* Listening Stats Bar Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              Collection Overview
                            </CardTitle>
                            <CardDescription>Your music library stats</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer config={{}} className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'Tracks', value: deezerData.stats?.totalTracks || 0, fill: 'hsl(39, 100%, 50%)' },
                                  { name: 'Artists', value: deezerData.stats?.totalArtists || 0, fill: 'hsl(20, 100%, 60%)' },
                                  { name: 'Albums', value: deezerData.stats?.totalAlbums || 0, fill: 'hsl(340, 82%, 52%)' }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="name" className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {[0, 1, 2].map((index) => (
                                      <Cell key={`cell-${index}`} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Tracks */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Your Favorite Tracks
                          </CardTitle>
                          <CardDescription>
                            Tracks you've loved on Deezer
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {deezerDataLoading ? (
                            <div className="text-center py-8">
                              <Music className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite tracks...</p>
                            </div>
                          ) : deezerData.tracks?.length ? (
                            <div className="space-y-3">
                              {deezerData.tracks.slice(0, 8).map((track: any, index: number) => (
                                <div key={track.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-medium text-white">
                                    {index + 1}
                                  </div>
                                  {track.album?.cover_medium && (
                                    <img 
                                      src={track.album.cover_medium} 
                                      alt={track.album.title}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.title}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {track.artist?.name || 'Unknown Artist'}
                                    </p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(track.duration / 60)}:
                                    {(track.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite tracks data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Top Artists */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Favorite Artists
                          </CardTitle>
                          <CardDescription>
                            Artists you love the most on Deezer
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {deezerDataLoading ? (
                            <div className="text-center py-8">
                              <User className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite artists...</p>
                            </div>
                          ) : deezerData.artists?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {deezerData.artists.map((artist: any) => (
                                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                                  {artist.picture_medium && (
                                    <img 
                                      src={artist.picture_medium} 
                                      alt={artist.name}
                                      className="w-14 h-14 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{artist.name}</p>
                                    {artist.nb_fan && (
                                      <p className="text-sm text-muted-foreground">
                                        {artist.nb_fan.toLocaleString()} fans
                                      </p>
                                    )}
                                    {artist.nb_album && (
                                      <p className="text-xs text-muted-foreground">
                                        {artist.nb_album} albums
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite artists data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : selectedPlatform === 'apple' && actuallyConnected.includes('apple') ? (
                    <>
                      {/* Apple Music Mock Data Badge */}
                      <Card className="bg-pink-500/10 border-pink-500/20">
                        <CardContent className="py-4 flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400">
                          <Music className="w-5 h-5" />
                          <span className="font-medium">Using Mock Data - Apple Music API Requires Subscription</span>
                        </CardContent>
                      </Card>

                      {/* Listening Overview with Charts */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Genre Distribution */}
                        {appleMusicData.stats?.topGenres && appleMusicData.stats.topGenres.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <PieChart className="w-5 h-5" />
                                Genre Distribution
                              </CardTitle>
                              <CardDescription>Your music taste on Apple Music</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer config={{}} className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPieChart>
                                    <Pie
                                      data={appleMusicData.stats.topGenres.slice(0, 6).map((g: any, idx: number) => ({
                                        name: g.genre,
                                        value: g.count,
                                        fill: ['hsl(340, 82%, 52%)', 'hsl(350, 100%, 66%)', 'hsl(291, 64%, 42%)', 'hsl(262, 52%, 47%)', 'hsl(217, 91%, 60%)', 'hsl(189, 94%, 43%)'][idx % 6]
                                      }))}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={(entry) => entry.name}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {appleMusicData.stats.topGenres.slice(0, 6).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} />
                                      ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        )}

                        {/* Collection Stats */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              Library Stats
                            </CardTitle>
                            <CardDescription>Your Apple Music collection</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer config={{}} className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'Tracks', value: appleMusicData.stats?.totalTracks || 0, fill: 'hsl(340, 82%, 52%)' },
                                  { name: 'Artists', value: appleMusicData.stats?.totalArtists || 0, fill: 'hsl(350, 100%, 66%)' }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="name" className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {[0, 1].map((index) => (
                                      <Cell key={`cell-${index}`} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Tracks */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Your Favorite Tracks
                          </CardTitle>
                          <CardDescription>
                            Tracks you've loved on Apple Music
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {appleMusicDataLoading ? (
                            <div className="text-center py-8">
                              <Music className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite tracks...</p>
                            </div>
                          ) : appleMusicData.tracks?.length ? (
                            <div className="space-y-3">
                              {appleMusicData.tracks.slice(0, 8).map((track: any, index: number) => (
                                <div key={track.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-sm font-medium text-white">
                                    {index + 1}
                                  </div>
                                  {track.artwork && (
                                    <img 
                                      src={track.artwork} 
                                      alt={track.album}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {track.artist}
                                    </p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(track.duration / 60)}:
                                    {(track.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite tracks data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Top Artists */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Favorite Artists
                          </CardTitle>
                          <CardDescription>
                            Artists you love on Apple Music
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {appleMusicDataLoading ? (
                            <div className="text-center py-8">
                              <User className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                              <p className="text-muted-foreground">Loading your favorite artists...</p>
                            </div>
                          ) : appleMusicData.artists?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {appleMusicData.artists.map((artist: any) => (
                                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20">
                                  {artist.artwork && (
                                    <img 
                                      src={artist.artwork} 
                                      alt={artist.name}
                                      className="w-14 h-14 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{artist.name}</p>
                                    {artist.genres && artist.genres.length > 0 && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {artist.genres.slice(0, 2).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No favorite artists data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Select a Platform</h3>
                        <p className="text-muted-foreground">
                          Choose a connected platform to view detailed statistics
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="space-y-6 mt-6">
                  {(() => {
                    // Calculate insights based on selected platform
                    const platformData: any = selectedPlatform === 'spotify' ? spotifyData :
                                       selectedPlatform === 'deezer' ? deezerData :
                                       selectedPlatform === 'apple' ? appleMusicData : {};
                    
                    const isLoading = selectedPlatform === 'spotify' ? spotifyDataLoading :
                                    selectedPlatform === 'deezer' ? deezerDataLoading :
                                    selectedPlatform === 'apple' ? appleMusicDataLoading : false;

                    // Handle different data structures (Spotify uses topTracks/topArtists, others use tracks/artists)
                    const tracks = platformData.tracks || platformData.topTracks || [];
                    const artists = platformData.artists || platformData.topArtists || [];
                    const stats = platformData.stats || {};

                    // Genre diversity calculation
                    const topGenres = stats.topGenres || [];
                    const genreDiversity = topGenres.length > 0 ? 
                      Math.min(100, (topGenres.length / 10) * 100) : 0;

                    // Calculate average track duration
                    const avgDuration = tracks.length > 0 ?
                      tracks.reduce((sum: number, t: any) => sum + (t.duration || t.duration_ms / 1000 || 0), 0) / tracks.length : 0;

                    // Artist loyalty (tracks per artist)
                    const artistLoyalty = stats.totalArtists && stats.totalTracks ?
                      Math.round((stats.totalTracks / stats.totalArtists) * 10) / 10 : 0;

                    // Listening intensity
                    const listeningIntensity = stats.listeningTimeEstimate ?
                      Math.min(100, (stats.listeningTimeEstimate / 1000) * 10) : 0;

                    // Prepare chart data
                    const genreChartData = topGenres.slice(0, 6).map((g: any) => ({
                      name: g.genre,
                      value: g.count,
                      fill: `hsl(${Math.random() * 360}, 70%, 50%)`
                    }));

                    const durationDistribution = [
                      { name: 'Short (<3m)', value: tracks.filter((t: any) => (t.duration || t.duration_ms / 1000 || 0) < 180).length },
                      { name: 'Medium (3-5m)', value: tracks.filter((t: any) => {
                        const dur = t.duration || t.duration_ms / 1000 || 0;
                        return dur >= 180 && dur < 300;
                      }).length },
                      { name: 'Long (5m+)', value: tracks.filter((t: any) => (t.duration || t.duration_ms / 1000 || 0) >= 300).length }
                    ].map((item, idx) => ({
                      ...item,
                      fill: ['hsl(142, 76%, 36%)', 'hsl(47, 96%, 53%)', 'hsl(0, 73%, 41%)'][idx]
                    }));

                    const artistPopularityData = artists.slice(0, 5).map((a: any) => ({
                      name: a.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
                      popularity: a.popularity || a.nb_fan ? (a.nb_fan / 10000) : Math.random() * 100,
                      fans: a.nb_fan || a.followers?.total || 0
                    }));

                    return (
                      <>
                        {/* Insights Header */}
                        <div className="text-center space-y-2">
                          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            Your Music Insights
                          </h2>
                          <p className="text-muted-foreground">
                            Discover patterns and trends in your listening habits
                          </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription className="flex items-center gap-2">
                                <PieChart className="w-4 h-4" />
                                Genre Diversity
                              </CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : `${Math.round(genreDiversity)}%`}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${genreDiversity}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {topGenres.length} unique genres
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Avg Track Length
                              </CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : `${Math.floor(avgDuration / 60)}:${String(Math.floor(avgDuration % 60)).padStart(2, '0')}`}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                {avgDuration < 180 ? 'You prefer shorter tracks' :
                                 avgDuration > 300 ? 'You enjoy longer compositions' :
                                 'Balanced track preferences'}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Artist Loyalty
                              </CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : artistLoyalty || '--'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">
                                {artistLoyalty > 10 ? 'Deep dive listener' :
                                 artistLoyalty > 5 ? 'Balanced exploration' :
                                 'Wide variety explorer'} tracks/artist
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                            <CardHeader className="pb-2">
                              <CardDescription className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Listening Intensity
                              </CardDescription>
                              <CardTitle className="text-3xl">
                                {isLoading ? '...' : `${Math.round(listeningIntensity)}%`}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${listeningIntensity}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {Math.round(stats.listeningTimeEstimate / 60 || 0)}h total time
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Genre Distribution */}
                          {genreChartData.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <PieChart className="w-5 h-5" />
                                  Genre Distribution
                                </CardTitle>
                                <CardDescription>
                                  Your top music genres by artist count
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ChartContainer config={{}} className="h-[300px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                      <Pie
                                        data={genreChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => entry.name}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                      >
                                        {genreChartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </Pie>
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                    </RechartsPieChart>
                                  </ResponsiveContainer>
                                </ChartContainer>
                              </CardContent>
                            </Card>
                          )}

                          {/* Track Duration Distribution */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Track Length Preferences
                              </CardTitle>
                              <CardDescription>
                                Distribution of track durations
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer config={{}} className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={durationDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                      {durationDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </ChartContainer>
                            </CardContent>
                          </Card>

                          {/* Artist Popularity */}
                          {artistPopularityData.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Award className="w-5 h-5" />
                                  Top Artists Popularity
                                </CardTitle>
                                <CardDescription>
                                  Popularity metrics of your favorite artists
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ChartContainer config={{}} className="h-[300px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={artistPopularityData} layout="vertical">
                                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                      <XAxis type="number" className="text-xs" />
                                      <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                      <Bar dataKey="popularity" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </ChartContainer>
                              </CardContent>
                            </Card>
                          )}

                          {/* Listening Patterns */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Listening Patterns
                              </CardTitle>
                              <CardDescription>
                                Your music consumption habits
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Collection Size</span>
                                  <span className="text-sm text-muted-foreground">
                                    {stats.totalTracks || 0} tracks
                                  </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, (stats.totalTracks / 100))}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Artist Discovery</span>
                                  <span className="text-sm text-muted-foreground">
                                    {stats.totalArtists || 0} artists
                                  </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, (stats.totalArtists / 50))}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Genre Exploration</span>
                                  <span className="text-sm text-muted-foreground">
                                    {topGenres.length} genres
                                  </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                                    style={{ width: `${genreDiversity}%` }}
                                  />
                                </div>
                              </div>

                              <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Listening Profile</h4>
                                <p className="text-sm text-muted-foreground">
                                  {genreDiversity > 70 ? '🌈 Eclectic Explorer: You have diverse taste across many genres' :
                                   genreDiversity > 40 ? '🎵 Balanced Listener: You enjoy a good mix of different styles' :
                                   '🎯 Genre Specialist: You have focused preferences in specific genres'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Additional Insights */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Personalized Insights
                            </CardTitle>
                            <CardDescription>
                              What your listening habits reveal
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                  <Music className="w-5 h-5" />
                                  <h4 className="font-semibold">Music Diversity</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {topGenres.length > 5 ? 
                                    'You explore many different genres, showing openness to various musical styles.' :
                                    'You have well-defined preferences within select genres.'}
                                </p>
                              </div>

                              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <User className="w-5 h-5" />
                                  <h4 className="font-semibold">Artist Engagement</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {artistLoyalty > 10 ?
                                    'You deeply engage with fewer artists, likely following their full discographies.' :
                                    'You discover and sample many different artists, keeping your library fresh.'}
                                </p>
                              </div>

                              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                  <Clock className="w-5 h-5" />
                                  <h4 className="font-semibold">Track Preferences</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {avgDuration < 180 ?
                                    'You prefer quick, energetic tracks perfect for active listening.' :
                                    avgDuration > 300 ?
                                    'You appreciate longer compositions with complex arrangements.' :
                                    'You enjoy a balanced mix of track lengths for different moods.'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            ) : (
              /* Show Overall Aggregated View by Default */
              <div className="space-y-6">
                {/* Overall Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Your Complete Music Profile
                  </h2>
                  <p className="text-muted-foreground">
                    Aggregated data from {actuallyConnected.length} platform{actuallyConnected.length !== 1 ? 's' : ''}
                    {actuallyConnected.length > 0 && ` (${actuallyConnected.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')})`}
                    {shouldUseMockDeezer && actuallyConnected.includes('deezer') && (
                      <span className="ml-2 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">Deezer: Mock Data</span>
                    )}
                    {shouldUseMockAppleMusic && actuallyConnected.includes('apple') && (
                      <span className="ml-2 text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded">Apple Music: Mock Data</span>
                    )}
                  </p>
                </div>

                {(() => {
                  // Calculate overall statistics
                  const totalListeningTime = (
                    (spotifyData.stats?.listeningTimeEstimate || 0) +
                    (deezerData.stats?.listeningTimeEstimate || 0) +
                    (appleMusicData.stats?.listeningTimeEstimate || 0)
                  );
                  const totalTracks = (
                    (spotifyData.stats?.totalTracks || 0) +
                    (deezerData.stats?.totalTracks || 0) +
                    (appleMusicData.stats?.totalTracks || 0)
                  );
                  const totalArtists = (
                    (spotifyData.stats?.totalArtists || 0) +
                    (deezerData.stats?.totalArtists || 0) +
                    (appleMusicData.stats?.totalArtists || 0)
                  );
                  const totalAlbums = (
                    (spotifyData.stats?.totalAlbums || 0) +
                    (deezerData.stats?.totalAlbums || 0)
                  );

                  // Aggregate top genres from all platforms
                  const genreMap = new Map<string, number>();
                  [spotifyData.stats?.topGenres, deezerData.stats?.topGenres, appleMusicData.stats?.topGenres]
                    .filter(Boolean)
                    .forEach(genres => {
                      genres?.forEach((g: any) => {
                        const genre = g.genre.toLowerCase();
                        genreMap.set(genre, (genreMap.get(genre) || 0) + g.count);
                      });
                    });
                  const topGenres = Array.from(genreMap.entries())
                    .map(([genre, count]) => ({ genre, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                  const isLoading = spotifyDataLoading || deezerDataLoading || appleMusicDataLoading;

                  return (
                    <>
                      {/* Overall Stats Grid */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                          <CardHeader className="pb-2">
                            <CardDescription>Total Listening Time</CardDescription>
                            <CardTitle className="text-3xl">
                              {isLoading ? '...' : `${Math.round(totalListeningTime / 60)}h`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {isLoading ? 'Loading...' : 'Across all platforms'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                          <CardHeader className="pb-2">
                            <CardDescription>Total Tracks</CardDescription>
                            <CardTitle className="text-3xl">
                              {isLoading ? '...' : totalTracks}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <Music className="w-4 h-4 inline mr-1" />
                              {isLoading ? 'Loading...' : 'In your libraries'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                          <CardHeader className="pb-2">
                            <CardDescription>Total Artists</CardDescription>
                            <CardTitle className="text-3xl">
                              {isLoading ? '...' : totalArtists}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <User className="w-4 h-4 inline mr-1" />
                              {isLoading ? 'Loading...' : 'Unique artists'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                          <CardHeader className="pb-2">
                            <CardDescription>Total Albums</CardDescription>
                            <CardTitle className="text-3xl">
                              {isLoading ? '...' : totalAlbums || '--'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              <Music className="w-4 h-4 inline mr-1" />
                              {isLoading ? 'Loading...' : 'In collections'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Genres Across All Platforms */}
                      {topGenres.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Genres Across All Platforms</CardTitle>
                            <CardDescription>
                              Your most listened genres from all connected services
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {topGenres.map((genre, index) => (
                                <div key={genre.genre} className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground mr-3">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium capitalize">{genre.genre}</span>
                                      <span className="text-sm text-muted-foreground">{genre.count} artists</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                      <div
                                        className="bg-gradient-primary h-2 rounded-full transition-all"
                                        style={{ width: `${(genre.count / topGenres[0].count) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Platform Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Platform Breakdown</CardTitle>
                          <CardDescription>Your listening statistics by platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-3">
                            {/* Spotify Platform Card */}
                            {actuallyConnected.includes('spotify') && spotifyData.stats && (
                              <Card className="bg-green-500/5 border-green-500/20">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                      <Music className="w-4 h-4 text-white" />
                                    </div>
                                    Spotify
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tracks:</span>
                                    <span className="font-medium">{spotifyData.stats.totalTracks}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Artists:</span>
                                    <span className="font-medium">{spotifyData.stats.totalArtists}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{Math.round(spotifyData.stats.listeningTimeEstimate / 60)}h</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Deezer Platform Card */}
                            {actuallyConnected.includes('deezer') && deezerData.stats && (
                              <Card className="bg-orange-500/5 border-orange-500/20">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                      <Music className="w-4 h-4 text-white" />
                                    </div>
                                    Deezer
                                    {shouldUseMockDeezer && (
                                      <span className="ml-1 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">Mock</span>
                                    )}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tracks:</span>
                                    <span className="font-medium">{deezerData.stats.totalTracks}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Artists:</span>
                                    <span className="font-medium">{deezerData.stats.totalArtists}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{Math.round(deezerData.stats.listeningTimeEstimate / 60)}h</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Apple Music Platform Card */}
                            {actuallyConnected.includes('apple') && appleMusicData.stats && (
                              <Card className="bg-pink-500/5 border-pink-500/20">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                      <Music className="w-4 h-4 text-white" />
                                    </div>
                                    Apple Music
                                    <span className="ml-1 text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded">Mock</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tracks:</span>
                                    <span className="font-medium">{appleMusicData.stats.totalTracks}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Artists:</span>
                                    <span className="font-medium">{appleMusicData.stats.totalArtists}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{Math.round(appleMusicData.stats.listeningTimeEstimate / 60)}h</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Comparison Panel */}
            {actuallyConnected.length > 1 && (
              <div className="mt-8">
                <ComparisonPanel platforms={actuallyConnected} />
              </div>
            )}

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
