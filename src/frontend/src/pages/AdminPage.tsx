import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useAppUser } from "../hooks/useAppUser";

export function AdminPage() {
  const { actor } = useActor();
  const { isAdmin } = useAppUser();
  const qc = useQueryClient();
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>(
    {},
  );

  const playersQuery = useQuery({
    queryKey: ["allPlayers"],
    queryFn: () => actor!.getAllPlayers(),
    enabled: !!actor,
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ user, role }: { user: Principal; role: UserRole }) =>
      actor!.assignCallerUserRole(user, role),
    onSuccess: () => {
      toast.success("Role updated!");
      qc.invalidateQueries({ queryKey: ["allPlayers"] });
    },
    onError: () => toast.error("Failed to update role."),
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Access denied. Admin only.
      </div>
    );
  }

  const players = playersQuery.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        data-ocid="admin.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <h1 className="font-display text-3xl font-bold text-foreground">
          Admin Panel
        </h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            All Players ({players.length})
          </h2>
        </div>
        {playersQuery.isLoading ? (
          <div
            data-ocid="admin.loading_state"
            className="p-8 text-center text-muted-foreground"
          >
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : !players.length ? (
          <div
            data-ocid="admin.empty_state"
            className="p-8 text-center text-muted-foreground"
          >
            No players yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {players.map(([pid, p], i) => {
              const pidStr = pid.toString();
              const selectedRole = pendingRoles[pidStr];
              return (
                <div
                  key={pidStr}
                  data-ocid={`admin.player.item.${i + 1}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/20"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {p.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {pidStr.substring(0, 24)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRole}
                      onValueChange={(v) =>
                        setPendingRoles((prev) => ({
                          ...prev,
                          [pidStr]: v as UserRole,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-28"
                        data-ocid={`admin.role_select.${i + 1}`}
                      >
                        <SelectValue placeholder="Set role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      data-ocid={`admin.assign_role_button.${i + 1}`}
                      disabled={!selectedRole || assignRoleMutation.isPending}
                      onClick={() =>
                        selectedRole &&
                        assignRoleMutation.mutate({
                          user: pid,
                          role: selectedRole,
                        })
                      }
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
