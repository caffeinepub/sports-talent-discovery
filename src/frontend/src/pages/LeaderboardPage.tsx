import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useState } from "react";
import type { PlayerProfile, Score } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  SPORT_OPTIONS,
  decodeSport,
  encodeSport,
  sportEmoji,
} from "../lib/sports";

export function LeaderboardPage() {
  const { actor } = useActor();
  const [filterSport, setFilterSport] = useState("all");

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", filterSport],
    queryFn: () =>
      actor!.getLeaderboard(
        filterSport === "all" ? null : encodeSport(filterSport),
      ),
    enabled: !!actor,
  });

  const playersQuery = useQuery({
    queryKey: ["allPlayers"],
    queryFn: () => actor!.getAllPlayers(),
    enabled: !!actor,
  });

  const players = playersQuery.data ?? [];
  const leaderboard = leaderboardQuery.data ?? [];

  const getPlayer = (pid: Principal): PlayerProfile | undefined =>
    players.find(([p]) => p.toString() === pid.toString())?.[1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Top talented players ranked by assessment scores
          </p>
        </div>
        <Select value={filterSport} onValueChange={setFilterSport}>
          <SelectTrigger className="w-40" data-ocid="leaderboard.sport_select">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {SPORT_OPTIONS.filter((o) => o.value !== "other").map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leaderboardQuery.isLoading ? (
        <div
          data-ocid="leaderboard.loading_state"
          className="text-center py-16 text-muted-foreground"
        >
          Loading leaderboard...
        </div>
      ) : !leaderboard.length ? (
        <div
          data-ocid="leaderboard.empty_state"
          className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl"
        >
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No scored players yet. Check back soon!</p>
        </div>
      ) : (
        <div
          data-ocid="leaderboard.table"
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Village</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((score: Score, i) => {
                const p = getPlayer(score.playerId);
                const rankDisplay =
                  i === 0
                    ? "🥇"
                    : i === 1
                      ? "🥈"
                      : i === 2
                        ? "🥉"
                        : `#${i + 1}`;
                return (
                  <TableRow
                    key={score.playerId.toString()}
                    data-ocid={`leaderboard.row.${i + 1}`}
                    className={`border-border ${i < 3 ? "bg-primary/5" : ""}`}
                  >
                    <TableCell>
                      <span
                        className={`font-display text-lg font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}
                      >
                        {rankDisplay}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/player/$id"
                        params={{ id: score.playerId.toString() }}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {p?.name || "Unknown Player"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {p ? (
                        <span className="text-sm">
                          {sportEmoji(p.sport)} {decodeSport(p.sport)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p?.village || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="font-display font-bold text-base">
                        {score.totalScore.toString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
