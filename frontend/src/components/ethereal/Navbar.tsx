import React from "react";
import type { User, Phase } from "../../api";

export type EtherealTab =
  | "dashboard"
  | "training"
  | "kitchen"
  | "biometrics"
  | "journal"
  | "calendar";

interface NavbarProps {
  currentTab: EtherealTab;
  setTab: (tab: EtherealTab) => void;
  user: User | null;
  phase: Phase | null;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  user,
  phase,
  onOpenProfile,
  onLogout,
}) => {
  const [profileOpen, setProfileOpen] = React.useState(false);

  const phaseLabel = phase
    ? `Day ${phase.day_in_cycle} · ${phase.phase}`
    : "Day 10 · Follicular Glow";

  const displayName = user?.display_name || user?.email?.split("@")[0] || "Elena R.";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(224,131,155,0.08)] border-b border-surface-container-high/60">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 min-w-max cursor-pointer"
          onClick={() => setTab("dashboard")}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm font-semibold text-lg">
            ✧
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-semibold">
              AURA // NYMPH
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider hidden sm:inline">
              Phase-Intelligent Athlete Sanctuary
            </span>
          </div>
        </div>

        {/* Global Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container/60 p-1.5 rounded-full backdrop-blur-md">
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full ${
              currentTab === "dashboard"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Dashboard & Tarot
          </button>
          <button
            type="button"
            onClick={() => setTab("training")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full ${
              currentTab === "training"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Cycle Training
          </button>
          <button
            type="button"
            onClick={() => setTab("kitchen")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full ${
              currentTab === "kitchen"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Nourish & Kitchen
          </button>
          <button
            type="button"
            onClick={() => setTab("biometrics")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full ${
              currentTab === "biometrics"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Biometrics & Trends
          </button>
          <button
            type="button"
            onClick={() => setTab("journal")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full flex items-center gap-1 ${
              currentTab === "journal"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span>Private Vault</span>
            <span className="text-xs">🔒</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("calendar")}
            className={`px-4 py-1.5 font-label-lg text-label-lg transition-all rounded-full flex items-center gap-1 ${
              currentTab === "calendar"
                ? "bg-surface-container-low text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span>Calendar</span>
            <span className="text-xs">📅</span>
          </button>
        </nav>

        {/* Live Status & User Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-max relative">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-caps text-label-caps backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>ESP32 Synced · 68ms HRV</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary font-label-caps text-label-caps backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>{phaseLabel}</span>
          </div>

          {/* Profile Dropdown / Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                <div className="font-label-md text-label-md text-on-surface font-medium truncate max-w-[120px]">
                  {displayName}
                </div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">
                  {user?.training_level || "Somatic Pro"}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-semibold ring-2 ring-primary-container/40 shadow-sm text-sm">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-xl border border-surface-container-high p-2 z-50 text-on-surface"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="p-2 border-b border-surface-container">
                  <div className="font-label-md font-semibold text-primary">{displayName}</div>
                  <div className="font-label-caps text-on-surface-variant text-xs">{user?.email}</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-caps text-[10px]">
                      {user?.height_cm || 168} cm
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-caps text-[10px]">
                      {user?.weight_kg || 62} kg
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-caps text-[10px]">
                      {user?.cycle_goal || "athletic_hypertrophy"}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-container flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">tune</span>
                    <span>Athletic & Bio Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setTab("journal");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-container flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-secondary">lock</span>
                    <span>Zero-Knowledge Vault</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setTab("calendar");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-container flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-tertiary">event</span>
                    <span>Cycle & Reminders</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-error hover:bg-error-container/30 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden flex items-center justify-around bg-surface-container-low px-2 py-1.5 border-t border-surface-container overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setTab("dashboard")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "dashboard" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setTab("training")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "training" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Training
        </button>
        <button
          type="button"
          onClick={() => setTab("kitchen")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "kitchen" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Nourish
        </button>
        <button
          type="button"
          onClick={() => setTab("biometrics")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "biometrics" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Biometrics
        </button>
        <button
          type="button"
          onClick={() => setTab("journal")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "journal" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Vault 🔒
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            currentTab === "calendar" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Calendar
        </button>
      </div>
    </header>
  );
};
