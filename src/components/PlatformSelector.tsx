import { Music2, Music4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  selectedPlatform: "spotify" | "apple" | "deezer" | "all" | null;
  onSelectPlatform: (platform: "spotify" | "apple" | "deezer") => void;
  connectedPlatforms: string[];
}

export const PlatformSelector = ({
  selectedPlatform,
  onSelectPlatform,
  connectedPlatforms,
}: PlatformSelectorProps) => {
  const platforms = [
    {
      id: "spotify" as const,
      name: "Spotify",
      color: "bg-green-600 hover:bg-green-700",
      icon: Music2,
    },
    {
      id: "apple" as const,
      name: "Apple Music",
      color: "bg-pink-600 hover:bg-pink-700",
      icon: Music4,
    },
    {
      id: "deezer" as const,
      name: "Deezer",
      color: "bg-orange-600 hover:bg-orange-700",
      icon: Music2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isConnected = connectedPlatforms.includes(platform.id);
        const isSelected = selectedPlatform === platform.id;

        return (
          <Card
            key={platform.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              isSelected && "ring-2 ring-primary shadow-lg",
              !isConnected && "opacity-50"
            )}
            onClick={() => isConnected && onSelectPlatform(platform.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                  isConnected ? platform.color : "bg-muted"
                )}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">{platform.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? (
                    isSelected ? (
                      "Selected"
                    ) : (
                      "Click to view"
                    )
                  ) : (
                    "Not connected"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
