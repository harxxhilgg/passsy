import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SavedRecord = {
  id: string;
  site: string;
  username?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

type SaveDataStore = {
  records: SavedRecord[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addRecord: (
    record: Omit<SavedRecord, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateRecord: (
    id: string,
    record: Partial<Omit<SavedRecord, "id" | "createdAt">>
  ) => void;
  removeRecord: (id: string) => void;
  clearRecords: () => void;
};

export const useSaveDataStore = create<SaveDataStore>()(
  persist(
    (set) => ({
      records: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addRecord: (data) =>
        set((state) => {
          const now = new Date().toISOString();

          const newRecord: SavedRecord = {
            ...data,
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 9),
            createdAt: now,
            updatedAt: now,
          };

          return { records: [newRecord, ...state.records] };
        }),

      updateRecord: (id, updated) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...updated,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        })),

      clearRecords: () => set({ records: [] }),
    }),
    {
      name: "passsy-saved-records",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : ({} as Storage)
      ),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      partialize: (state) => ({ records: state.records }),
    }
  )
);
