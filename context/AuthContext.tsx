// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearTokens, getSession, saveSession, saveTokens, StoredSession } from '../services/authStorage';
import { getMe, logout as logoutRequest, VerifyOtpResult } from '../services/endpoints';

type AuthContextValue = {
  session: StoredSession | null;
  isLoading: boolean; // true while reading persisted session on boot
  login: (result: VerifyOtpResult) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((s) => {
        setSession(s);
        if (s?.user) refreshProfile(s);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetches GET /auth/me and merges the flattened result into the
  // current session. Fire-and-forget by design — profile.tsx and the
  // dashboard header already fall back to '—' for anything not yet
  // populated, so a slow/failed fetch here just means those fields stay
  // blank a little longer, not a broken screen.
  const refreshProfile = async (base: StoredSession) => {
    try {
      const me = await getMe();
      if (!base.user) return;
      const merged: StoredSession = {
        isAdmin: me.isAdmin,
        user: {
          ...base.user,
          name: me.name,
          email: me.email,
          phone: me.phone,
          memberType: me.memberType,
          city: me.city,
          pincode: me.pincode,
          address: me.address,
          society: me.society?.name ?? null,
          block: me.block?.buildingName ?? null,
          flat: me.flat?.unitNumber ?? null,
        },
      };
      await saveSession(merged);
      setSession(merged);
    } catch {
      // Network hiccup or not-yet-registered — silently keep the
      // existing session as-is, nothing to surface to the user here.
    }
  };

  const login = async (result: VerifyOtpResult) => {
    if (result.tokens) {
      await saveTokens(result.tokens.accessToken, result.tokens.refreshToken);
      console.log('[auth] tokens saved after login');
    }
    const newSession: StoredSession = { isAdmin: result.isAdmin, user: result.user };
    await saveSession(newSession);
    setSession(newSession);
    if (newSession.user) refreshProfile(newSession);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Best-effort — if the server call fails (offline, expired token,
      // etc.) still clear locally so the user isn't stuck logged in on
      // this device. Server-side rows get cleaned up whenever this
      // (now-orphaned) session's token would've been refreshed anyway.
    }
    await clearTokens();
    setSession(null);
  };

  return <AuthContext.Provider value={{ session, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}