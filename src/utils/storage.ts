const AUTH_STORAGE_KEY = "motion.auth";

export interface StoredAuthState {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    email: string;
    userId: string;
    isVerified?: boolean;
    savedEvents: Array<{ eventId: string; source: "motion" | "ai" }>;
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAuthState(): StoredAuthState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthState;
    if (!parsed?.accessToken || !parsed?.user) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to parse auth state", error);
    return null;
  }
}

export function saveAuthState(state: StoredAuthState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist auth state", error);
  }
}

export function clearAuthState() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear auth state", error);
  }
}
