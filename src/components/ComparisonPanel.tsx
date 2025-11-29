import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, BarChart3, TrendingUp, Clock, User, Heart } from "lucide-react";

interface ComparisonPanelProps {
  platforms: string[];
}

export const ComparisonPanel = ({ platforms }: ComparisonPanelProps) => {
  if (platforms.length < 2) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Multi-Platform Insights
          </CardTitle>
          <CardDescription>
            Your music journey across {platforms.length} platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diversity Score */}
            <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Multi-Platform User
                </span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  You're leveraging multiple music services for a richer listening experience
                </p>
                <div className="flex gap-2">
                  {platforms.map((platform) => (
                    <div
                      key={platform}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        platform === 'spotify' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                        platform === 'deezer' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                        'bg-pink-500/20 text-pink-700 dark:text-pink-300'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Listening Habits */}
            <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-green-500/5 to-teal-500/5 border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Music className="w-4 h-4 text-green-600" />
                  Cross-Platform Listener
                </span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                  Enhanced
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Your diverse platform usage suggests adaptive listening habits across different contexts
                </p>
              </div>
            </div>

            {/* Discovery Potential */}
            <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4 text-orange-600" />
                  Discovery Optimized
                </span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 dark:text-orange-300">
                  Optimal
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Multiple platforms give you access to different recommendation algorithms and exclusive content
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">Your Multi-Platform Advantage</h4>
                <p className="text-xs text-muted-foreground">
                  By using {platforms.length} different music services, you have access to:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    Broader music catalog and exclusive releases
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    Multiple recommendation algorithms for better discovery
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    Platform-specific features and curated playlists
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
