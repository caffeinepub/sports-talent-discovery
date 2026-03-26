import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppRole } from "../backend";
import { useAppUser } from "../hooks/useAppUser";

const ROLES: { role: AppRole; title: string; desc: string; emoji: string }[] = [
  {
    role: AppRole.player,
    title: "I am a Player",
    desc: "Upload your sport talent videos, attend assessments, and get discovered by scouts and sponsors.",
    emoji: "🏃",
  },
  {
    role: AppRole.scout,
    title: "I am a Scout / Committee",
    desc: "Discover talented players, conduct assessments, and score players from villages.",
    emoji: "🔍",
  },
  {
    role: AppRole.sponsor,
    title: "I am a Sponsor",
    desc: "Browse top talent, view videos, and shortlist players for sponsorship support.",
    emoji: "🤝",
  },
];

export function OnboardingPage() {
  const { profile, isProfileLoading, saveProfile, isSaving, isLoggedIn } =
    useAppUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isProfileLoading && profile) {
      const dest =
        profile.appRole === AppRole.player
          ? "/dashboard/player"
          : profile.appRole === AppRole.scout
            ? "/dashboard/scout"
            : "/dashboard/sponsor";
      void navigate({ to: dest });
    }
  }, [profile, isProfileLoading, navigate]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="text-muted-foreground"
          data-ocid="onboarding.loading_state"
        >
          Loading...
        </div>
      </div>
    );
  }

  const handleSelect = async (role: AppRole) => {
    try {
      await saveProfile({ appRole: role, name: "" });
      toast.success("Welcome to TalentTrack!");
      const dest =
        role === AppRole.player
          ? "/dashboard/player"
          : role === AppRole.scout
            ? "/dashboard/scout"
            : "/dashboard/sponsor";
      void navigate({ to: dest });
    } catch {
      toast.error("Failed to save role. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16">
      <h1 className="font-display text-4xl font-bold text-foreground mb-3 text-center">
        Welcome to TalentTrack
      </h1>
      <p className="text-muted-foreground mb-12 text-center max-w-md">
        Tell us who you are so we can personalize your experience.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {ROLES.map(({ role, title, desc, emoji }) => (
          <button
            type="button"
            key={role}
            data-ocid={`onboarding.${role}_button`}
            onClick={() => handleSelect(role)}
            disabled={isSaving}
            className="bg-card border border-border rounded-xl p-8 text-left hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
          >
            <div className="text-4xl mb-4">{emoji}</div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
