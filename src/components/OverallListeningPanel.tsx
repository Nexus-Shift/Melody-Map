import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, Music } from "lucide-react";

export const OverallListeningPanel = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Overall Listening Statistics
          </CardTitle>
          <CardDescription>
            Your combined listening habits across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Total Hours</span>
              </div>
              <div className="text-2xl font-bold">---</div>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>

            <div className="p-4 border rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Music className="w-4 h-4" />
                <span className="text-xs">Total Tracks</span>
              </div>
              <div className="text-2xl font-bold">---</div>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>

            <div className="p-4 border rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Top Genre</span>
              </div>
              <div className="text-2xl font-bold">---</div>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>

            <div className="p-4 border rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Active Days</span>
              </div>
              <div className="text-2xl font-bold">---</div>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>
          </div>

          {/* Charts Tabs */}
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="border rounded-lg p-6">
                <h4 className="text-sm font-medium mb-4">Weekly Listening Activity</h4>
                <div className="h-64 bg-muted/50 rounded flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization coming soon
                    </p>
                    <Badge variant="secondary">Placeholder</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="border rounded-lg p-6">
                <h4 className="text-sm font-medium mb-4">Monthly Listening Trends</h4>
                <div className="h-64 bg-muted/50 rounded flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization coming soon
                    </p>
                    <Badge variant="secondary">Placeholder</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4">
              <div className="border rounded-lg p-6">
                <h4 className="text-sm font-medium mb-4">Yearly Overview</h4>
                <div className="h-64 bg-muted/50 rounded flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization coming soon
                    </p>
                    <Badge variant="secondary">Placeholder</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Top Artists/Tracks Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Top Artists</h4>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <div className="w-10 h-10 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-2 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Top Tracks</h4>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <div className="w-10 h-10 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-2 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
