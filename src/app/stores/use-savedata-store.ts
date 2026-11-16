import { create } from "zustand";

export type SavedRecord = {
  id: string;
  site: string;
  email: string;
  username?: string;
  password: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
};

type SaveDataStore = {
  records: SavedRecord[];
  isInitialized: boolean;
  showFavoritesOnly: boolean;
  setRecords: (records: SavedRecord[]) => void;
  addRecord: (record: SavedRecord) => void;
  updateRecord: (id: string, record: Partial<SavedRecord>) => void;
  removeRecord: (id: string) => void;
  clearRecords: () => void;
  setShowFavoritesOnly: (show: boolean) => void;
  toggleShowFavoritesOnly: () => void;
  togglePin: (id: string) => void;
};

export const useSaveDataStore = create<SaveDataStore>()((set) => ({
  records: [],
  isInitialized: false,
  showFavoritesOnly: false,
  setRecords: (records) => set({ records, isInitialized: true }),
  addRecord: (record) =>
    set((state) => ({
      records: [record, ...state.records.filter((r) => r.id !== record.id)],
      isInitialized: true,
    })),
  updateRecord: (id, updated) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, ...updated } : r
      ),
    })),
  removeRecord: (id) =>
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    })),
  clearRecords: () => set({ records: [], isInitialized: true }),
  setShowFavoritesOnly: (showFavoritesOnly) => set({ showFavoritesOnly }),
  toggleShowFavoritesOnly: () =>
    set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),
  togglePin: (id) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, isPinned: !r.isPinned } : r
      ),
    })),
}));
