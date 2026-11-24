"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/storage";
import { createTracker, type Tracker, type TrackerState } from "@/lib/tracker";

let defaultTracker: Tracker | null = null;

function getDefaultTracker(): Tracker {
  defaultTracker ??= createTracker(createLocalStore());
  return defaultTracker;
}

const noop = () => () => {};
const serverSnapshot = () => null;

/**
 * Returns null while rendering on the server / before the browser data is read,
 * then the saved state plus actions.
 */
export function useExpenseTracker(tracker?: Tracker): (TrackerState & { actions: Tracker }) | null {
  const isClient = typeof window !== "undefined";
  const t = tracker ?? (isClient ? getDefaultTracker() : null);

  const state = useSyncExternalStore(
    t ? t.subscribe : noop,
    t ? t.getState : serverSnapshot,
    serverSnapshot,
  );

  return state && t ? { ...state, actions: t } : null;
}
