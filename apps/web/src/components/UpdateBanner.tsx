import { Button } from "@codellyson/justui/react";
import { useUpdater } from "../hooks/useUpdater";

/**
 * Bottom-of-window pill that shows when an update is available, downloads
 * progress while installing, and any error. Hidden in idle / up-to-date /
 * checking states so it never distracts during normal use.
 *
 * Lives at the App level (outside AuthBootstrap) so it persists across
 * sign-in transitions and the boot screen.
 */
export function UpdateBanner() {
  const { status, installAndRelaunch } = useUpdater();

  if (status.kind === "idle") return null;
  if (status.kind === "checking") return null;
  if (status.kind === "up-to-date") return null;

  return (
    <div
      role="status"
      className={
        "fixed bottom-4 left-1/2 z-[300] -translate-x-1/2 " +
        "flex items-center gap-3 rounded-full border border-border " +
        "bg-bg-secondary/95 px-4 py-2 shadow-lg backdrop-blur " +
        "font-mono text-xs text-secondary " +
        "animate-[justui-fade_180ms_ease-out]"
      }
    >
      {status.kind === "available" && (
        <>
          <span>
            update <span className="text-primary">v{status.version}</span> available
          </span>
          <Button size="sm" onClick={installAndRelaunch}>
            install &amp; restart
          </Button>
        </>
      )}
      {status.kind === "downloading" && (
        <span>
          downloading{" "}
          {status.total
            ? `${Math.round((status.downloaded / status.total) * 100)}%`
            : `${Math.round(status.downloaded / 1024)} KB`}
        </span>
      )}
      {status.kind === "ready" && <span>restarting…</span>}
      {status.kind === "error" && (
        <span className="text-danger">update failed: {status.message}</span>
      )}
    </div>
  );
}
