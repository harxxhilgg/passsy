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
import { SavedListSearch } from "./saved-list-search";
import { SavedListEmpty } from "./saved-list-empty";
import { SavedRecordItem } from "./saved-record-item";
import { SavedRecordSkeleton } from "./saved-record-skeleton";

export type { SavedRecord };

type SavedListProps = {
  data?: SavedRecord[] | null;
};

// Safe client hydration detection without cascading effect renders
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SavedList({ data }: SavedListProps) {
  const storeRecords = useSaveDataStore((state) => state.records);
  const hasHydrated = useSaveDataStore((state) => state._hasHydrated);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const items = useMemo(
    () => (data !== undefined ? (data ?? []) : storeRecords),
    [data, storeRecords]
  );

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

  // Filter items by site (case-insensitive)
  const filteredData = useMemo(() => {
    if (!items) return [];
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.site.toLowerCase().includes(query));
  }, [items, debouncedQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  // 1. Loading state (persisted records hydrating from localStorage)
  const isLoading = !isClient || (!data && !hasHydrated);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5">
        <SavedRecordSkeleton />
        <SavedRecordSkeleton />
      </div>
    );
  }

  // 2. Empty state (no saved records yet)
  if (items.length === 0) {
    return <SavedListEmpty type="no-records" />;
  }

  // 3. Normal list with search and records
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
            <SavedListEmpty type="no-results" query={debouncedQuery} />
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
