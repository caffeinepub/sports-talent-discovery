import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { toast } from "sonner";
import type { Assessment, PlayerProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  SPORT_OPTIONS,
  decodeSport,
  encodeSport,
  sportEmoji,
} from "../lib/sports";

export function ScoutDashboard() {
  const { actor } = useActor();
  const qc = useQueryClient();

  // Create assessment form
  const [aName, setAName] = useState("");
  const [aSport, setASport] = useState("football");
  const [aDate, setADate] = useState("");
  const [aOpen, setAOpen] = useState(false);

  // Score assignment
  const [selAssessment, setSelAssessment] = useState<string>("");
  const [selPlayer, setSelPlayer] = useState<string>("");
  const [physical, setPhysical] = useState("80");
  const [technical, setTechnical] = useState("80");
  const [tactical, setTactical] = useState("80");
  const [mental, setMental] = useState("80");

  const assessmentsQuery = useQuery({
    queryKey: ["allAssessments"],
    queryFn: () => actor!.getAllAssessments(),
    enabled: !!actor,
  });

  const playersQuery = useQuery({
    queryKey: ["allPlayers"],
    queryFn: () => actor!.getAllPlayers(),
    enabled: !!actor,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: () =>
      actor!.createAssessment(
        nanoid(),
        aName,
        encodeSport(aSport),
        BigInt(aDate ? new Date(aDate).getTime() : Date.now()),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAssessments"] });
      toast.success("Assessment created!");
      setAName("");
      setADate("");
      setAOpen(false);
    },
    onError: () => toast.error("Failed to create assessment."),
  });

  const assignScoreMutation = useMutation({
    mutationFn: async () => {
      const players = playersQuery.data ?? [];
      const playerEntry = players.find(([p]) => p.toString() === selPlayer);
      if (!playerEntry) throw new Error("Player not found");
      await actor!.assignScore(
        selAssessment,
        playerEntry[0],
        BigInt(Number.parseInt(physical)),
        BigInt(Number.parseInt(technical)),
        BigInt(Number.parseInt(tactical)),
        BigInt(Number.parseInt(mental)),
      );
    },
    onSuccess: () => {
      toast.success("Score assigned!");
      setSelPlayer("");
      setPhysical("80");
      setTechnical("80");
      setTactical("80");
      setMental("80");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const assessments = assessmentsQuery.data ?? [];
  const players = playersQuery.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        data-ocid="scout.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Scout Dashboard
        </h1>
        <Dialog open={aOpen} onOpenChange={setAOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="scout.create_assessment_button"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Assessment Name</Label>
                <Input
                  data-ocid="scout.assessment_name_input"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  placeholder="e.g. Village Selection Trial"
                />
              </div>
              <div className="space-y-1">
                <Label>Sport</Label>
                <Select value={aSport} onValueChange={setASport}>
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
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  data-ocid="scout.assessment_date_input"
                  type="date"
                  value={aDate}
                  onChange={(e) => setADate(e.target.value)}
                />
              </div>
              <Button
                data-ocid="scout.create_assessment_submit_button"
                onClick={() => createAssessmentMutation.mutate()}
                disabled={createAssessmentMutation.isPending || !aName}
                className="w-full"
              >
                {createAssessmentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assessment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="assessments">
        <TabsList className="mb-6">
          <TabsTrigger value="assessments" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="players" className="gap-2">
            <Users className="w-4 h-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="score" className="gap-2">
            <Star className="w-4 h-4" />
            Assign Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          {assessmentsQuery.isLoading ? (
            <div
              data-ocid="scout.assessments_loading_state"
              className="text-muted-foreground"
            >
              Loading...
            </div>
          ) : !assessments.length ? (
            <div
              data-ocid="scout.assessments_empty_state"
              className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
            >
              No assessments yet. Create your first assessment above.
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map(([id, a]: [string, Assessment], i) => (
                <Card key={id} data-ocid={`scout.assessment.item.${i + 1}`}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold text-foreground">{a.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sportEmoji(a.sport)} {decodeSport(a.sport)} •{" "}
                        {new Date(Number(a.date)).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {id.substring(0, 8)}...
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="players">
          {playersQuery.isLoading ? (
            <div
              data-ocid="scout.players_loading_state"
              className="text-muted-foreground"
            >
              Loading...
            </div>
          ) : !players.length ? (
            <div
              data-ocid="scout.players_empty_state"
              className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl"
            >
              No players registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(([pid, p]: [Principal, PlayerProfile], i) => (
                <Card
                  key={pid.toString()}
                  data-ocid={`scout.player.item.${i + 1}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                        {p.name.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {p.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.village}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sportEmoji(p.sport)} {decodeSport(p.sport)} • Age{" "}
                      {p.age.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {p.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="score">
          <Card>
            <CardHeader>
              <CardTitle>Assign Score to Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Select Assessment</Label>
                <Select value={selAssessment} onValueChange={setSelAssessment}>
                  <SelectTrigger data-ocid="scout.assessment_select">
                    <SelectValue placeholder="Choose assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map(([id, a]: [string, Assessment]) => (
                      <SelectItem key={id} value={id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Select Player</Label>
                <Select value={selPlayer} onValueChange={setSelPlayer}>
                  <SelectTrigger data-ocid="scout.player_select">
                    <SelectValue placeholder="Choose player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(([pid, p]: [Principal, PlayerProfile]) => (
                      <SelectItem key={pid.toString()} value={pid.toString()}>
                        {p.name || pid.toString().substring(0, 12)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Physical (0-100)",
                    val: physical,
                    set: setPhysical,
                    id: "scout.physical_input",
                  },
                  {
                    label: "Technical (0-100)",
                    val: technical,
                    set: setTechnical,
                    id: "scout.technical_input",
                  },
                  {
                    label: "Tactical (0-100)",
                    val: tactical,
                    set: setTactical,
                    id: "scout.tactical_input",
                  },
                  {
                    label: "Mental (0-100)",
                    val: mental,
                    set: setMental,
                    id: "scout.mental_input",
                  },
                ].map(({ label, val, set, id }) => (
                  <div key={id} className="space-y-1">
                    <Label>{label}</Label>
                    <Input
                      data-ocid={id}
                      type="number"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button
                data-ocid="scout.assign_score_button"
                onClick={() => assignScoreMutation.mutate()}
                disabled={
                  assignScoreMutation.isPending || !selAssessment || !selPlayer
                }
                className="w-full"
              >
                {assignScoreMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Score"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
