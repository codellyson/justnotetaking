import { isTauri } from "./runtime";

// Tauri auto-updater wrapper. Only meaningful in the desktop binary —
// the browser bundle gets a no-op shape so callers can `if (isTauri)` or
// just await the helpers without ceremony.
//
// The Rust plugin is wired in src-tauri/src/lib.rs; the endpoint + pubkey
// live in src-tauri/tauri.conf.json#plugins.updater. tauri-action signs
// the latest.json + .app.tar.gz on every tagged release using
// TAURI_SIGNING_PRIVATE_KEY from repo secrets; the plugin validates the
// signature against the pubkey baked into the binary at compile time
// before applying any update.

export type UpdaterStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "up-to-date" }
  | { kind: "available"; version: string; notes: string | null }
  | { kind: "downloading"; downloaded: number; total: number | null }
  | { kind: "ready"; version: string }
  | { kind: "error"; message: string };

type UpdateModule = typeof import("@tauri-apps/plugin-updater");
type Update = Awaited<ReturnType<UpdateModule["check"]>>;

let cachedUpdate: NonNullable<Update> | null = null;
let cachedModule: UpdateModule | null = null;
let cachedProcess: typeof import("@tauri-apps/plugin-process") | null = null;

async function loadUpdater(): Promise<UpdateModule | null> {
  if (!isTauri) return null;
  if (!cachedModule) cachedModule = await import("@tauri-apps/plugin-updater");
  return cachedModule;
}

async function loadProcess() {
  if (!isTauri) return null;
  if (!cachedProcess) cachedProcess = await import("@tauri-apps/plugin-process");
  return cachedProcess;
}

/**
 * Hit the configured endpoint, parse latest.json, return the update
 * handle when one is available. Returns null in the browser and when
 * already on the latest version.
 */
export async function checkForUpdate(): Promise<NonNullable<Update> | null> {
  const mod = await loadUpdater();
  if (!mod) return null;
  const update = await mod.check();
  if (!update?.available) return null;
  cachedUpdate = update;
  return update;
}

/**
 * Download + apply the cached update found by checkForUpdate(), then
 * relaunch the app. The progress callback fires with `downloaded` bytes
 * counters from the plugin's "Progress" events.
 *
 * Throws if no update is cached (call checkForUpdate first) or in the
 * browser.
 */
export async function applyUpdate(
  onProgress?: (downloaded: number, total: number | null) => void,
): Promise<void> {
  if (!cachedUpdate) throw new Error("no update available — call checkForUpdate() first");
  let downloaded = 0;
  let total: number | null = null;
  await cachedUpdate.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        total = event.data.contentLength ?? null;
        break;
      case "Progress":
        downloaded += event.data.chunkLength;
        onProgress?.(downloaded, total);
        break;
      case "Finished":
        break;
    }
  });
  const proc = await loadProcess();
  if (proc) await proc.relaunch();
}
