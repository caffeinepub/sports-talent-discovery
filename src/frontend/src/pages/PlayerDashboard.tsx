import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart2, Loader2, Upload, User, Video } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Score, VideoMetadata } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useAppUser } from "../hooks/useAppUser";
import { useStorageClient } from "../hooks/useStorageClient";
import { SPORT_OPTIONS, decodeSport, encodeSport } from "../lib/sports";

function scoreBreakdown(s: Score) {
  return [
    { label: "Physical", value: Number(s.physical) },
    { label: "Technical", value: Number(s.technical) },
    { label: "Tactical", value: Number(s.tactical) },
    { label: "Mental", value: Number(s.mental) },
  ];
}

export function PlayerDashboard() {
  const { actor } = useActor();
  const { principal } = useAppUser();
  const qc = useQueryClient();
  const storageClient = useStorageClient();

  // Profile form
  const [pName, setPName] = useState("");
  const [pSport, setPSport] = useState("football");
  const [pVillage, setPVillage] = useState("");
  const [pBio, setPBio] = useState("");
  const [pAge, setPAge] = useState("");

  // Video upload form
  const [vTitle, setVTitle] = useState("");
  const [vDesc, setVDesc] = useState("");
  const [vSport, setVSport] = useState("football");
  const [vFile, setVFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const playerQuery = useQuery({
    queryKey: ["myPlayer", principal?.toString()],
    queryFn: () => actor!.getPlayer(principal!),
    enabled: !!actor && !!principal,
  });

  const videosQuery = useQuery({
    queryKey: ["myVideos", principal?.toString()],
    queryFn: () => actor!.getVideosByPlayer(principal!),
    enabled: !!actor && !!principal,
  });

  const scoresQuery = useQuery({
    queryKey: ["myScores", principal?.toString()],
    queryFn: () => actor!.getPlayerScores(principal!),
    enabled: !!actor && !!principal,
  });

  const savePlayerMutation = useMutation({
    mutationFn: () =>
      actor!.createOrUpdatePlayer(
        pName,
        encodeSport(pSport),
        pVillage,
        pBio,
        BigInt(Number.parseInt(pAge) || 0),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPlayer"] });
      toast.success("Profile saved!");
    },
    onError: () => toast.error("Failed to save profile."),
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!vFile || !storageClient)
        throw new Error("No file or storage client");
      const bytes = new Uint8Array(await vFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, setUploadProgress);
      await actor!.uploadVideo(
        vTitle,
        vDesc,
        encodeSport(vSport),
        hash,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myVideos"] });
      toast.success("Video uploaded!");
      setVTitle("");
      setVDesc("");
      setVFile(null);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => toast.error(`Upload failed: ${e.message}`),
  });

  const playerData = playerQuery.data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Player Dashboard
      </h1>
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="scores" className="gap-2">
            <BarChart2 className="w-4 h-4" />
            Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {playerData && (
                <div className="bg-muted/40 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Current:{" "}
                    <strong className="text-foreground">
                      {playerData.name}
                    </strong>{" "}
                    • {decodeSport(playerData.sport)} • {playerData.village} •
                    Age {playerData.age.toString()}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    data-ocid="player.name_input"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input
                    data-ocid="player.age_input"
                    value={pAge}
                    onChange={(e) => setPAge(e.target.value)}
                    placeholder="Your age"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Sport</Label>
                  <Select value={pSport} onValueChange={setPSport}>
                    <SelectTrigger data-ocid="player.sport_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Village / Region</Label>
                  <Input
                    data-ocid="player.village_input"
                    value={pVillage}
                    onChange={(e) => setPVillage(e.target.value)}
                    placeholder="Your village"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    data-ocid="player.bio_textarea"
                    value={pBio}
                    onChange={(e) => setPBio(e.target.value)}
                    placeholder="Tell us about yourself and your sports journey"
                    rows={3}
                  />
                </div>
              </div>
              <Button
                onClick={() => savePlayerMutation.mutate()}
                disabled={savePlayerMutation.isPending}
                data-ocid="player.profile_submit_button"
              >
                {savePlayerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Video Title</Label>
                    <Input
                      data-ocid="player.video_title_input"
                      value={vTitle}
                      onChange={(e) => setVTitle(e.target.value)}
                      placeholder="e.g. Football Skills 2024"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Sport</Label>
                    <Select value={vSport} onValueChange={setVSport}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={vDesc}
                      onChange={(e) => setVDesc(e.target.value)}
                      placeholder="Describe your video"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Video File</Label>
                    <button
                      type="button"
                      data-ocid="player.video_dropzone"
                      className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {vFile ? vFile.name : "Click to select a video file"}
                      </p>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setVFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                {uploadVideoMutation.isPending && (
                  <div
                    data-ocid="player.upload_loading_state"
                    className="space-y-2"
                  >
                    <p className="text-sm text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                <Button
                  data-ocid="player.video_upload_button"
                  onClick={() => uploadVideoMutation.mutate()}
                  disabled={
                    uploadVideoMutation.isPending ||
                    !vFile ||
                    !vTitle ||
                    !storageClient
                  }
                >
                  {uploadVideoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div>
              <h2 className="font-display text-xl font-semibold mb-4">
                My Videos
              </h2>
              {videosQuery.isLoading ? (
                <div
                  data-ocid="player.videos_loading_state"
                  className="text-muted-foreground"
                >
                  Loading videos...
                </div>
              ) : !videosQuery.data?.length ? (
                <div
                  data-ocid="player.videos_empty_state"
                  className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
                >
                  No videos uploaded yet. Upload your first video above!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videosQuery.data.map((v: VideoMetadata, i) => (
                    <VideoCard key={v.id.toString()} video={v} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scores">
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">
              My Assessment Scores
            </h2>
            {scoresQuery.isLoading ? (
              <div
                data-ocid="player.scores_loading_state"
                className="text-muted-foreground"
              >
                Loading scores...
              </div>
            ) : !scoresQuery.data?.length ? (
              <div
                data-ocid="player.scores_empty_state"
                className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
              >
                No assessments yet. A scout will assess you soon!
              </div>
            ) : (
              <div className="space-y-4">
                {scoresQuery.data.map((score: Score, i) => (
                  <Card
                    key={`${score.assessmentId}-${i}`}
                    data-ocid={`player.score.item.${i + 1}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Assessment ID: {score.assessmentId}
                          </p>
                          <p className="font-display text-2xl font-bold text-primary">
                            {score.totalScore.toString()} pts
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {scoreBreakdown(score).map(({ label, value }) => (
                          <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                {label}
                              </span>
                              <span className="font-medium">{value}/100</span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VideoCard({ video, index }: { video: VideoMetadata; index: number }) {
  const storageClient = useStorageClient();
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
      data-ocid={`player.video.item.${index}`}
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
