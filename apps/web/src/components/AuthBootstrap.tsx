import { useEffect, useRef, useState, type ReactNode } from "react";
import { authClient, writeKeychainToken } from "../lib/auth-client";
import { API_BASE_URL } from "../lib/runtime";

// Guarantees a session exists whenever children render. On first mount
// and any time the session transitions to null (e.g. after sign-out),
// we kick off an anonymous sign-in. useSession's store updates as soon
// as the cookie lands, so children unblock as soon as a session exists
// — anon or real, the canvas doesn't care.
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const creatingRef = useRef(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (session) return;
    if (creatingRef.current) return;
    creatingRef.current = true;
    setLastError(null);
    authClient.signIn
      .anonymous()
      .then(async (res) => {
        if (res && "error" in res && res.error) {
          const msg = (res.error as { message?: string }).message ?? "sign-in returned an error";
          setLastError(msg);
          console.error("[auth] anonymous sign-in returned error", res.error);
          return;
        }
        // On Tauri the bearer token must be in the OS keychain before the
        // next get-session, but the auth-client onSuccess hook that writes it
        // can race the post-sign-in refetch, leaving the session null and
        // re-firing this effect. Persist the token straight from the sign-in
        // response, then re-read — deterministic, no race. No-op on web,
        // where the cookie is already set (writeKeychainToken bails early).
        const token = (res as { data?: { token?: string } } | null)?.data?.token;
        if (token) await writeKeychainToken(token);
        await refetch({ query: { disableCookieCache: true } });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(msg);
        console.error("[auth] anonymous sign-in failed", err);
      })
      .finally(() => {
        creatingRef.current = false;
      });
  }, [session, isPending]);

  if (isPending) return <BootScreen message="checking session…" />;
  if (!session) {
    return (
      <BootScreen
        message={lastError ? `couldn't reach the api` : "signing you in…"}
        detail={lastError ? `${lastError} · is ${API_BASE_URL} up?` : null}
      />
    );
  }
  return <>{children}</>;
}

function BootScreen({ message, detail }: { message: string; detail?: string | null }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "#0a0d12",
        color: "rgba(255,255,255,0.55)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12,
        letterSpacing: "0.02em",
      }}
    >
      <div>{message}</div>
      {detail && <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 11 }}>{detail}</div>}
    </div>
  );
}
