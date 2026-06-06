// Persistent client-side session cache across SPA navigation transitions.
// Since Next.js App Router client transitions don't reload the window,
// this global memory state is preserved.

export interface CachedUser {
  name: string
  email: string
  role: string
}

let cachedUser: CachedUser | null | undefined = undefined;

// Get the user state synchronously from memory or sessionStorage
export function getCachedUser(): CachedUser | null | undefined {
  if (typeof window === "undefined") return null;

  // Try reading from sessionStorage for immediate first render on client
  if (cachedUser === undefined) {
    try {
      const stored = sessionStorage.getItem("topup_cached_user")
      if (stored) {
        cachedUser = JSON.parse(stored)
      } else {
        cachedUser = null
      }
    } catch (e) {
      cachedUser = null
    }
  }
  return cachedUser;
}

// Set the user state and persist to sessionStorage
export function setCachedUser(user: CachedUser | null) {
  cachedUser = user;
  if (typeof window !== "undefined") {
    try {
      if (user) {
        sessionStorage.setItem("topup_cached_user", JSON.stringify(user))
      } else {
        sessionStorage.removeItem("topup_cached_user")
      }
      // Dispatch custom event to notify all listening components (Header, Wrapper, etc.)
      window.dispatchEvent(new Event("auth-state-change"))
    } catch (e) {
      // Ignore error
    }
  }
}
