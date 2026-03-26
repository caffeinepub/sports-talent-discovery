import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Loader2, MapPin, Video } from "lucide-react";
import { useState } from "react";
import type { VideoMetadata } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useStorageClient } from "../hooks/useStorageClient";
import { decodeSport, sportEmoji } from "../lib/sports";

export function PlayerProfilePage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { actor } = useActor();
  const storageClient = useStorageClient();

  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(id);
  } catch {
    /* invalid */
  }

  const playerQuery = useQuery({
    queryKey: ["player", id],
    queryFn: () => actor!.getPlayer(principal!),
    enabled: !!actor && !!principal,
  });

  const videosQuery = useQuery({
    queryKey: ["playerVideos", id],
    queryFn: () => actor!.getVideosByPlayer(principal!),
    enabled: !!actor && !!principal,
  });

  const scoresQuery = useQuery({
    queryKey: ["playerScores", id],
    queryFn: () => actor!.getPlayerScores(principal!),
    enabled: !!actor && !!principal,
  });

  const player = playerQuery.data;
  const videos = videosQuery.data ?? [];
  const scores = scoresQuery.data ?? [];
  const bestScore = scores.length
    ? Math.max(...scores.map((s) => Number(s.totalScore)))
    : null;

  if (playerQuery.isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
          data-ocid="profile.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div
          className="flex items-center justify-center min-h-[40vh] text-muted-foreground"
          data-ocid="profile.error_state"
        >
          Player not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        data-ocid="profile.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center font-display text-3xl font-bold text-primary">
            {player.name.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {player.name}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge variant="secondary" className="gap-1">
                {sportEmoji(player.sport)} {decodeSport(player.sport)}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {player.village}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Age {player.age.toString()}
              </span>
            </div>
            {player.bio && (
              <p className="text-muted-foreground mt-3 max-w-xl">
                {player.bio}
              </p>
            )}
          </div>
          {bestScore !== null && (
            <div className="text-center bg-primary/10 rounded-xl p-4 border border-primary/30">
              <p className="text-xs text-muted-foreground">Best Score</p>
              <p className="font-display text-4xl font-bold text-primary">
                {bestScore}
              </p>
              <p className="text-xs text-muted-foreground">
                {scores.length} assessment{scores.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Videos */}
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">
        Talent Videos
      </h2>
      {videosQuery.isLoading ? (
        <div
          data-ocid="profile.videos_loading_state"
          className="text-muted-foreground"
        >
          Loading videos...
        </div>
      ) : !videos.length ? (
        <div
          data-ocid="profile.videos_empty_state"
          className="text-center py-8 text-muted-foreground bg-card border border-border rounded-xl"
        >
          No videos uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {videos.map((v: VideoMetadata, i) => (
            <VideoCard
              key={v.id.toString()}
              video={v}
              storageClient={storageClient}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  storageClient,
  index,
}: {
  video: VideoMetadata;
  storageClient: ReturnType<typeof useStorageClient>;
  index: number;
}) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    if (!storageClient || !video.blobId) return;
    setLoading(true);
    try {
      const url = await storageClient.getDirectURL(video.blobId);
      setVideoUrl(url);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  return (
    <div
      data-ocid={`profile.video.item.${index}`}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {videoUrl ? (
        // biome-ignore lint/a11y/useMediaCaption: player-generated content captions not available
        <video
          src={videoUrl}
          controls
          className="w-full aspect-video bg-black"
        />
      ) : (
        <button
          type="button"
          className="w-full aspect-video bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={play}
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <Video className="w-12 h-12 text-muted-foreground" />
          )}
        </button>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{video.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {video.description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {decodeSport(video.sport)} •{" "}
          {new Date(Number(video.timestamp)).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
