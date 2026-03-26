import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile, Score } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useAppUser } from "../hooks/useAppUser";
import {
  SPORT_OPTIONS,
  decodeSport,
  encodeSport,
  sportEmoji,
} from "../lib/sports";

export function SponsorDashboard() {
  const { actor } = useActor();
  const { principal } = useAppUser();
  const qc = useQueryClient();

  const [orgName, setOrgName] = useState("");
  const [sport, setSport] = useState("football");
  const [desc, setDesc] = useState("");

  const sponsorQuery = useQuery({
    queryKey: ["allSponsors"],
    queryFn: () => actor!.getAllSponsors(),
    enabled: !!actor,
  });

  const mySponsor = sponsorQuery.data?.find(
    ([p]) => p.toString() === principal?.toString(),
  );

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", null],
    queryFn: () => actor!.getLeaderboard(null),
    enabled: !!actor,
  });

  const playersQuery = useQuery({
    queryKey: ["allPlayers"],
    queryFn: () => actor!.getAllPlayers(),
    enabled: !!actor,
  });

  const shortlistedQuery = useQuery({
    queryKey: ["shortlisted", principal?.toString()],
    queryFn: () => actor!.getShortlistedPlayers(principal!),
    enabled: !!actor && !!principal,
  });

  const createSponsorMutation = useMutation({
    mutationFn: () =>
      actor!.createSponsorProfile(orgName, encodeSport(sport), desc),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allSponsors"] });
      toast.success("Sponsor profile created!");
    },
    onError: () => toast.error("Failed to create profile."),
  });

  const shortlistMutation = useMutation({
    mutationFn: (playerId: Principal) => actor!.shortlistPlayer(playerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shortlisted"] });
      toast.success("Player shortlisted!");
    },
    onError: () => toast.error("Failed to shortlist."),
  });

  const players = playersQuery.data ?? [];
  const leaderboard = leaderboardQuery.data ?? [];
  const shortlisted = shortlistedQuery.data ?? [];

  const getPlayer = (pid: Principal) =>
    players.find(([p]) => p.toString() === pid.toString())?.[1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        data-ocid="sponsor.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Sponsor Dashboard
      </h1>

      {!mySponsor && (
        <Card className="mb-8 border-accent/50">
          <CardHeader>
            <CardTitle>Create Sponsor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Organization Name</Label>
                <Input
                  data-ocid="sponsor.org_name_input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your org name"
                />
              </div>
              <div className="space-y-1">
                <Label>Sport Focus</Label>
                <Select value={sport} onValueChange={setSport}>
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
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="About your sponsorship program"
                  rows={2}
                />
              </div>
            </div>
            <Button
              data-ocid="sponsor.create_profile_button"
              onClick={() => createSponsorMutation.mutate()}
              disabled={createSponsorMutation.isPending || !orgName}
            >
              {createSponsorMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {mySponsor && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {mySponsor[1].orgName}
            </p>
            <p className="text-sm text-muted-foreground">
              Focus: {decodeSport(mySponsor[1].sport)}
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="leaderboard">
        <TabsList className="mb-6">
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="shortlisted" className="gap-2">
            <Heart className="w-4 h-4" />
            Shortlisted ({shortlisted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {leaderboardQuery.isLoading ? (
            <div
              data-ocid="sponsor.leaderboard_loading_state"
              className="text-muted-foreground"
            >
              Loading...
            </div>
          ) : !leaderboard.length ? (
            <div
              data-ocid="sponsor.leaderboard_empty_state"
              className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
            >
              No scored players yet.
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((score: Score, i) => {
                const p = getPlayer(score.playerId);
                const isShortlisted = shortlisted.some(
                  (s) => s.toString() === score.playerId.toString(),
                );
                return (
                  <div
                    key={score.playerId.toString()}
                    data-ocid={`sponsor.leaderboard.item.${i + 1}`}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-display text-2xl font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}
                      >
                        {i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : `#${i + 1}`}
                      </span>
                      <div>
                        <Link
                          to="/player/$id"
                          params={{ id: score.playerId.toString() }}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {p?.name || "Player"}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {p
                            ? `${sportEmoji(p.sport)} ${decodeSport(p.sport)} • ${p.village}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="font-display text-lg font-bold"
                      >
                        {score.totalScore.toString()}pts
                      </Badge>
                      <Button
                        data-ocid="sponsor.shortlist_button"
                        size="sm"
                        variant={isShortlisted ? "secondary" : "default"}
                        onClick={() => shortlistMutation.mutate(score.playerId)}
                        disabled={shortlistMutation.isPending || isShortlisted}
                      >
                        <Heart
                          className={`w-4 h-4 mr-1 ${isShortlisted ? "fill-current" : ""}`}
                        />
                        {isShortlisted ? "Shortlisted" : "Shortlist"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shortlisted">
          {!shortlisted.length ? (
            <div
              data-ocid="sponsor.shortlisted_empty_state"
              className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
            >
              No players shortlisted yet. Browse the leaderboard to find talent.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortlisted.map((pid: Principal, i) => {
                const p = getPlayer(pid);
                return (
                  <Card
                    key={pid.toString()}
                    data-ocid={`sponsor.shortlisted.item.${i + 1}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                          {p?.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <Link
                            to="/player/$id"
                            params={{ id: pid.toString() }}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {p?.name || "Player"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {p?.village}
                          </p>
                        </div>
                      </div>
                      {p && (
                        <p className="text-sm text-muted-foreground">
                          {sportEmoji(p.sport)} {decodeSport(p.sport)} • Age{" "}
                          {p.age.toString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
