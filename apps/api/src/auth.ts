import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, bearer } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { createDb } from "./db/client";
import { schema, notes, settings } from "./db/schema";

export type AuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  // Comma-separated list of origins Better Auth (and the CORS layer)
  // will trust. Required — Better Auth rejects every cross-origin POST
  // from an unknown origin with INVALID_ORIGIN. Configured per-env in
  // wrangler.jsonc; the dev default covers the localhost ports.
  TRUSTED_ORIGINS: string;
  // Optional — Google sign-in is gated on both being set. Worker boots
  // without them; the auth client just won't surface the Google button.
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

function parseTrustedOrigins(env: AuthEnv): string[] {
  return (env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function hasGoogleProvider(env: AuthEnv): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

// Auth instance is created per-request because Workers env (D1 binding,
// secrets) is per-request, not module-level. Init cost is negligible.
export function createAuth(env: AuthEnv) {
  const db = createDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    // Browsers send Origin on cross-origin POSTs; Better Auth blocks any
    // origin not in this list. baseURL is implicitly trusted; everything
    // else (vite dev, astro dev, tauri webview, prod marketing) must be
    // listed. Source is the TRUSTED_ORIGINS env (comma-separated) so
    // dev/prod allowlists live next to the rest of the wrangler config.
    trustedOrigins: parseTrustedOrigins(env),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: hasGoogleProvider(env)
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : undefined,
    plugins: [
      anonymous({
        // Fires when an anonymous user upgrades to a real account.
        // Transfer FK rows (notes, settings) to the new user_id so the
        // canvas state and tweaks follow them in. Better Auth deletes
        // the anonymous user row after this hook returns.
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          await db
            .update(notes)
            .set({ userId: newUser.user.id })
            .where(eq(notes.userId, anonymousUser.user.id));
          await db
            .update(settings)
            .set({ userId: newUser.user.id })
            .where(eq(settings.userId, anonymousUser.user.id));
        },
      }),
      bearer(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
