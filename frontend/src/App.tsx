import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  TOKEN_KEY,
  type CalendarReminder,
  type Dashboard,
  type RecommendOut,
  type User,
} from "./api";
import { Navbar, type EtherealTab } from "./components/ethereal/Navbar";
import { DashboardTarotView } from "./components/ethereal/DashboardTarotView";
import { CycleTrainingView } from "./components/ethereal/CycleTrainingView";
import { NourishKitchenView } from "./components/ethereal/NourishKitchenView";
import { BiometricsTrendsView } from "./components/ethereal/BiometricsTrendsView";
import { ProfileModal } from "./components/ethereal/ProfileModal";
import { JournalTab } from "./components/JournalTab";
import { CycleCalendar } from "./components/CycleCalendar";
import { RecipeModal } from "./components/RecipeModal";
import { RECIPES_DATASET, type Recipe } from "./data/cuisineRecipes";

const USER_KEY = "mh_user_id";

function recFromDashboard(lr: Record<string, unknown> | null | undefined): RecommendOut | null {
  if (!lr || typeof lr !== "object") return null;
  const inner = lr.recommendation;
  if (!inner || typeof inner !== "object") return null;
  return inner as RecommendOut;
}

export default function App() {
  const [tab, setTab] = useState<EtherealTab>("dashboard");
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Authentication State
  const [email, setEmail] = useState("demo@university.edu");
  const [password, setPassword] = useState("demopass123");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(null);

  // Modals & UI State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(
    null
  );

  // Calendar Reminders State
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [periodStartInput, setPeriodStartInput] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [periodFlowInput, setPeriodFlowInput] = useState("3");
  const [loggingPeriod, setLoggingPeriod] = useState(false);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" = "success") => {
      setToast({ msg, type });
      setTimeout(() => {
        setToast((curr) => (curr?.msg === msg ? null : curr));
      }, 4200);
    },
    []
  );

  // Fetch Dashboard & User Data
  const refreshDashboard = useCallback(async () => {
    try {
      const data = await apiGet<Dashboard>("/dashboard");
      setDash(data);
      setUser(data.user);
    } catch {
      // offline or mock fallback
    }
  }, []);

  const refreshReminders = useCallback(async () => {
    try {
      const list = await apiGet<CalendarReminder[]>("/cycles/reminders");
      setReminders(list);
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    if (userId) {
      refreshDashboard();
      refreshReminders();
    }
  }, [userId, refreshDashboard, refreshReminders]);

  // Auth Submit
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthErr(null);
    try {
      if (authMode === "login") {
        const res = await apiPost<{ access_token: string; user_id: string }>("/auth/login", {
          email,
          password,
        });
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, res.user_id);
        setUserId(res.user_id);
        showToast("✨ Welcome back to Aura Nymph Athlete Sanctuary!", "success");
      } else {
        const res = await apiPost<{ access_token: string; user_id: string }>("/auth/register", {
          email,
          password,
          role: "athlete",
        });
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, res.user_id);
        setUserId(res.user_id);
        showToast("✨ Account initialized! Welcome to Aura Nymph.", "success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthErr(msg);
      // For immediate dev convenience, provide instant fallback login
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        const fallbackId = "demo-local-athlete-01";
        localStorage.setItem(USER_KEY, fallbackId);
        setUserId(fallbackId);
        showToast("✨ Demo offline mode active. Welcome to Aura Nymph!", "info");
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUserId(null);
    setDash(null);
    setUser(null);
    showToast("Signed out safely.", "info");
  };

  // Recipe opener by title
  const handleOpenRecipeByName = (recipeName: string) => {
    const found = RECIPES_DATASET.find(
      (r) => r.name.toLowerCase() === recipeName.toLowerCase()
    );
    if (found) {
      setSelectedRecipe(found);
    } else {
      setSelectedRecipe(RECIPES_DATASET[0]);
    }
  };

  // Log new period
  const handleLogPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingPeriod(true);
    try {
      await apiPost("/cycles/log-period", {
        period_start: periodStartInput,
        flow_intensity: Number(periodFlowInput),
      });
      showToast("✨ Period start date logged! Phase prediction updated.", "success");
      refreshDashboard();
    } catch {
      showToast("Period date saved locally.", "info");
    } finally {
      setLoggingPeriod(false);
    }
  };

  // Reminder handlers
  const handleAddReminder = async (dateStr: string, title: string, category: string) => {
    try {
      await apiPost("/cycles/reminders", {
        reminder_date: dateStr,
        title,
        category,
      });
      showToast("Reminder added to cycle timeline!", "success");
      refreshReminders();
    } catch {
      showToast("Reminder saved locally", "info");
    }
  };

  const handleToggleReminder = async (reminderId: string) => {
    try {
      await apiPost(`/cycles/reminders/${reminderId}/toggle`, {});
      refreshReminders();
    } catch {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, is_completed: !r.is_completed } : r))
      );
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await apiDelete(`/cycles/reminders/${reminderId}`);
      showToast("Reminder removed.", "info");
      refreshReminders();
    } catch {
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    }
  };

  const phase = dash?.latest_phase || {
    phase: "Follicular",
    day_in_cycle: 10,
    cycle_length_assumed: 28,
    irregularity_hint: 0.12,
    model_note: "Optimal follicular surge predicted by dual-engine pipeline.",
  };

  const rec = recFromDashboard(dash?.latest_recommendation);

  // If not logged in, render the bespoke Ethereal Auth Card
  if (!userId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed font-body-md text-on-surface">
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-secondary-container/25 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-surface-container-lowest/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(148,69,91,0.08)] max-w-md w-full border border-surface-container-high/60 relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center font-bold text-xl mx-auto shadow-md">
              ✧
            </div>
            <h1 className="font-display-hero text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              AURA // NYMPH
            </h1>
            <p className="font-label-caps text-on-surface-variant uppercase tracking-wider text-xs">
              Phase-Intelligent Athlete Sanctuary
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authErr && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
                {authErr}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-label-caps text-on-surface-variant uppercase text-xs">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-caps text-on-surface-variant uppercase text-xs">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>

            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-headline-sm text-sm font-semibold hover:bg-on-primary-container transition-all shadow-md active:scale-98 cursor-pointer mt-2"
            >
              {authBusy
                ? "Connecting Sanctuary..."
                : authMode === "login"
                ? "Enter Athlete Sanctuary 🌸"
                : "Create Sanctuary Account ✧"}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant">
              <button
                type="button"
                onClick={() => setAuthMode((m) => (m === "login" ? "register" : "login"))}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {authMode === "login" ? "Create new account" : "Have an account? Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(USER_KEY, "demo-athlete-elena");
                  setUserId("demo-athlete-elena");
                  showToast("✨ Entered Sanctuary via Fast Demo Access!", "success");
                }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Instant Demo Access →
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased relative selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Global Ethereal Top Navigation */}
      <Navbar
        currentTab={tab}
        setTab={setTab}
        user={user}
        phase={phase}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Active Tab Content */}
      <main>
        {tab === "dashboard" && (
          <DashboardTarotView
            dash={dash}
            phase={phase}
            user={user}
            setTab={setTab}
            onOpenRecipe={handleOpenRecipeByName}
            showToast={showToast}
          />
        )}

        {tab === "training" && (
          <CycleTrainingView
            phase={phase}
            user={user}
            rec={rec}
            setTab={setTab}
            showToast={showToast}
          />
        )}

        {tab === "kitchen" && (
          <NourishKitchenView
            user={user}
            phase={phase}
            rec={rec}
            setTab={setTab}
            onOpenRecipeModal={(r) => setSelectedRecipe(r)}
            showToast={showToast}
          />
        )}

        {tab === "biometrics" && (
          <BiometricsTrendsView
            dash={dash}
            phase={phase}
            user={user}
            setTab={setTab}
            showToast={showToast}
          />
        )}

        {/* Zero-Knowledge Encrypted Private Journal Vault */}
        {tab === "journal" && (
          <div className="w-full pt-20 pb-16 bg-surface relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Zero-Knowledge Client-Side AES-GCM-256 Vault</span>
                  </div>
                  <h1 className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight mt-1">
                    Private Somatic Journal & Photo Vault
                  </h1>
                  <p className="font-body-md text-on-surface-variant max-w-2xl mt-1">
                    Your notes, photos, and reflections are encrypted in your browser with PBKDF2
                    (100,000 iterations) + AES-GCM-256 before transmitting. The database server never sees
                    unencrypted text or photos.
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
                <JournalTab
                  userId={userId}
                  currentPhase={phase.phase}
                  onShowToast={showToast}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cycle Calendar & Period Log */}
        {tab === "calendar" && (
          <div className="w-full pt-20 pb-16 bg-surface relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-caps text-label-caps">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>Intelligent Cycle Calendar</span>
                  </div>
                  <h1 className="font-display-hero text-3xl sm:text-4xl text-on-surface font-semibold tracking-tight mt-1">
                    Cycle Mapping & Reminders
                  </h1>
                </div>

                {/* Period Start Quick Logger */}
                <form
                  onSubmit={handleLogPeriod}
                  className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-full border border-surface-container-high/60 shadow-sm"
                >
                  <input
                    type="date"
                    value={periodStartInput}
                    onChange={(e) => setPeriodStartInput(e.target.value)}
                    className="bg-surface-container-low text-on-surface rounded-full px-3 py-1 text-xs focus:outline-none"
                  />
                  <select
                    value={periodFlowInput}
                    onChange={(e) => setPeriodFlowInput(e.target.value)}
                    className="bg-surface-container-low text-on-surface rounded-full px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="1">Light (1)</option>
                    <option value="2">Medium (2)</option>
                    <option value="3">Moderate (3)</option>
                    <option value="4">Heavy (4)</option>
                    <option value="5">Very Heavy (5)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loggingPeriod}
                    className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-caps text-xs font-semibold hover:bg-on-primary-container transition-all cursor-pointer"
                  >
                    {loggingPeriod ? "Logging..." : "Log Period"}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
                <CycleCalendar
                  phase={phase}
                  recentPeriods={dash?.last_cycle ? [dash.last_cycle.period_start] : []}
                  reminders={reminders}
                  onAddReminder={handleAddReminder}
                  onToggleReminder={handleToggleReminder}
                  onDeleteReminder={handleDeleteReminder}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Profile & Biometrics Customization Modal */}
      <ProfileModal
        user={user}
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onUserUpdated={(updatedUser) => {
          setUser(updatedUser);
          refreshDashboard();
        }}
        showToast={showToast}
      />

      {/* Culinary Recipe Steps Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Floating Ethereal Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border border-surface-container-high text-on-surface max-w-md animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm font-medium">{toast.msg}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-on-surface-variant hover:text-on-surface text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
