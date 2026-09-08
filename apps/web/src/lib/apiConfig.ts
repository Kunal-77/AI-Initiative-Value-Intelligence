/**
 * Global API Configuration for AIVI (AI Initiative Value Intelligence)
 *
 * Behavior:
 * 1. If `NEXT_PUBLIC_API_URL` is configured, normalize and use it.
 * 2. In local development (`NODE_ENV === "development"` or localhost/127.0.0.1 hostname),
 *    fallback to "http://localhost:8000" for the local FastAPI server.
 * 3. In production environments (Vercel deployment or non-localhost origins),
 *    NEVER fall back to localhost/127.0.0.1 to prevent Mixed Content (HTTPS -> HTTP)
 *    and client-side network failure. Instead, fallback to relative path ""
 *    for same-origin reverse-proxy rewrites.
 */

export function resolveApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // Development fallback for localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }

  // Client-side hostname check
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return "http://localhost:8000";
    }
    // In production browser, return relative root for same-origin rewrites
    return "";
  }

  return "";
}

export const API_BASE = resolveApiBase();
