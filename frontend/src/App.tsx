import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiGet,
  apiPatch,
  apiPost,
  type AnalyticsCycles,
  type AnalyticsSymptoms,
  type AnalyticsWearable,
  type ChatOut,
  type Dashboard,
  type NotificationRow,
  type RecommendOut,
  type User,
} from "./api";
import { CycleLengthBars, SymptomSparkline, WearableDailyChart } from "./components/Charts";
import { PhaseCard } from "./components/PhaseCard";

const USER_KEY = "mh_user_id";

type Tab = "dashboard" | "plans" | "analytics" | "alerts" | "data" | "chat";

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
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dash, setDash] = useState<Dashboard | null>(null);

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

  const [chatIn, setChatIn] = useState("What should I prioritize in training this week?");
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "assistant"; text: string; source?: string }>>([]);

  const [rec, setRec] = useState<RecommendOut | null>(null);

  const [cycA, setCycA] = useState<AnalyticsCycles | null>(null);
  const [symA, setSymA] = useState<AnalyticsSymptoms | null>(null);
  const [wearA, setWearA] = useState<AnalyticsWearable | null>(null);
  const [notifList, setNotifList] = useState<NotificationRow[]>([]);

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
    if (!userId || tab !== "analytics") return;
    void loadAnalytics().catch((e: unknown) => setErr(String(e)));
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

  const register = async () => {
    setBusy(true);
    setErr(null);
    try {
      const u = await apiPost<User>("/users/", {
        email,
        display_name: name || null,
      });
      localStorage.setItem(USER_KEY, u.id);
      setUserId(u.id);
      setDash(null);
      await loadDashboard(u.id);
    } catch (e: unknown) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUserId(null);
    setDash(null);
    setRec(null);
    setChatLog([]);
    setCycA(null);
    setSymA(null);
    setWearA(null);
    setNotifList([]);
  };

  const submitCycle = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    setSuccessMsg(null);
    try {
      await apiPost("/cycles/", {
        user_id: userId,
        period_start: periodStart,
        flow_intensity: flow ? Number(flow) : null,
      });
      setSuccessMsg("Cycle entry saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const submitSymptom = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    setSuccessMsg(null);
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
      setSuccessMsg("Symptom log saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const syncWearableDemo = async () => {
    if (!userId) return;
    setBusy(true);
    setErr(null);
    setSuccessMsg(null);
    try {
      const now = new Date().toISOString();
      await apiPost("/wearable-sync", {
        user_id: userId,
        points: [
          {
            recorded_at: now,
            hrv_ms: 42 + Math.random() * 8,
            skin_temp_c: 36.4 + Math.random() * 0.3,
            spo2_pct: 97 + Math.random(),
            resting_hr: 58 + Math.floor(Math.random() * 6),
            steps: 6200 + Math.floor(Math.random() * 2000),
            workout_type: "strength",
          },
        ],
      });
      setSuccessMsg("Demo wearable row inserted successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
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
      await loadDashboard();
    } catch (e: unknown) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const sendChat = async () => {
    if (!userId || !chatIn.trim()) return;
    setBusy(true);
    setErr(null);
    const msg = chatIn.trim();
    setChatIn("");
    setChatLog((l) => [...l, { role: "user", text: msg }]);
    try {
      const out = await apiPost<ChatOut>("/chat", { user_id: userId, message: msg });
      setChatLog((l) => [...l, { role: "assistant", text: out.reply, source: out.source }]);
    } catch (e: unknown) {
      setChatLog((l) => [...l, { role: "assistant", text: String(e) }]);
    } finally {
      setBusy(false);
    }
  };

  const markNotifRead = async (nid: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      await apiPatch(`/notifications/${nid}?user_id=${userId}`, { is_read: true });
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
        { id: "dashboard" as const, label: "Dashboard" },
        { id: "plans" as const, label: "Plans" },
        { id: "analytics" as const, label: "Analytics" },
        { id: "alerts" as const, label: "Alerts" },
        { id: "data" as const, label: "Log data" },
        { id: "chat" as const, label: "Assistant" },
      ] satisfies { id: Tab; label: string }[],
    [],
  );

  const unread = dash?.unread_notification_count ?? 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Phase-aware training & nutrition</h1>
          <p>FastAPI · PostgreSQL · React · scheduler · KB · tree model hook</p>
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
        <section className="panel">
          <h2>Create a demo user</h2>
          <p className="muted">Stores your profile in Postgres; no external accounts.</p>
          <div className="row" style={{ marginTop: 14 }}>
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
              Display name (optional)
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button className="primary" type="button" disabled={busy} onClick={() => void register()}>
              {busy ? "Working…" : "Register & continue"}
            </button>
          </div>
          {err ? <p className="error">{err}</p> : null}
        </section>
      ) : (
        <>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <p className="muted" style={{ margin: 0 }}>
              Signed in as <strong>{dash?.user.email ?? "…"}</strong>
            </p>
            <button type="button" className="ghost" onClick={logout}>
              Clear local session
            </button>
          </div>
          {err ? <p className="error">{err}</p> : null}
          {successMsg ? <p className="success">{successMsg}</p> : null}

          {tab === "dashboard" ? (
            <div className="grid grid-2">
              {phase ? <PhaseCard phase={phase} /> : <div className="panel muted">Loading phase…</div>}
              <div className="panel">
                <h2>Training / recovery</h2>
                <p className="muted">
                  Intensity: tree regressor if <code>artifacts/intensity_gb.joblib</code> exists, else rules. Source:{" "}
                  <strong>{rec?.intensity_source ?? "—"}</strong>
                </p>
                <button className="primary" type="button" disabled={busy} onClick={() => void runRecommend()}>
                  Refresh recommendation
                </button>
                {rec ? (
                  <div className="metrics" style={{ marginTop: 14 }}>
                    <div className="metric">
                      Intensity score
                      <strong>{rec.training_intensity_score}</strong>
                    </div>
                    <div className="metric">
                      Recovery (h)
                      <strong>{rec.recovery_hours_suggested}</strong>
                    </div>
                    <div className="metric">
                      Hydration (L)
                      <strong>{rec.hydration_liters}</strong>
                    </div>
                    <div className="metric">
                      Focus
                      <strong style={{ fontSize: "0.95rem" }}>{rec.focus.replaceAll("_", " ")}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="muted" style={{ marginTop: 12 }}>
                    No recommendation loaded yet — tap refresh or open Plans.
                  </p>
                )}
                <p className="muted" style={{ marginTop: 12 }}>
                  {rec?.model_note}
                </p>
              </div>
              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <h2>Latest wearable snapshot</h2>
                {dash?.latest_wearable ? (
                  <pre style={{ margin: 0, overflow: "auto", fontSize: 13 }}>
                    {JSON.stringify(dash.latest_wearable, null, 2)}
                  </pre>
                ) : (
                  <p className="muted">No wearable rows yet — use “Log data” or your ESP32 firmware.</p>
                )}
              </div>
              {dash && dash.recent_notifications.length > 0 ? (
                <div className="panel" style={{ gridColumn: "1 / -1" }}>
                  <h2>Recent alerts</h2>
                  <ul className="alert-list">
                    {dash.recent_notifications.map((n) => (
                      <li key={n.id}>
                        <strong>{n.title}</strong>
                        <span className="muted"> · {new Date(n.created_at).toLocaleString()}</span>
                        {!n.is_read ? <span className="pill">new</span> : null}
                        <div className="muted" style={{ marginTop: 4 }}>
                          {n.body}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "plans" ? (
            <div className="grid grid-2">
              <div className="panel">
                <h2>Diet planner (KB + macros)</h2>
                <button className="primary" type="button" disabled={busy} onClick={() => void runRecommend()}>
                  Generate / refresh
                </button>
                {rec?.dietary ? (
                  <div style={{ marginTop: 14 }}>
                    <p>
                      <strong>Hydration</strong>: {String(rec.hydration_liters)} L/day suggested
                    </p>
                    {rec.micronutrients?.length ? (
                      <p>
                        <strong>Micronutrients</strong>: {rec.micronutrients.join(", ")}
                      </p>
                    ) : null}
                    <h3 className="subh">Meal templates</h3>
                    <ul>
                      {(rec.dietary.meal_templates as Array<Record<string, unknown>> | undefined)?.map((m, i) => (
                        <li key={i}>
                          <strong>{String(m.meal)}</strong> — {String(m.focus)}
                          <div className="muted">{JSON.stringify(m.examples)}</div>
                        </li>
                      ))}
                    </ul>
                    <h3 className="subh">Snacks</h3>
                    <p>{(rec.dietary.snacks as string[] | undefined)?.join(" · ")}</p>
                  </div>
                ) : (
                  <p className="muted" style={{ marginTop: 12 }}>
                    Run refresh recommendation first.
                  </p>
                )}
              </div>
              <div className="panel">
                <h2>Workout micro-cycle</h2>
                {rec?.workout_sessions?.length ? (
                  <ol className="wo-list">
                    {rec.workout_sessions.map((s, i) => (
                      <li key={i}>
                        <strong>Day {String(s.day)}</strong> — {String(s.type)} · {String(s.minutes)} min · RPE cap{" "}
                        {String(s.rpe_cap)}
                        <div className="muted">{String(s.notes)}</div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="muted">No sessions yet.</p>
                )}
              </div>
            </div>
          ) : null}

          {tab === "analytics" ? (
            <div className="grid grid-2">
              <div className="panel">
                <h2>Cycle lengths (inferred)</h2>
                <button type="button" className="ghost" disabled={busy} onClick={() => void loadAnalytics()}>
                  Reload charts
                </button>
                <CycleLengthBars lengths={cycA?.inferred_cycle_lengths ?? []} />
              </div>
              <div className="panel">
                <h2>Symptom trends</h2>
                <div className="split-charts">
                  <div>
                    <h3 className="subh">Mood</h3>
                    <SymptomSparkline points={symA?.points ?? []} field="mood" />
                  </div>
                  <div>
                    <h3 className="subh">Fatigue</h3>
                    <SymptomSparkline points={symA?.points ?? []} field="fatigue" />
                  </div>
                </div>
              </div>
              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <h2>Wearable daily HRV (avg)</h2>
                <WearableDailyChart daily={wearA?.daily ?? []} />
              </div>
            </div>
          ) : null}

          {tab === "alerts" ? (
            <section className="panel">
              <h2>Notifications</h2>
              <p className="muted">Phase transitions are created by the background scheduler (every 4h).</p>
              <button type="button" className="ghost" disabled={busy} onClick={() => void loadNotifications()}>
                Refresh list
              </button>
              <ul className="alert-list" style={{ marginTop: 12 }}>
                {notifList.map((n) => (
                  <li key={n.id}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <strong>{n.title}</strong>
                        <span className="muted"> · {new Date(n.created_at).toLocaleString()}</span>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {n.body}
                        </div>
                      </div>
                      {!n.is_read ? (
                        <button type="button" className="primary" disabled={busy} onClick={() => void markNotifRead(n.id)}>
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {notifList.length === 0 ? <p className="muted">No notifications yet.</p> : null}
            </section>
          ) : null}

          {tab === "data" ? (
            <div className="grid grid-2">
              <div className="panel">
                <h2>Cycle entry</h2>
                <div className="row">
                  <label>
                    Period start
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                  </label>
                  <label>
                    Flow 1–5
                    <input type="number" min={1} max={5} value={flow} onChange={(e) => setFlow(e.target.value)} />
                  </label>
                  <button className="primary" type="button" disabled={busy} onClick={() => void submitCycle()}>
                    Save cycle
                  </button>
                </div>
              </div>
              <div className="panel">
                <h2>Symptom log</h2>
                <div className="row" style={{ gap: '12px' }}>
                  <label>
                    Date
                    <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                  </label>
                  <label>
                    Mood 1–10
                    <input type="number" min={1} max={10} value={mood} onChange={(e) => setMood(e.target.value)} />
                  </label>
                  <label>
                    Fatigue 1–10
                    <input type="number" min={1} max={10} value={fatigue} onChange={(e) => setFatigue(e.target.value)} />
                  </label>
                  <label>
                    Cramps 1–5
                    <input type="number" min={1} max={5} value={cramps} onChange={(e) => setCramps(e.target.value)} />
                  </label>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', minWidth: '100%', margin: '4px 0' }}>
                    <label style={{ flexDirection: 'row', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                      <input type="checkbox" checked={bloating} onChange={(e) => setBloating(e.target.checked)} style={{ minWidth: 'auto', width: '18px', height: '18px' }} />
                      Bloating
                    </label>
                    <label style={{ flexDirection: 'row', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                      <input type="checkbox" checked={headache} onChange={(e) => setHeadache(e.target.checked)} style={{ minWidth: 'auto', width: '18px', height: '18px' }} />
                      Headache
                    </label>
                    <label style={{ flexDirection: 'row', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                      <input type="checkbox" checked={backache} onChange={(e) => setBackache(e.target.checked)} style={{ minWidth: 'auto', width: '18px', height: '18px' }} />
                      Backache
                    </label>
                  </div>

                  <label>
                    Discharge
                    <select value={discharge} onChange={(e) => setDischarge(e.target.value)}>
                      <option value="none">None</option>
                      <option value="dry">Dry</option>
                      <option value="sticky">Sticky</option>
                      <option value="creamy">Creamy</option>
                      <option value="eggwhite">Eggwhite (Fertile)</option>
                      <option value="watery">Watery</option>
                    </select>
                  </label>
                  <label>
                    Water (Liters)
                    <input type="number" step="0.25" min="0" value={water} onChange={(e) => setWater(e.target.value)} />
                  </label>
                  <label>
                    Sleep (Hours)
                    <input type="number" step="0.5" min="0" value={sleep} onChange={(e) => setSleep(e.target.value)} />
                  </label>

                  <button className="primary" type="button" disabled={busy} onClick={() => void submitSymptom()} style={{ minWidth: '100%', marginTop: '8px' }}>
                    Save log
                  </button>
                </div>
              </div>
              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <h2>Wearable sync (demo)</h2>
                <p className="muted">POST /wearable-sync — use ESP32 sketch in /firmware for real hardware.</p>
                <button className="primary" type="button" disabled={busy} onClick={() => void syncWearableDemo()}>
                  Insert demo wearable row
                </button>
              </div>
            </div>
          ) : null}

          {tab === "chat" ? (
            <section className="panel chat">
              <h2>Local-first assistant</h2>
              <p className="muted">
                Backend tries Ollama when running; otherwise returns a stub string (see <code>OLLAMA_*</code> in{" "}
                <code>.env</code>).
              </p>
              <div className="chat-log">
                {chatLog.length === 0 ? (
                  <p className="muted">Ask about training load, recovery, or nutrition for your current phase.</p>
                ) : null}
                {chatLog.map((m, i) => (
                  <div key={i} className={`bubble ${m.role}`}>
                    {m.role === "assistant" && m.source ? <span className="tag">{m.source}</span> : null}
                    {m.text}
                  </div>
                ))}
              </div>
              <textarea value={chatIn} onChange={(e) => setChatIn(e.target.value)} placeholder="Your message…" />
              <div className="row">
                <button className="primary" type="button" disabled={busy} onClick={() => void sendChat()}>
                  Send
                </button>
                <button type="button" className="ghost" disabled={busy} onClick={() => void loadDashboard()}>
                  Reload dashboard context
                </button>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
