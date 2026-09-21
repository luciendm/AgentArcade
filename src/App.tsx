import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import Layout from "./pages/_layout";
import { queryClient } from "./lib/query-client";
import { AppProviders } from "@/components/system/AppProviders";
import HomePage from "./pages/index";
import MissionsPage from "./pages/missions";
import MissionPlayPage from "./pages/mission-play";
import AchievementsPage from "./pages/achievements";
import LeaderboardPage from "./pages/leaderboard";
import ProfilePage from "./pages/profile";
import AdminPage from "./pages/admin";
import HauntedHighwayPage from "./pages/haunted-highway";
import PrintLaunchGuidePage from "./pages/print-launch-guide";
import NotFoundPage from "./pages/not-found";
import { AppErrorBoundary } from "./components/system/AppErrorBoundary";

const isDevMode = import.meta.env.DEV;

function getBase(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}/` : "/";
}
let appNameBase: string | undefined = undefined;
if (!isDevMode) {
  appNameBase = getBase(window.location.pathname);
}

function App() {
  return (
    <AppProviders>
      <QueryClientProvider client={queryClient}>
        <Router basename={appNameBase}>
          <AppErrorBoundary>
            <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
              <Routes>
                {/* Standalone print-friendly page (no sidebar) */}
                <Route path="/launch-guide/print" element={<PrintLaunchGuidePage />} />

                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="missions" element={<MissionsPage />} />
                  <Route path="missions/:missionId" element={<MissionPlayPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="haunted-highway" element={<HauntedHighwayPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AppErrorBoundary>
        </Router>
      </QueryClientProvider>
    </AppProviders>
  );
}

export default App;
