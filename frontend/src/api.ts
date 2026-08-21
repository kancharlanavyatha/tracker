const API = "/api/v1";

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail ?? j);
  } catch {
    return await res.text();
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export type Phase = {
  phase: string;
  day_in_cycle: number;
  cycle_length_assumed: number;
  irregularity_hint: number;
  model_note: string;
};

export type Dashboard = {
  user: User;
  last_cycle: {
    id: string;
    user_id: string;
    period_start: string;
    period_end: string | null;
    flow_intensity: number | null;
    notes: string | null;
    created_at: string;
  } | null;
  recent_symptoms: Array<Record<string, unknown>>;
  latest_wearable: Record<string, unknown> | null;
  latest_phase: Phase | null;
  latest_recommendation: Record<string, unknown> | null;
  unread_notification_count: number;
  recent_notifications: Array<{
    id: string;
    kind: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
  }>;
};

export type RecommendOut = {
  training_intensity_score: number;
  recovery_hours_suggested: number;
  focus: string;
  dietary: Record<string, unknown>;
  workout_sessions: Array<Record<string, unknown>>;
  hydration_liters: number;
  micronutrients: string[];
  intensity_source: string;
  model_note: string;
};

export type ChatOut = { reply: string; source: string };

export type AnalyticsCycles = {
  period_starts: string[];
  inferred_cycle_lengths: number[];
};

export type AnalyticsSymptoms = {
  points: Array<{ log_date: string; mood: number | null; fatigue: number | null }>;
};

export type AnalyticsWearable = {
  daily: Array<{
    date: string;
    samples: number;
    avg_hrv_ms: number | null;
    avg_resting_hr: number | null;
  }>;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};
