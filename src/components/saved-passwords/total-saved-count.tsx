"use client";

import { useSyncExternalStore } from "react";
import NumberFlow from "@number-flow/react";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function TotalSavedCount() {
  const count = useSaveDataStore((state) => state.records.length);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const displayCount = isClient ? count : 0;

  return <NumberFlow className="text-[15px]" value={displayCount} />;
}
