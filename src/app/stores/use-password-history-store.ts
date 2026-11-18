import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityAction = "saved" | "deleted" | "updated";

export type PasswordActivityEntry = {
  id: string;
  site: string;
  action: ActivityAction;
  timestamp: string; // ISO string
};

type PasswordHistoryStore = {
  history: PasswordActivityEntry[];
  addActivity: (entry: {
    site: string;
    action: ActivityAction;
    timestamp?: string;
  }) => void;
  removeActivity: (id: string) => void;
  clearHistory: () => void;
  seedFromExistingRecords: (
    records: { site: string; createdAt: string }[]
  ) => void;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePasswordHistoryStore = create<PasswordHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addActivity: ({ site, action, timestamp }) => {
        const trimmedSite = site?.trim();
        if (!trimmedSite) return;

        set((state) => {
          // If the very top entry is identical in site and action within 2 seconds, deduplicate
          const top = state.history[0];
          const now = timestamp || new Date().toISOString();
          if (
            top &&
            top.site.toLowerCase() === trimmedSite.toLowerCase() &&
            top.action === action &&
            Math.abs(
              new Date(now).getTime() - new Date(top.timestamp).getTime()
            ) < 2000
          ) {
            return state;
          }

          const entry: PasswordActivityEntry = {
            id: generateId(),
            site: trimmedSite,
            action,
            timestamp: now,
          };

          return {
            history: [entry, ...state.history].slice(0, 100),
          };
        });
      },
      removeActivity: (id: string) =>
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
      seedFromExistingRecords: (records) => {
        if (!records || records.length === 0) return;

        set((state) => {
          const existingKeys = new Set(
            state.history.map((h) => `${h.site.toLowerCase()}-${h.action}`)
          );

          const newEntries: PasswordActivityEntry[] = [];
          for (const rec of records) {
            const key = `${rec.site.trim().toLowerCase()}-saved`;
            if (!existingKeys.has(key)) {
              existingKeys.add(key);
              newEntries.push({
                id: generateId(),
                site: rec.site.trim(),
                action: "saved",
                timestamp: rec.createdAt || new Date().toISOString(),
              });
            }
          }

          if (newEntries.length === 0) return state;

          const merged = [...state.history, ...newEntries].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          return {
            history: merged.slice(0, 100),
          };
        });
      },
    }),
    {
      name: "passsy_password_activity_history",
    }
  )
);
