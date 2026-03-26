import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Trophy, X } from "lucide-react";
import { useState } from "react";
import { AppRole } from "../backend";
import { useAppUser } from "../hooks/useAppUser";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { login, clear, isInitializing } = useInternetIdentity();
  const { isLoggedIn, appRole, isAdmin } = useAppUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const dashboardLink =
    appRole === AppRole.player
      ? "/dashboard/player"
      : appRole === AppRole.scout
        ? "/dashboard/scout"
        : appRole === AppRole.sponsor
          ? "/dashboard/sponsor"
          : "/onboarding";

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              TalentTrack
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/leaderboard"
              data-ocid="nav.leaderboard_link"
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"}`}
            >
              Leaderboard
            </Link>
            {isLoggedIn && (
              <Link
                to={dashboardLink}
                data-ocid="nav.player_link"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith("/dashboard") || location.pathname === "/onboarding" ? "text-primary" : "text-muted-foreground"}`}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"}`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isInitializing ? (
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            ) : isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="nav.logout_button"
              >
                Sign Out
              </Button>
            ) : (
              <Button size="sm" onClick={login} data-ocid="nav.login_button">
                Sign In
              </Button>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-4">
          <Link
            to="/leaderboard"
            data-ocid="nav.leaderboard_link"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Leaderboard
          </Link>
          {isLoggedIn && (
            <Link
              to={dashboardLink}
              data-ocid="nav.player_link"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Admin
            </Link>
          )}
          {isInitializing ? null : isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              data-ocid="nav.logout_button"
            >
              Sign Out
            </Button>
          ) : (
            <Button size="sm" onClick={login} data-ocid="nav.login_button">
              Sign In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
