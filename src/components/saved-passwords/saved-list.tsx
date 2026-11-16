"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import { getUserPasswordsAction } from "@/app/actions/passwords";
import { useAuth } from "@/hooks/use-auth";
import { SavedListSearch } from "./saved-list-search";
import { SavedListEmpty } from "./saved-list-empty";
import { SavedRecordItem } from "./saved-record-item";
import { SavedRecordSkeleton } from "./saved-record-skeleton";

export type { SavedRecord };

type SavedListProps = {
  data?: SavedRecord[] | null;
  initialRecords?: SavedRecord[];
};

// Safe client hydration detection without cascading effect renders
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SavedList({ data, initialRecords }: SavedListProps) {
  const storeRecords = useSaveDataStore((state) => state.records);
  const isInitialized = useSaveDataStore((state) => state.isInitialized);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;
  const initialSyncRef = useRef(Boolean(initialRecords !== undefined));

  useEffect(() => {
    if (initialRecords !== undefined) {
      useSaveDataStore.getState().setRecords(initialRecords);
      initialSyncRef.current = true;
    }
  }, [initialRecords]);

  useEffect(() => {
    if (userId) {
      // If we already have initialRecords from server on mount, don't duplicate the fetch
      if (initialSyncRef.current) {
        initialSyncRef.current = false;
        return;
      }
      void getUserPasswordsAction().then((res) => {
        if (res.success && res.records) {
          useSaveDataStore.getState().setRecords(res.records);
        }
      });
    } else if (!isAuthLoading) {
      useSaveDataStore.getState().clearRecords();
    }
  }, [userId, isAuthLoading]);

  const items = useMemo(() => {
    if (data !== undefined) return data ?? [];
    return isInitialized ? storeRecords : (initialRecords ?? storeRecords);
  }, [data, isInitialized, storeRecords, initialRecords]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Smooth height transition references
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

  // 300ms debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Smooth height observer so container doesn't snap abruptly
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContentHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const showFavoritesOnly = useSaveDataStore(
    (state) => state.showFavoritesOnly
  );

  // Filter items by site (case-insensitive) & favorites filter, sorted with pinned first
  const filteredData = useMemo(() => {
    if (!items) return [];
    let list = items;

    const query = debouncedQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((item) => item.site.toLowerCase().includes(query));
    }

    if (showFavoritesOnly) {
      list = list.filter((item) => Boolean(item.isPinned));
    }

    return [...list].sort((a, b) => {
      const aPinned = Boolean(a.isPinned);
      const bPinned = Boolean(b.isPinned);
      if (aPinned === bPinned) return 0;
      return aPinned ? -1 : 1;
    });
  }, [items, debouncedQuery, showFavoritesOnly]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  // Loading state
  const isLoading =
    !isClient || (isAuthLoading && !isInitialized && !initialRecords);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5">
        <SavedRecordSkeleton />
        <SavedRecordSkeleton />
      </div>
    );
  }

  // Empty state (no saved records yet)
  if (items.length === 0) {
    return <SavedListEmpty type="no-records" />;
  }

  // Normal list with search and records
  return (
    <div className="flex flex-col">
      <SavedListSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={handleClearSearch}
      />

      {/* Smooth height-animated container */}
      <div
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{
          height: contentHeight !== undefined ? `${contentHeight}px` : "auto",
        }}
      >
        <div ref={contentRef} className="flex flex-col gap-3.5">
          {filteredData.length === 0 ? (
            showFavoritesOnly && !debouncedQuery ? (
              <SavedListEmpty type="no-favorites" />
            ) : (
              <SavedListEmpty type="no-results" query={debouncedQuery} />
            )
          ) : (
            filteredData.map((item) => (
              <SavedRecordItem key={item.id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
