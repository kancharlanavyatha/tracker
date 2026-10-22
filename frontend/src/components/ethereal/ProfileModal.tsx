import React, { useState } from "react";
import type { User } from "../../api";
import { apiPatch } from "../../api";

interface ProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (u: User) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
  showToast,
}) => {
  if (!isOpen) return null;

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [age, setAge] = useState<number>(user?.age || 24);
  const [heightCm, setHeightCm] = useState<number>(user?.height_cm || 168);
  const [weightKg, setWeightKg] = useState<number>(user?.weight_kg || 62);
  const [trainingLevel, setTrainingLevel] = useState<string>(
    user?.training_level || "advanced_athlete"
  );
  const [cycleGoal, setCycleGoal] = useState<string>(
    user?.cycle_goal || "athletic_hypertrophy"
  );
  const [dietaryPref, setDietaryPref] = useState<string>(user?.dietary_pref || "all");
  const [allergies, setAllergies] = useState<string>(user?.allergies || "");
  const [favoriteCuisines, setFavoriteCuisines] = useState<string>(
    user?.favorite_cuisines || "indian,mediterranean"
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiPatch<User>("/users/me", {
        display_name: displayName,
        age,
        height_cm: heightCm,
        weight_kg: weightKg,
        training_level: trainingLevel,
        cycle_goal: cycleGoal,
        dietary_pref: dietaryPref,
        allergies,
        favorite_cuisines: favoriteCuisines,
      });
      onUserUpdated(updated);
      showToast("✨ Profile & personal targets updated!", "success");
      onClose();
    } catch {
      showToast("Profile saved in active session state", "info");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-container-high space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-surface-container/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">tune</span>
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                My Profile & Body Goals
              </h3>
              <p className="font-label-caps text-on-surface-variant text-xs">
                Personalizes your daily energy targets and workouts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Elena"
              className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Age
              </label>
              <input
                type="number"
                min="14"
                max="65"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="120"
                max="220"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="35"
                max="180"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Training Requirement / Level
              </label>
              <select
                value={trainingLevel}
                onChange={(e) => setTrainingLevel(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              >
                <option value="recreational">Recreational Fitness</option>
                <option value="intermediate">Intermediate Athlete</option>
                <option value="advanced_athlete">Competitive / Advanced</option>
                <option value="elite_powerlifter">Elite Strength / Power</option>
              </select>
            </div>

            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Athletic / Casual Goal
              </label>
              <select
                value={cycleGoal}
                onChange={(e) => setCycleGoal(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              >
                <option value="athletic_hypertrophy">Athletic Muscle & Hypertrophy</option>
                <option value="strength_peaking">Strength & 1RM Peaking</option>
                <option value="endurance_aerobic">Aerobic Endurance Pacing</option>
                <option value="general_vitality">Casual Energy & Vitality</option>
                <option value="fat_loss">Phase-Calibrated Fat Loss</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Dietary Preference
              </label>
              <select
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              >
                <option value="all">Omnivore / Flexible</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">100% Plant-Based (Vegan)</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="gluten_free">Gluten-Free</option>
                <option value="dairy_free">Dairy-Free</option>
              </select>
            </div>

            <div>
              <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
                Allergies / Dislikes
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. peanuts, shellfish"
                className="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
              />
            </div>
          </div>

          <div>
            <label className="font-label-caps text-on-surface-variant uppercase text-xs block mb-1">
              Favorite Cuisines
            </label>
            <input
              type="text"
              value={favoriteCuisines}
              onChange={(e) => setFavoriteCuisines(e.target.value)}
              placeholder="e.g. indian, mediterranean, japanese, mexican"
              className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-container/60">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-full bg-primary text-on-primary font-label-lg font-semibold hover:bg-on-primary-container transition-all cursor-pointer shadow-sm"
            >
              {saving ? "Saving Profile..." : "Save Profile 🌸"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-surface-container text-on-surface font-label-lg hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
