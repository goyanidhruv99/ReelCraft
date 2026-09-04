"use client";

import { useCallback, useSyncExternalStore } from "react";
import { subscribeLocalStore } from "@/lib/local-store-events";

/**
 * Subscribe to a client-only snapshot (e.g. localStorage).
 * Pass a referentially stable getServerSnapshot (module-level constant).
 */
export function useClientSnapshot<T>(
  getSnapshot: () => T,
  getServerSnapshot: () => T,
  subscribeExtra: (onStoreChange: () => void) => () => void = subscribeLocalStore
): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => undefined;

      const onStorage = (event: StorageEvent) => {
        if (event.storageArea === localStorage) onStoreChange();
      };

      window.addEventListener("storage", onStorage);
      const unsubscribeExtra = subscribeExtra(onStoreChange);

      return () => {
        window.removeEventListener("storage", onStorage);
        unsubscribeExtra();
      };
    },
    [subscribeExtra]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
