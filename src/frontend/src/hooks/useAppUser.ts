import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppRole } from "../backend";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAppUser() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const profileQuery = useQuery({
    queryKey: ["callerUserProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      const p = await actor!.getCallerUserProfile();
      return p;
    },
    enabled: !!actor && isLoggedIn,
    staleTime: 30_000,
  });

  const isAdminQuery = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && isLoggedIn,
    staleTime: 60_000,
  });

  const saveProfile = useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });

  return {
    isLoggedIn,
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    isAdmin: isAdminQuery.data ?? false,
    appRole: profileQuery.data?.appRole as AppRole | undefined,
    saveProfile: saveProfile.mutateAsync,
    isSaving: saveProfile.isPending,
    principal: identity?.getPrincipal(),
  };
}
