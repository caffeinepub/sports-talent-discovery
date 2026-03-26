import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Play, Star, Trophy, Users } from "lucide-react";
import { AppRole } from "../backend";
import { useAppUser } from "../hooks/useAppUser";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LandingPage() {
  const { login } = useInternetIdentity();
  const { isLoggedIn, appRole } = useAppUser();

  const dashboardLink =
    appRole === AppRole.player
      ? "/dashboard/player"
      : appRole === AppRole.scout
        ? "/dashboard/scout"
        : appRole === AppRole.sponsor
          ? "/dashboard/sponsor"
          : "/onboarding";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            Discover Village Sports Talent
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold text-foreground leading-tight mb-6">
            Every Village Has a<span className="text-primary"> Champion</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10">
            TalentTrack connects talented sports players from rural communities
            with scouts, committees, and sponsors who can give them the
            recognition they deserve.
          </p>
          <div className="flex flex-wrap gap-4">
            {isLoggedIn ? (
              <Link to={dashboardLink}>
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={login} className="gap-2">
                Get Started <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="gap-2">
                View Leaderboard <Trophy className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { label: "Rural Players Discovered", value: "500+", icon: Users },
            { label: "Assessments Conducted", value: "1,200+", icon: Star },
            { label: "Sponsored Athletes", value: "85+", icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-8 h-8 text-primary" />
              <div className="font-display text-4xl font-bold text-foreground">
                {value}
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
          How TalentTrack Works
        </h2>
        <p className="text-muted-foreground mb-12 max-w-xl">
          A simple three-step process to get village talent discovered.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Players Upload Videos",
              desc: "Athletes from villages upload their sports talent videos and complete their profile.",
              icon: Play,
            },
            {
              step: "02",
              title: "Scouts Assess Talent",
              desc: "Certified scouts conduct assessments and score players on physical, technical, tactical, and mental ability.",
              icon: Star,
            },
            {
              step: "03",
              title: "Sponsors Discover Stars",
              desc: "Sponsors and committees browse the leaderboard and shortlist promising talent for support.",
              icon: Trophy,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="bg-card border border-border rounded-xl p-6 relative"
            >
              <div className="font-display text-6xl font-bold text-primary/20 absolute top-4 right-6">
                {step}
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/10 border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to showcase your talent?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of players, scouts, and sponsors already on
            TalentTrack.
          </p>
          {!isLoggedIn ? (
            <Button size="lg" onClick={login}>
              Join Now
            </Button>
          ) : (
            <Link to={dashboardLink}>
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
