import { useCallback, useEffect, useRef, useState } from "react";
import { isTauri } from "../lib/runtime";
import {
  applyUpdate,
  checkForUpdate,
  type UpdaterStatus,
} from "../lib/updater";

const CHECK_DEBOUNCE_MS = 500;

/**
 * Polls the updater endpoint once on mount (after a short debounce so we
 * don't compete with the first paint), then exposes an installAndRelaunch
 * helper for the UI to wire to a button. No-op in the browser build.
 */
export function useUpdater() {
  const [status, setStatus] = useState<UpdaterStatus>({ kind: "idle" });
  const checkedOnceRef = useRef(false);

  useEffect(() => {
    if (!isTauri) return;
    if (checkedOnceRef.current) return;
    checkedOnceRef.current = true;

    const handle = window.setTimeout(async () => {
      setStatus({ kind: "checking" });
      try {
        const update = await checkForUpdate();
        if (!update) {
          setStatus({ kind: "up-to-date" });
          return;
        }
        setStatus({
          kind: "available",
          version: update.version,
          notes: update.body ?? null,
        });
      } catch (err) {
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }, CHECK_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, []);

  const installAndRelaunch = useCallback(async () => {
    setStatus((s) =>
      s.kind === "available"
        ? { kind: "downloading", downloaded: 0, total: null }
        : s,
    );
    try {
      await applyUpdate((downloaded, total) => {
        setStatus({ kind: "downloading", downloaded, total });
      });
      // applyUpdate calls relaunch(), so we shouldn't get here — but if
      // the relaunch is queued, surface a "ready" state for visibility.
      setStatus((s) =>
        s.kind === "downloading"
          ? { kind: "ready", version: "" }
          : s,
      );
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  return { status, installAndRelaunch };
}
