import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, Clock, TrendingUp, Headphones } from "lucide-react";

const DashboardPreview = () => {
  const mockRecentTracks = [
    { title: "Blinding Lights", artist: "The Weeknd", platform: "Spotify", time: "3:20" },
    { title: "As It Was", artist: "Harry Styles", platform: "Apple Music", time: "2:47" },
    { title: "Heat Waves", artist: "Glass Animals", platform: "Spotify", time: "3:58" },
  ];

  const mockGenres = [
    { name: "Pop", percentage: 45, color: "bg-electric-purple" },
    { name: "Electronic", percentage: 32, color: "bg-neon-blue" },
    { name: "Indie Rock", percentage: 23, color: "bg-electric-pink" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-glass-bg/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
            Your Music Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get insights into your listening habits across all your streaming platforms
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Tracks */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border shadow-card col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Music className="w-5 h-5 text-electric-purple" />
                Recent Tracks
              </CardTitle>
              <CardDescription>Your latest played songs from all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentTracks.map((track, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-glass-bg/30 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Music className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 border-glass-border">
                        {track.platform}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{track.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Genres */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-neon-blue" />
                Top Genres
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGenres.map((genre, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">{genre.name}</span>
                      <span className="text-xs text-muted-foreground">{genre.percentage}%</span>
                    </div>
                    <Progress 
                      value={genre.percentage} 
                      className="h-2 bg-glass-bg"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Listening Stats */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-electric-pink" />
                Weekly Stats
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">24.5</div>
                  <div className="text-sm text-muted-foreground">Hours listened</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-foreground">127</div>
                    <div className="text-xs text-muted-foreground">Songs played</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-foreground">18</div>
                    <div className="text-xs text-muted-foreground">Artists</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card className="bg-gradient-card backdrop-blur-sm border-glass-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Headphones className="w-5 h-5 text-electric-purple" />
                Connected Platforms
              </CardTitle>
              <CardDescription>Sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-foreground">Spotify</span>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 text-green-500">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted rounded-full" />
                    <span className="text-sm text-muted-foreground">Apple Music</span>
                  </div>
                  <Badge variant="outline" className="border-muted">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted rounded-full" />
                    <span className="text-sm text-muted-foreground">Deezer</span>
                  </div>
                  <Badge variant="outline" className="border-muted">
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;