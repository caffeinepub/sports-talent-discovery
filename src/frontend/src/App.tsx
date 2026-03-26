import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Navbar } from "./components/Navbar";
import { AdminPage } from "./pages/AdminPage";
import { LandingPage } from "./pages/LandingPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { PlayerProfilePage } from "./pages/PlayerProfilePage";
import { ScoutDashboard } from "./pages/ScoutDashboard";
import { SponsorDashboard } from "./pages/SponsorDashboard";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const playerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/player",
  component: PlayerDashboard,
});

const scoutDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/scout",
  component: ScoutDashboard,
});

const sponsorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/sponsor",
  component: SponsorDashboard,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const playerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/$id",
  component: PlayerProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  playerDashboardRoute,
  scoutDashboardRoute,
  sponsorDashboardRoute,
  leaderboardRoute,
  playerProfileRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
