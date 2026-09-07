import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
  TOKEN_KEY,
  type AnalyticsCycles,
  type AnalyticsSymptoms,
  type AnalyticsWearable,
  type ChatOut,
  type Dashboard,
  type NotificationRow,
  type RecommendOut,
  type StoredFile,
  type User,
} from "./api";
import { CycleLengthBars, SymptomSparkline, WearableDailyChart } from "./components/Charts";
import { PhaseCard } from "./components/PhaseCard";
import { CycleWheel } from "./components/CycleWheel";
import { CycleCalendar } from "./components/CycleCalendar";

const USER_KEY = "mh_user_id";

type Tab = "dashboard" | "calendar" | "plans" | "analytics" | "alerts" | "data" | "chat";

function recFromDashboard(lr: Record<string, unknown> | null | undefined): RecommendOut | null {
  if (!lr || typeof lr !== "object") return null;
  const inner = lr.recommendation;
  if (!inner || typeof inner !== "object") return null;
  return inner as RecommendOut;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));
  const [email, setEmail] = useState("demo@university.edu");
  const [password, setPassword] = useState("demopass123");
  const [role, setRole] = useState("athlete");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [userFiles, setUserFiles] = useState<StoredFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState("wearable_csv");

  const [periodStart, setPeriodStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [flow, setFlow] = useState("3");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState("6");
  const [fatigue, setFatigue] = useState("5");
  const [cramps, setCramps] = useState("1");
  const [bloating, setBloating] = useState(false);
  const [headache, setHeadache] = useState(false);
  const [backache, setBackache] = useState(false);
  const [discharge, setDischarge] = useState("none");
  const [water, setWater] = useState("2.0");
  const [sleep, setSleep] = useState("8.0");

  const [remindPeriod, setRemindPeriod] = useState(true);
  const [remindFertile, setRemindFertile] = useState(true);
  const [remindHydration, setRemindHydration] = useState(true);
  const [remindSymptoms, setRemindSymptoms] = useState(false);

  const [chatIn, setChatIn] = useState("What should I prioritize in training this week?");
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "assistant"; text: string; source?: string }>>([]);

  const [rec, setRec] = useState<RecommendOut | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast((curr) => (curr?.msg === msg ? null : curr));
    }, 4000);
  }, []);

  useEffect(() => {
    if (tab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, tab, busy]);

  const [cycA, setCycA] = useState<AnalyticsCycles | null>(null);
  const [symA, setSymA] = useState<AnalyticsSymptoms | null>(null);
  const [wearA, setWearA] = useState<AnalyticsWearable | null>(null);
  const [notifList, setNotifList] = useState<NotificationRow[]>([]);

  // User Profile & Biometrics Customization
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profName, setProfName] = useState("");
  const [profAge, setProfAge] = useState<string>("");
  const [profHeight, setProfHeight] = useState<string>("");
  const [profWeight, setProfWeight] = useState<string>("");
  const [profTraining, setProfTraining] = useState<string>("Collegiate Distance Runner");
  const [profGoal, setProfGoal] = useState<string>("Endurance Performance & Energy Optimization");

  useEffect(() => {
    if (dash?.user) {
      setProfName(dash.user.display_name ?? "");
      setProfAge(dash.user.age != null ? String(dash.user.age) : "");
      setProfHeight(dash.user.height_cm != null ? String(dash.user.height_cm) : "");
      setProfWeight(dash.user.weight_kg != null ? String(dash.user.weight_kg) : "");
      if (dash.user.training_level) setProfTraining(dash.user.training_level);
      if (dash.user.cycle_goal) setProfGoal(dash.user.cycle_goal);
    }
  }, [dash?.user]);

  const liveBmi = useMemo(() => {
    const h = parseFloat(profHeight);
    const w = parseFloat(profWeight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const val = w / Math.pow(h / 100, 2);
    let category = "Normal";
    if (val < 18.5) category = "Underweight";
    else if (val >= 25 && val < 30) category = "Overweight";
    else if (val >= 30) category = "Obese";
    return { val: val.toFixed(1), category };
  }, [profHeight, profWeight]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const updated = await apiPatch<User>(`/users/${userId}/profile`, {
        display_name: profName.trim() || null,
        age: profAge ? parseInt(profAge, 10) : null,
        height_cm: profHeight ? parseFloat(profHeight) : null,
        weight_kg: profWeight ? parseFloat(profWeight) : null,
        training_level: profTraining.trim() || null,
        cycle_goal: profGoal.trim() || null,
      });
      if (dash) {
        setDash({ ...dash, user: updated });
      }
      setProfileModalOpen(false);
      showToast("✓ Personal biometrics and profile updated successfully!", "success");
    } catch (e: unknown) {
      showToast(`Failed to update profile: ${String(e)}`, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const loadDashboard = useCallback(
    async (uid?: string) => {
      const id = uid ?? userId;
      if (!id) return;
      setErr(null);
      const d = await apiGet<Dashboard>(`/dashboard/${id}`);
      setDash(d);
      const r = recFromDashboard(d.latest_recommendation ?? null);
      if (r) setRec(r);
    },
    [userId],
  );

  useEffect(() => {
    if (userId) void loadDashboard().catch((e: unknown) => setErr(String(e)));
  }, [userId, loadDashboard]);

  const loadAnalytics = useCallback(async () => {
    if (!userId) return;
    const [c, s, w] = await Promise.all([
      apiGet<AnalyticsCycles>(`/analytics/${userId}/cycles`),
      apiGet<AnalyticsSymptoms>(`/analytics/${userId}/symptoms?limit=50`),
      apiGet<AnalyticsWearable>(`/analytics/${userId}/wearables?days=21`),
    ]);
    setCycA(c);
    setSymA(s);
    setWearA(w);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (tab === "analytics" || tab === "calendar") {
      void loadAnalytics().catch((e: unknown) => setErr(String(e)));
    }
  }, [userId, tab, loadAnalytics]);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    const rows = await apiGet<NotificationRow[]>(`/notifications?user_id=${userId}&limit=40`);
    setNotifList(rows);
  }, [userId]);

  useEffect(() => {
    if (!userId || tab !== "alerts") return;
    void loadNotifications().catch((e: unknown) => setErr(String(e)));
  }, [userId, tab, loadNotifications]);

  const loadUserFiles = useCallback(async () => {
    if (!userId) return;
    try {
      const files = await apiGet<StoredFile[]>("/storage/files");
      setUserFiles(files);
    } catch {
      // Ignore if unauthenticated or empty
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void loadUserFiles();
    }
  }, [userId, loadUserFiles]);

  const handleAuth = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (authMode === "login") {
        const res = await apiPost<{ access_token: string; user: User }>("/auth/login", {
          email,
          password,
        });
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, res.user.id);
        setUserId(res.user.id);
        setDash(null);
        await loadDashboard(res.user.id);
        showToast("✓ Signed in successfully! Welcome back.", "success");
      } else {
        const res = await apiPost<{ access_token: string; user: User }>("/auth/register", {
          email,
          password,
          display_name: name || null,
          role,
        });
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, res.user.id);
        setUserId(res.user.id);
        setDash(null);
        await loadDashboard(res.user.id);
        showToast("✨ Account created! Welcome to Clue.", "success");
      }
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await apiPost<{ access_token: string; user: User }>("/auth/login", {
        email: "demo@university.edu",
        password: "demopass123",
      });
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, res.user.id);
      setUserId(res.user.id);
      setDash(null);
      await loadDashboard(res.user.id);
      showToast("✨ Welcome to Clue! Loaded Demo Athlete with 4 cycle logs.", "success");
    } catch (e: unknown) {
      setErr(String(e));
      showToast("Failed to load demo: " + String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setBusy(true);
    setErr(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", fileCategory);
      await apiUpload<StoredFile>("/storage/upload", formData);
      showToast("📁 Record uploaded securely to your private vault!", "success");
      setSelectedFile(null);
      await loadUserFiles();
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUserId(null);
    setDash(null);
    setRec(null);
    setChatLog([]);
    setCycA(null);
    setSymA(null);
    setWearA(null);
    setNotifList([]);
    setUserFiles([]);
    showToast("Signed out. See you soon!", "info");
  };

  const submitCycle = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/cycles/", {
        user_id: userId,
        period_start: periodStart,
        flow_intensity: flow ? Number(flow) : null,
      });
      showToast("🩸 Cycle entry saved! Forecast updated.", "success");
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const submitSymptom = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/symptom-logs/", {
        user_id: userId,
        log_date: logDate,
        mood: mood ? Number(mood) : null,
        fatigue: fatigue ? Number(fatigue) : null,
        symptoms: {
          cramps: Number(cramps),
          bloating,
          headache,
          backache,
          discharge,
          water_l: Number(water),
          sleep_h: Number(sleep),
        },
      });
      showToast("✓ Today's symptom log saved successfully!", "success");
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const syncWearableDemo = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    try {
      const now = new Date().toISOString();
      await apiPost("/wearable-sync", {
        user_id: userId,
        points: [
          {
            recorded_at: now,
            hrv_ms: 45 + Math.random() * 8,
            skin_temp_c: 36.4 + Math.random() * 0.3,
            spo2_pct: 97.5 + Math.random(),
            resting_hr: 57 + Math.floor(Math.random() * 6),
            steps: 7200 + Math.floor(Math.random() * 2000),
            workout_type: "strength",
          },
        ],
      });
      showToast("🔄 Wearable biometrics synced successfully!", "success");
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const runRecommend = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    try {
      const out = await apiPost<RecommendOut>("/recommend", { user_id: userId });
      setRec(out);
      showToast("⚡ Personalized advice updated for your current phase!", "success");
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
      showToast(String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const sendChat = async () => {
    if (!userId || !chatIn.trim()) return;
    const msg = chatIn.trim();
    setChatIn("");
    await askQuestionDirectly(msg);
  };

  const askQuestionDirectly = async (question: string) => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    setChatLog((l) => [...l, { role: "user", text: question }]);
    try {
      const out = await apiPost<ChatOut>("/chat", { user_id: userId, message: question });
      setChatLog((l) => [...l, { role: "assistant", text: out.reply, source: out.source }]);
    } catch (e: unknown) {
      setChatLog((l) => [
        ...l,
        { role: "assistant", text: "I'm having trouble retrieving advice right now. Please check back in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const markNotifRead = async (nid: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      await apiPatch(`/notifications/${nid}?user_id=${userId}`, { is_read: true });
      showToast("Notification marked as read", "info");
      await loadNotifications();
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const phase = dash?.latest_phase;

  const headerTabs = useMemo(
    () =>
      [
        { id: "dashboard" as const, label: "🪷 Cycle Wheel" },
        { id: "calendar" as const, label: "📅 Calendar" },
        { id: "plans" as const, label: "🥗 Plans" },
        { id: "analytics" as const, label: "📊 Analysis" },
        { id: "alerts" as const, label: "🔔 Reminders" },
        { id: "data" as const, label: "📝 Daily Log" },
        { id: "chat" as const, label: "💬 Ask Clue" },
      ] satisfies { id: Tab; label: string }[],
    [],
  );

  const unread = dash?.unread_notification_count ?? 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Clue · Period & Cycle Tracker</h1>
          <p>Hormone Pattern AI · Athletic Body Readiness · Tailored Nutrition</p>
        </div>
        <nav className="tabs" aria-label="Primary">
          {headerTabs.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
              {t.id === "alerts" && unread > 0 ? `${t.label} (${unread})` : t.label}
            </button>
          ))}
        </nav>
      </header>

      {!userId ? (
        <section className="panel welcome-hero-panel">
          <div className="welcome-hero-badge">🪷 Welcome to Clue</div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 8px" }}>Your Cycle & Athletic Wellness Companion</h2>
          <p className="muted" style={{ maxWidth: 640, margin: "0 0 18px", lineHeight: 1.5 }}>
            Track your cycle rhythm, synchronize your biometric wearables, balance hormones through phase-targeted nutrition, and receive evidence-based athletic recovery guidance.
          </p>

          <div className="demo-access-banner">
            <div>
              <strong style={{ color: "var(--accent)", fontSize: "1.05rem" }}>⚡ Instant Public Demo Access</strong>
              <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
                Explore all 7 tabs with pre-loaded cycle patterns, biometric charts, and training plans without having to create an account.
              </p>
            </div>
            <button
              className="primary demo-btn"
              type="button"
              disabled={busy}
              onClick={() => void handleDemoLogin()}
            >
              {busy ? "Loading Demo…" : "Explore as Demo Athlete →"}
            </button>
          </div>

          <div style={{ margin: "26px 0 10px", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <div className="row" style={{ gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                className={authMode === "login" ? "primary" : "ghost"}
                onClick={() => setAuthMode("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={authMode === "register" ? "primary" : "ghost"}
                onClick={() => setAuthMode("register")}
              >
                Create personal account
              </button>
            </div>
            <h3 style={{ fontSize: "1rem", margin: "0 0 6px" }}>
              {authMode === "login" ? "Sign in to your account" : "Create new account"}
            </h3>
            <div className="row" style={{ marginTop: 12 }}>
              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                />
              </label>
              {authMode === "register" ? (
                <>
                  <label>
                    Display name (optional)
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label>
                    Account role
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="athlete">Athlete / User</option>
                      <option value="coach">Coach / Trainer</option>
                    </select>
                  </label>
                </>
              ) : null}
              <button className="primary" type="button" disabled={busy} onClick={() => void handleAuth()}>
                {busy ? "Working…" : authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </div>
            {err ? <p className="error" style={{ marginTop: 12 }}>{err}</p> : null}
          </div>
        </section>
      ) : (
        <>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p className="muted" style={{ margin: 0 }}>
              Signed in as <strong>{dash?.user.display_name || dash?.user.email || "…"}</strong> ({dash?.user.role ?? "athlete"})
            </p>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <button
                type="button"
                className="secondary"
                style={{ fontSize: "0.82rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setProfileModalOpen(true)}
              >
                ⚙️ Profile & Biometrics
              </button>
              <button type="button" className="ghost" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
          {err ? <p className="error">{err}</p> : null}
          {successMsg ? <p className="success">{successMsg}</p> : null}

          {tab === "dashboard" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Biometrics & Customization Summary Pill */}
              <div
                className="profile-summary-pill"
                onClick={() => setProfileModalOpen(true)}
                title="Click to customize age, height, weight, and training goals"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.3rem" }}>👤</span>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                      {dash?.user.display_name || "Athlete Biometrics"}
                    </strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                      {dash?.user.age ? `${dash.user.age} yrs` : "Age unset"} ·{" "}
                      {dash?.user.height_cm ? `${dash.user.height_cm} cm` : "Height unset"} ·{" "}
                      {dash?.user.weight_kg ? `${dash.user.weight_kg} kg` : "Weight unset"} ·{" "}
                      <span style={{ color: "var(--accent)" }}>{dash?.user.training_level ?? "Recreational"}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {dash?.user.height_cm && dash?.user.weight_kg ? (
                    <span className="bmi-badge">
                      BMI {(dash.user.weight_kg / Math.pow(dash.user.height_cm / 100, 2)).toFixed(1)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="ghost"
                    style={{ fontSize: "0.78rem", padding: "4px 10px", borderColor: "var(--border)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileModalOpen(true);
                    }}
                  >
                    Edit Biometrics ✎
                  </button>
                </div>
              </div>

              {/* Clue Circular Cycle Wheel */}
              <CycleWheel
                phase={phase}
                onLogPeriodClick={() => {
                  setFlow("3");
                  const today = new Date().toISOString().slice(0, 10);
                  setPeriodStart(today);
                  setLogDate(today);
                  setTab("data");
                  showToast("🩸 Period logger ready. Flow intensity pre-selected for today.", "info");
                }}
                onLogSymptomsClick={() => {
                  setLogDate(new Date().toISOString().slice(0, 10));
                  setTab("data");
                  showToast("✎ Select today's symptoms, sensations & mood.", "info");
                }}
              />

              {/* Clue-Style Status & Readiness Cards Grid */}
              <div className="clue-cards-grid">
                <div className="clue-card highlight">
                  <div className="clue-card__header">
                    <span className="clue-card__icon">🌸</span>
                    <h4 className="clue-card__title">Cycle Status</h4>
                  </div>
                  <div className="clue-card__value">
                    {phase?.phase ? phase.phase.toUpperCase() : "UNKNOWN"}
                  </div>
                  <p className="clue-card__subtitle">
                    Day {phase?.day_in_cycle ?? 1} of ~{phase?.cycle_length_assumed ?? 28}d
                  </p>
                </div>

                <div className="clue-card readiness">
                  <div className="clue-card__header">
                    <span className="clue-card__icon">⚡</span>
                    <h4 className="clue-card__title">Athletic Readiness</h4>
                  </div>
                  <div className="clue-card__value">
                    {rec?.training_intensity_score ?? "75"}/100
                  </div>
                  <p className="clue-card__subtitle">
                    Target: {rec?.focus ? rec.focus.replaceAll("_", " ") : "Dynamic Load"}
                  </p>
                </div>

                <div className="clue-card">
                  <div className="clue-card__header">
                    <span className="clue-card__icon">💧</span>
                    <h4 className="clue-card__title">Optimal Hydration</h4>
                  </div>
                  <div className="clue-card__value">
                    {rec?.hydration_liters ?? "2.5"} L
                  </div>
                  <p className="clue-card__subtitle">
                    Suggested Recovery: {rec?.recovery_hours_suggested ?? "24"}h
                  </p>
                </div>

                <div className="clue-card">
                  <div className="clue-card__header">
                    <span className="clue-card__icon">🌿</span>
                    <h4 className="clue-card__title">Cycle Pattern</h4>
                  </div>
                  <div className="clue-card__value">
                    {phase?.irregularity_score && phase.irregularity_score > 0.15 ? "Variable" : "Regular Cycle"}
                  </div>
                  <p className="clue-card__subtitle">
                    {phase?.phase === "menstrual" ? "Active Flow Period" : "Hormonal Rhythm Active"}
                  </p>
                </div>
              </div>

              {/* Training Plan & Macro Focus Snapshot */}
              <div className="grid grid-2">
                <div className="panel">
                  <h2>Today's Body & Training Guidance</h2>
                  <p className="muted">
                    Smart recommendations dynamically tailored to your hormonal phase, vitals, and fatigue.
                  </p>
                  <button className="primary" type="button" disabled={busy} onClick={() => void runRecommend()}>
                    Refresh Today's Advice
                  </button>
                  {rec ? (
                    <div className="metrics" style={{ marginTop: 14 }}>
                      <div className="metric">
                        Readiness score
                        <strong>{rec.training_intensity_score}%</strong>
                      </div>
                      <div className="metric">
                        Recovery needed
                        <strong>{rec.recovery_hours_suggested}h</strong>
                      </div>
                      <div className="metric">
                        Water goal
                        <strong>{rec.hydration_liters} L</strong>
                      </div>
                      <div className="metric">
                        Workout style
                        <strong style={{ fontSize: "0.95rem" }}>{rec.focus.replaceAll("_", " ")}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="muted" style={{ marginTop: 12 }}>
                      Tap above to calculate your personalized training intensity and recovery advice.
                    </p>
                  )}
                  {rec?.model_note ? (
                    <p className="muted" style={{ marginTop: 12, fontStyle: "italic" }}>
                      "{rec.model_note}"
                    </p>
                  ) : null}
                </div>

                {phase ? <PhaseCard phase={phase} /> : <div className="panel muted">Calculating your cycle phase…</div>}
              </div>

              {/* Human-Readable Daily Vitals Dashboard */}
              <div className="panel">
                <h2>Daily Body Vitals Snapshot</h2>
                <p className="muted">Continuous wellness data synced from your wearable device.</p>
                <div className="vitals-grid">
                  <div className="vital-card">
                    <div className="vital-card__top">
                      <span>Resting Heart Rate</span>
                      <span className="vital-card__badge">Optimal</span>
                    </div>
                    <div className="vital-card__val">
                      {dash?.latest_wearable?.resting_hr ?? 58}<span className="vital-card__unit">bpm</span>
                    </div>
                    <p className="vital-card__desc">Baseline recovery rhythm</p>
                  </div>

                  <div className="vital-card">
                    <div className="vital-card__top">
                      <span>Heart Rate Variability</span>
                      <span className="vital-card__badge">High</span>
                    </div>
                    <div className="vital-card__val">
                      {dash?.latest_wearable?.hrv_ms ? Math.round(dash.latest_wearable.hrv_ms) : 46}<span className="vital-card__unit">ms</span>
                    </div>
                    <p className="vital-card__desc">Autonomic nervous system readiness</p>
                  </div>

                  <div className="vital-card">
                    <div className="vital-card__top">
                      <span>Blood Oxygen (SpO2)</span>
                      <span className="vital-card__badge">Normal</span>
                    </div>
                    <div className="vital-card__val">
                      {dash?.latest_wearable?.spo2_pct ? Math.round(dash.latest_wearable.spo2_pct) : 98}<span className="vital-card__unit">%</span>
                    </div>
                    <p className="vital-card__desc">Tissue cellular oxygenation</p>
                  </div>

                  <div className="vital-card">
                    <div className="vital-card__top">
                      <span>Skin Temperature</span>
                      <span className="vital-card__badge">Baseline</span>
                    </div>
                    <div className="vital-card__val">
                      {dash?.latest_wearable?.skin_temp_c ? dash.latest_wearable.skin_temp_c.toFixed(1) : "36.4"}<span className="vital-card__unit">°C</span>
                    </div>
                    <p className="vital-card__desc">Normal thermal phase</p>
                  </div>

                  <div className="vital-card">
                    <div className="vital-card__top">
                      <span>Daily Movement</span>
                      <span className="vital-card__badge">Active</span>
                    </div>
                    <div className="vital-card__val">
                      {dash?.latest_wearable?.steps?.toLocaleString() ?? "6,200"}<span className="vital-card__unit">steps</span>
                    </div>
                    <p className="vital-card__desc">Daily aerobic expenditure</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "calendar" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CycleCalendar
                phase={phase}
                recentPeriods={
                  cycA?.period_starts && cycA.period_starts.length > 0
                    ? cycA.period_starts
                    : dash?.last_cycle
                    ? [dash.last_cycle.period_start]
                    : []
                }
                onLogForDate={(d) => {
                  setLogDate(d);
                  setPeriodStart(d);
                  setTab("data");
                  showToast(`📝 Logging for ${d}. Choose symptoms & flow below.`, "info");
                }}
              />
              <div className="panel">
                <h2>Historical Periods Logged</h2>
                {cycA?.period_starts && cycA.period_starts.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {cycA.period_starts.map((pDate, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span>📅 <strong>{pDate}</strong></span>
                        <span className="muted">
                          {cycA.inferred_cycle_lengths?.[idx]
                            ? `Cycle duration: ~${cycA.inferred_cycle_lengths[idx]}d`
                            : "Recorded Period"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : dash?.last_cycle ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span>📅 <strong>{dash.last_cycle.period_start}</strong></span>
                      <span className="muted">Flow Intensity: {dash.last_cycle.flow_intensity ?? "—"}/5</span>
                    </li>
                  </ul>
                ) : (
                  <p className="muted">No cycles logged yet. Use the "Daily Log" tab to record your period start dates.</p>
                )}
              </div>
            </div>
          ) : null}

          {tab === "plans" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Top Nutrition & Macro Guidance */}
              <div className="panel">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2>Personalized Cycle Nutrition & Meal Guide</h2>
                    <p className="muted">
                      Hormonally synchronized nutrition optimized for energy stability and athletic recovery.
                    </p>
                  </div>
                  <button className="primary" type="button" disabled={busy} onClick={() => void runRecommend()}>
                    Refresh Meal Targets
                  </button>
                </div>

                <div className="metrics" style={{ marginTop: 14 }}>
                  <div className="metric">
                    Daily Water Goal
                    <strong>{rec?.hydration_liters ?? "2.5"} Liters</strong>
                  </div>
                  <div className="metric">
                    Key Micronutrients
                    <strong style={{ fontSize: "0.95rem" }}>
                      {rec?.micronutrients?.length ? rec.micronutrients.slice(0, 3).join(", ") : "Iron, Magnesium, B6"}
                    </strong>
                  </div>
                  <div className="metric">
                    Carb Tolerance
                    <strong>{phase?.phase === "follicular" || phase?.phase === "ovulatory" ? "High" : "Moderate"}</strong>
                  </div>
                  <div className="metric">
                    Metabolic Focus
                    <strong style={{ fontSize: "0.95rem" }}>
                      {phase?.phase === "menstrual" ? "Anti-inflammatory" : phase?.phase === "luteal" ? "PMS Calming" : "Glycogen Fueling"}
                    </strong>
                  </div>
                </div>

                {/* Curated Phase Meal Cards */}
                <div className="recipes-grid">
                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag">Breakfast</span>
                      <h4>Energizing Superfood Oats</h4>
                      <p>Warm rolled oats with chia seeds, pumpkin seeds, wild blueberries, and a scoop of plant protein.</p>
                    </div>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>High Fiber · Rich in Magnesium</span>
                  </div>

                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag">Lunch</span>
                      <h4>Mediterranean Hormone Bowl</h4>
                      <p>Quinoa, grilled wild salmon or baked tofu, baby spinach, roasted bell peppers, and creamy avocado tahini.</p>
                    </div>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>Omega-3 Fatty Acids · Iron Rich</span>
                  </div>

                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag">Dinner</span>
                      <h4>Warm Root Veggie & Protein Plate</h4>
                      <p>Roasted sweet potatoes, steamed broccoli spears, and spiced organic chicken breast or lentil curry.</p>
                    </div>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>Complex Carbs · Clean Protein</span>
                  </div>

                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag">Snack & Tea</span>
                      <h4>Antioxidant Craving Buster</h4>
                      <p>Two squares of 85% dark chocolate, a handful of raw walnuts, and organic peppermint chamomile tea.</p>
                    </div>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>Stress Reduction · Calming</span>
                  </div>
                </div>
              </div>

              {/* Phase-Optimized Workout Schedule */}
              <div className="panel">
                <h2>Phase-Optimized Workout Schedule</h2>
                <p className="muted">
                  Athletic sessions calibrated to your estrogen, progesterone, and physiological readiness scores.
                </p>

                <div className="recipes-grid" style={{ marginTop: 12 }}>
                  <div className="recipe-card" style={{ borderLeft: "4px solid #839958" }}>
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(131, 153, 88, 0.2)", color: "#839958" }}>Session 1</span>
                      <h4>Compound Strength & Power</h4>
                      <p>Focus on foundational compound lifts (squats, deadlifts, presses). Take 2-3 minute rests between working sets.</p>
                    </div>
                    <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>⏱ 45 mins</span>
                      <strong style={{ fontSize: "0.8rem", color: "var(--accent2)" }}>RPE 7.5 / 10</strong>
                    </div>
                  </div>

                  <div className="recipe-card" style={{ borderLeft: "4px solid #105666" }}>
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(16, 86, 102, 0.2)", color: "#3dd6c7" }}>Session 2</span>
                      <h4>Aerobic Stamina & Zone-2</h4>
                      <p>Steady-state conversational pace (incline treadmill walk, outdoor cycling, or light rowing). Preserves nervous system.</p>
                    </div>
                    <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>⏱ 40 mins</span>
                      <strong style={{ fontSize: "0.8rem", color: "#3dd6c7" }}>RPE 5.5 / 10</strong>
                    </div>
                  </div>

                  <div className="recipe-card" style={{ borderLeft: "4px solid #d3968c" }}>
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(211, 150, 140, 0.2)", color: "#d3968c" }}>Session 3</span>
                      <h4>Restorative Flow & Mobility</h4>
                      <p>Hip opening mobility, somatic foam rolling, thoracic spine rotations, and restorative deep diaphragmatic breathing.</p>
                    </div>
                    <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>⏱ 30 mins</span>
                      <strong style={{ fontSize: "0.8rem", color: "#d3968c" }}>RPE 3.0 / 10</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "analytics" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Clue Cycle Statistics Banner */}
              <div className="stats-banner">
                <div className="stat-box">
                  <p className="stat-box__label">Average Cycle</p>
                  <div className="stat-box__val">{phase?.cycle_length_assumed ?? 28} <span style={{ fontSize: "1rem" }}>days</span></div>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>Typical: 26–32 days</span>
                </div>
                <div className="stat-box">
                  <p className="stat-box__label">Typical Period</p>
                  <div className="stat-box__val">5 <span style={{ fontSize: "1rem" }}>days</span></div>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>Normal flow duration</span>
                </div>
                <div className="stat-box">
                  <p className="stat-box__label">Cycle Regularity</p>
                  <div className="stat-box__val" style={{ color: "var(--accent2)" }}>High</div>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>Consistent rhythm</span>
                </div>
                <div className="stat-box">
                  <p className="stat-box__label">Cycles Tracked</p>
                  <div className="stat-box__val" style={{ color: "#3dd6c7" }}>
                    {cycA?.period_starts ? cycA.period_starts.length : dash?.last_cycle ? 1 : 0}
                  </div>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>Historical logs</span>
                </div>
              </div>

              {/* Recurring Body & Symptom Patterns (Clue Feature) */}
              <div className="panel">
                <h2>Your Body Patterns & Insights</h2>
                <p className="muted">Recurring trends observed across your cycle phases.</p>
                <div className="recipes-grid" style={{ marginTop: 12 }}>
                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(131, 153, 88, 0.2)", color: "#839958" }}>Energy Peak</span>
                      <h4>High Focus & Stamina</h4>
                      <p>Occurs on 82% of your Follicular and Ovulation days. Best window for challenging training and creative projects.</p>
                    </div>
                  </div>
                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(211, 150, 140, 0.2)", color: "#d3968c" }}>Sensations</span>
                      <h4>Mild Bloating & Tender Breasts</h4>
                      <p>Occurs primarily in days 22–27 of your Luteal phase. Alleviated by hydration and magnesium-rich foods.</p>
                    </div>
                  </div>
                  <div className="recipe-card">
                    <div>
                      <span className="recipe-card__tag" style={{ background: "rgba(16, 86, 102, 0.2)", color: "#3dd6c7" }}>Sleep Quality</span>
                      <h4>Restful Deep Sleep</h4>
                      <p>Your highest HRV and lowest resting heart rates occur during the late follicular phase.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cycle Lengths & Symptom Charts */}
              <div className="grid grid-2">
                <div className="panel">
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h2>Cycle Length History</h2>
                    <button type="button" className="ghost" disabled={busy} onClick={() => void loadAnalytics()}>
                      Refresh
                    </button>
                  </div>
                  <CycleLengthBars lengths={cycA?.inferred_cycle_lengths ?? []} />
                </div>

                <div className="panel">
                  <h2>Symptom Sparklines</h2>
                  <div className="split-charts">
                    <div>
                      <h3 className="subh">Mood Spectrum</h3>
                      <SymptomSparkline points={symA?.points ?? []} field="mood" />
                    </div>
                    <div>
                      <h3 className="subh">Fatigue Recovery</h3>
                      <SymptomSparkline points={symA?.points ?? []} field="fatigue" />
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ gridColumn: "1 / -1" }}>
                  <h2>Wearable Recovery Trends (HRV)</h2>
                  <WearableDailyChart daily={wearA?.daily ?? []} />
                </div>
              </div>

              {/* 1-Click Printable Medical Summary (Clue Feature) */}
              <div className="doctor-report-box">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2>Doctor's Health & Cycle Summary</h2>
                    <p className="muted">
                      Generate a clean, clinical summary of your cycle patterns to share with your healthcare provider.
                    </p>
                  </div>
                  <button
                    className="primary"
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    📄 Print / Save as PDF
                  </button>
                </div>
                <div className="metrics" style={{ marginTop: 14 }}>
                  <div className="metric">
                    User / Patient
                    <strong style={{ fontSize: "0.9rem" }}>{dash?.user.email}</strong>
                  </div>
                  <div className="metric">
                    Cycle Length Range
                    <strong>26 – 31 Days</strong>
                  </div>
                  <div className="metric">
                    Primary Symptoms
                    <strong style={{ fontSize: "0.9rem" }}>Cramps (Mild), Bloating</strong>
                  </div>
                  <div className="metric">
                    Resting HR Range
                    <strong>54 – 64 bpm</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "alerts" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Clue Smart Reminders Settings */}
              <div className="panel">
                <h2>Smart Reminders & Notifications</h2>
                <p className="muted">Customize when and how Clue notifies you about your body changes.</p>

                <div style={{ marginTop: 16 }}>
                  <div className="reminder-item">
                    <div className="reminder-info">
                      <h4>🔔 Upcoming Period Countdown</h4>
                      <p>Get a gentle notification 2 days before your next period is estimated to start.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={remindPeriod}
                        onChange={(e) => {
                          setRemindPeriod(e.target.checked);
                          showToast(`🔔 Upcoming Period Countdown ${e.target.checked ? "enabled" : "muted"}`, "info");
                        }}
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="reminder-item">
                    <div className="reminder-info">
                      <h4>🌸 Fertile & Ovulation Window</h4>
                      <p>Alert when you enter your peak strength and estrogen surge window.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={remindFertile}
                        onChange={(e) => {
                          setRemindFertile(e.target.checked);
                          showToast(`🌸 Fertile & Ovulation alert ${e.target.checked ? "enabled" : "muted"}`, "info");
                        }}
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="reminder-item">
                    <div className="reminder-info">
                      <h4>💧 Daily Hydration & Electrolytes</h4>
                      <p>Mid-day nudge to meet your phase-specific water intake target.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={remindHydration}
                        onChange={(e) => {
                          setRemindHydration(e.target.checked);
                          showToast(`💧 Daily Hydration reminders ${e.target.checked ? "enabled" : "muted"}`, "info");
                        }}
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="reminder-item">
                    <div className="reminder-info">
                      <h4>📝 Evening Symptom Check-in</h4>
                      <p>A quick 1-minute prompt at 8:00 PM to log mood, sleep, and physical signs.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={remindSymptoms}
                        onChange={(e) => {
                          setRemindSymptoms(e.target.checked);
                          showToast(`📝 Evening Symptom Check-in ${e.target.checked ? "enabled" : "muted"}`, "info");
                        }}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Notifications Feed */}
              <section className="panel">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <h2>Notification History</h2>
                  <button type="button" className="ghost" disabled={busy} onClick={() => void loadNotifications()}>
                    Refresh
                  </button>
                </div>
                <ul className="alert-list" style={{ marginTop: 12 }}>
                  {notifList.length > 0 ? (
                    notifList.map((n) => (
                      <li key={n.id}>
                        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <strong>{n.title}</strong>
                            <span className="muted"> · {new Date(n.created_at).toLocaleDateString()}</span>
                            <div className="muted" style={{ marginTop: 6 }}>
                              {n.body}
                            </div>
                          </div>
                          {!n.is_read ? (
                            <button
                              type="button"
                              className="primary"
                              disabled={busy}
                              onClick={() => void markNotifRead(n.id)}
                            >
                              Mark read
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="muted">No notifications yet. You will be alerted as your cycle phases progress.</p>
                  )}
                </ul>
              </section>
            </div>
          ) : null}

          {tab === "data" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Clue Category-Based Daily Log Panel */}
              <div className="panel">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2>Daily Symptom & Wellness Logger</h2>
                    <p className="muted">
                      Select how your body feels today. Consistent logging sharpens your personalized cycle forecasts.
                    </p>
                  </div>
                  <div className="row" style={{ alignItems: "center", gap: 8 }}>
                    <label style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Log Date:</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => {
                        setLogDate(e.target.value);
                        setPeriodStart(e.target.value);
                      }}
                      style={{ padding: "6px 12px", borderRadius: "10px", width: "auto" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  {/* Category 1: Period & Flow */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">🩸 Period & Bleeding</div>
                    <div className="clue-tags-row">
                      {[
                        { val: "0", label: "None" },
                        { val: "1", label: "Spotting 💧" },
                        { val: "2", label: "Light 🩸" },
                        { val: "3", label: "Medium 🩸🩸" },
                        { val: "4", label: "Heavy 🩸🩸🩸" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          className={`clue-tag-btn ${flow === item.val ? "active" : ""}`}
                          onClick={() => setFlow(item.val)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Sensations & Pain */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">⚡ Physical Sensations & Pain</div>
                    <div className="clue-tags-row">
                      <button
                        type="button"
                        className={`clue-tag-btn ${cramps === "0" ? "active" : ""}`}
                        onClick={() => setCramps("0")}
                      >
                        No Cramps
                      </button>
                      <button
                        type="button"
                        className={`clue-tag-btn ${cramps === "2" ? "active" : ""}`}
                        onClick={() => setCramps("2")}
                      >
                        Mild Cramps 🌿
                      </button>
                      <button
                        type="button"
                        className={`clue-tag-btn ${cramps === "4" ? "active" : ""}`}
                        onClick={() => setCramps("4")}
                      >
                        Intense Cramps ⚡
                      </button>
                      <button
                        type="button"
                        className={`clue-tag-btn ${bloating ? "active" : ""}`}
                        onClick={() => setBloating(!bloating)}
                      >
                        🎈 Bloating {bloating ? "✓" : ""}
                      </button>
                      <button
                        type="button"
                        className={`clue-tag-btn ${headache ? "active" : ""}`}
                        onClick={() => setHeadache(!headache)}
                      >
                        🤕 Headache {headache ? "✓" : ""}
                      </button>
                      <button
                        type="button"
                        className={`clue-tag-btn ${backache ? "active" : ""}`}
                        onClick={() => setBackache(!backache)}
                      >
                        🦴 Backache {backache ? "✓" : ""}
                      </button>
                    </div>
                  </div>

                  {/* Category 3: Energy & Fatigue */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">🔋 Energy & Vitality</div>
                    <div className="clue-tags-row">
                      {[
                        { val: "2", label: "⚡ High Energy (Restful)" },
                        { val: "5", label: "🌿 Balanced & Steady" },
                        { val: "8", label: "😴 Sluggish / Fatigued" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          className={`clue-tag-btn ${fatigue === item.val ? "active" : ""}`}
                          onClick={() => setFatigue(item.val)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 4: Mood & Emotional State */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">🪷 Mood & Emotional State</div>
                    <div className="clue-tags-row">
                      {[
                        { val: "9", label: "✨ Happy & Radiant" },
                        { val: "8", label: "🧘 Calm & Grounded" },
                        { val: "6", label: "🌸 Sensitive & Reflective" },
                        { val: "4", label: "🔥 Irritable & Restless" },
                        { val: "3", label: "🌧 Low & Sad" },
                        { val: "5", label: "💭 Brain Fog / Distracted" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          className={`clue-tag-btn ${mood === item.val ? "active" : ""}`}
                          onClick={() => setMood(item.val)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 5: Cervical Fluid */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">💧 Cervical Fluid</div>
                    <div className="clue-tags-row">
                      {[
                        { val: "none", label: "None" },
                        { val: "dry", label: "Dry" },
                        { val: "sticky", label: "Sticky" },
                        { val: "creamy", label: "Creamy" },
                        { val: "eggwhite", label: "Eggwhite (Fertile Window) 🪷" },
                        { val: "watery", label: "Watery" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          className={`clue-tag-btn ${discharge === item.val ? "active" : ""}`}
                          onClick={() => setDischarge(item.val)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 6: Daily Habits (Hydration & Sleep) */}
                  <div className="clue-category-group">
                    <div className="clue-category-title">🌙 Lifestyle & Recovery Inputs</div>
                    <div className="row" style={{ gap: 16, alignItems: "flex-end" }}>
                      <label style={{ flex: 1 }}>
                        💧 Hydration ({water} Liters)
                        <div className="row" style={{ gap: 8, marginTop: 4 }}>
                          {["1.5", "2.0", "2.5", "3.0"].map((w) => (
                            <button
                              key={w}
                              type="button"
                              className={`clue-tag-btn ${water === w ? "active" : ""}`}
                              onClick={() => setWater(w)}
                            >
                              {w} L
                            </button>
                          ))}
                        </div>
                      </label>
                      <label style={{ flex: 1 }}>
                        😴 Sleep Duration ({sleep} Hours)
                        <div className="row" style={{ gap: 8, marginTop: 4 }}>
                          {["6.5", "7.5", "8.0", "9.0"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`clue-tag-btn ${sleep === s ? "active" : ""}`}
                              onClick={() => setSleep(s)}
                            >
                              {s} hrs
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Save Log Action */}
                  <div style={{ marginTop: 24 }}>
                    <button
                      className="primary"
                      type="button"
                      disabled={busy}
                      style={{ width: "100%", padding: "14px", fontSize: "1rem", borderRadius: "999px" }}
                      onClick={async () => {
                        await submitSymptom();
                        if (flow !== "0") {
                          await submitCycle();
                        }
                      }}
                    >
                      {busy ? "Saving Entry…" : "💾 Save Today's Body & Cycle Log"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Biometrics & Wearable Integration */}
              <div className="panel">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2>Smart Device & Biometric Sync</h2>
                    <p className="muted">
                      Continuously track resting HR, HRV, and skin temperature changes across your cycle phases.
                      Compatible with Apple Health, Garmin, WHOOP, Oura, or custom tracker devices.
                    </p>
                  </div>
                  <button
                    className="primary"
                    type="button"
                    disabled={busy}
                    onClick={() => void syncWearableDemo()}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    🔄 Sync Wearable Data
                  </button>
                </div>
              </div>

              {/* Health Records & Document Vault */}
              <div className="panel">
                <h2>Health Records & Document Vault</h2>
                <p className="muted">
                  Safely store hormonal lab results (estrogen, progesterone, LH/FSH), pelvic ultrasound scans, or physician notes in your private vault.
                </p>
                <div className="row" style={{ alignItems: "center", gap: 12, marginTop: 12 }}>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    style={{ flex: 1 }}
                  />
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    style={{ width: 180 }}
                  >
                    <option value="wearable_csv">Wearable Export (CSV)</option>
                    <option value="medical_report">Hormone Blood Panel</option>
                    <option value="physician_note">Physician Note</option>
                    <option value="general">Ultrasound / Other</option>
                  </select>
                  <button
                    className="primary"
                    type="button"
                    disabled={busy || !selectedFile}
                    onClick={() => void uploadFile()}
                  >
                    {busy ? "Uploading…" : "Upload Record"}
                  </button>
                </div>

                {userFiles.length > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Archived Health Records ({userFiles.length})</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {userFiles.map((f) => (
                        <li
                          key={f.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <div>
                            <strong>{f.original_filename}</strong>{" "}
                            <span className="muted" style={{ fontSize: "0.85rem" }}>
                              ({(f.file_size_bytes / 1024).toFixed(1)} KB · {f.category.replaceAll("_", " ")})
                            </span>
                          </div>
                          <a
                            href={`/api/v1/storage/${f.id}`}
                            download={f.original_filename}
                            style={{
                              padding: "4px 12px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              textDecoration: "none",
                              fontSize: "0.85rem",
                            }}
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === "chat" ? (
            <section className="panel chat">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2>🪷 Ask Clue · Your Cycle & Health Companion</h2>
                  <p className="muted">
                    Private, evidence-based guidance tailored to your current cycle phase, hormonal patterns, and training readiness.
                  </p>
                </div>
                <button type="button" className="ghost" disabled={busy} onClick={() => void loadDashboard()}>
                  Update Context
                </button>
              </div>

              {/* 1-Tap Suggestion Chips */}
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px" }}>
                  Popular topics to ask:
                </p>
                <div className="suggestion-chips">
                  {[
                    "🥗 What foods should I eat in my current phase?",
                    "🏃‍♀️ What workout intensity is best for today?",
                    "💓 Why does my resting heart rate change before my period?",
                    "🪷 How can I naturally ease cramps and bloating?",
                    "😴 Why do I experience lighter sleep during the luteal phase?",
                  ].map((question, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      className="chip-btn"
                      disabled={busy}
                      onClick={() => void askQuestionDirectly(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chat-log" style={{ minHeight: 280 }}>
                {chatLog.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🪷</div>
                    <strong style={{ color: "var(--text)" }}>Welcome to your Clue Companion</strong>
                    <p style={{ fontSize: "0.85rem", marginTop: 4 }}>
                      Ask questions about your phase-specific nutrition, recovery advice, workout timing, or symptom relief.
                    </p>
                  </div>
                ) : null}
                {chatLog.map((m, i) => (
                  <div key={i} className={`bubble ${m.role}`}>
                    {m.role === "assistant" ? (
                      <span className="tag" style={{ background: "rgba(131, 153, 88, 0.2)", color: "#839958" }}>
                        Clue Companion
                      </span>
                    ) : null}
                    {m.text}
                  </div>
                ))}
                {busy && (
                  <div className="bubble assistant" style={{ fontStyle: "italic", color: "var(--muted)" }}>
                    <span>🪷 Clue is reflecting on your question…</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div style={{ marginTop: 12 }}>
                <textarea
                  value={chatIn}
                  onChange={(e) => setChatIn(e.target.value)}
                  placeholder="Ask Clue about your body, symptoms, or workouts…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendChat();
                    }
                  }}
                />
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span className="muted" style={{ fontSize: "0.78rem" }}>
                    🔒 Confidential & private health dialogue
                  </span>
                  <button className="primary" type="button" disabled={busy || !chatIn.trim()} onClick={() => void sendChat()}>
                    {busy ? "Thinking…" : "Send Message"}
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      {/* Profile & Biometrics Customization Modal */}
      {profileModalOpen && (
        <div className="modal-backdrop" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Personalize Biometrics & Goals</h2>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                  Tailor hormone calculations, training load recommendations, and nutrition targets.
                </p>
              </div>
              <button
                type="button"
                className="ghost"
                style={{ padding: "4px 10px", fontSize: "1.1rem" }}
                onClick={() => setProfileModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label>
                Display Name / Athlete Name
                <input
                  type="text"
                  placeholder="e.g. Maya Chen"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                />
              </label>

              <div className="row" style={{ gap: 12 }}>
                <label style={{ flex: 1 }}>
                  Age (years)
                  <input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="e.g. 23"
                    value={profAge}
                    onChange={(e) => setProfAge(e.target.value)}
                  />
                </label>

                <label style={{ flex: 1 }}>
                  Height (cm)
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="250"
                    placeholder="e.g. 168.0"
                    value={profHeight}
                    onChange={(e) => setProfHeight(e.target.value)}
                  />
                </label>

                <label style={{ flex: 1 }}>
                  Weight (kg)
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    placeholder="e.g. 61.5"
                    value={profWeight}
                    onChange={(e) => setProfWeight(e.target.value)}
                  />
                </label>
              </div>

              {liveBmi && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(131, 153, 88, 0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                    Calculated BMI: <strong>{liveBmi.val}</strong> ({liveBmi.category})
                  </span>
                  <span className="bmi-badge">Active Biometric</span>
                </div>
              )}

              <label>
                Athletic Activity / Training Level
                <select
                  value={profTraining}
                  onChange={(e) => setProfTraining(e.target.value)}
                >
                  <option value="Collegiate Distance Runner">Collegiate Distance Runner</option>
                  <option value="Endurance Runner / Marathoner">Endurance Runner / Marathoner</option>
                  <option value="Strength / Powerlifting Athlete">Strength / Powerlifting Athlete</option>
                  <option value="High-Intensity HIIT / CrossFit">High-Intensity HIIT / CrossFit</option>
                  <option value="Competitive Team Sports (Soccer, Basketball)">Competitive Team Sports (Soccer, Basketball)</option>
                  <option value="Moderate Active & Fitness Enthusiast">Moderate Active & Fitness Enthusiast</option>
                  <option value="Low Impact & Mindful Movement">Low Impact & Mindful Movement</option>
                  <option value="General Wellness & Recovery">General Wellness & Recovery</option>
                </select>
              </label>

              <label>
                Cycle & Health Priority Goal
                <select
                  value={profGoal}
                  onChange={(e) => setProfGoal(e.target.value)}
                >
                  <option value="Endurance Performance & Energy Optimization">Endurance Performance & Energy Optimization</option>
                  <option value="Symptom Relief & PMS Mitigation">Symptom Relief & PMS Mitigation</option>
                  <option value="Cycle Regularity & Rhythm Alignment">Cycle Regularity & Rhythm Alignment</option>
                  <option value="Fertility Tracking & Ovulation Insight">Fertility Tracking & Ovulation Insight</option>
                  <option value="Injury Prevention & Connective Tissue Health">Injury Prevention & Connective Tissue Health</option>
                  <option value="Metabolic Health & Phase-Targeted Nutrition">Metabolic Health & Phase-Targeted Nutrition</option>
                </select>
              </label>

              <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setProfileModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={savingProfile}
                  onClick={() => void handleSaveProfile()}
                >
                  {savingProfile ? "Saving Profile…" : "Save Biometrics"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {toast ? (
        <div className="toast-container">
          <div className={`toast-notification ${toast.type}`}>
            <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{toast.msg}</span>
            <button type="button" className="toast-close-btn" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
