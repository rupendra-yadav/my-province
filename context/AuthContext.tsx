import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearTokens, getSession, saveSession, saveTokens, StoredSession } from '../services/authStorage';
import { getMe, logout as logoutRequest, SessionBundle, VerifyOtpResult } from '../services/endpoints';

type SessionWithTokens = SessionBundle & {
  tokens?: { accessToken: string; refreshToken: string | null } | null;
};
type AuthContextValue = {
  session: StoredSession | null;
  isLoading: boolean;
  login: (result: VerifyOtpResult) => Promise<void>;
  hydrateSession: (bundle: SessionWithTokens) => Promise<StoredSession>;
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

  const refreshProfile = async (base: StoredSession) => {
    try {
      const me = await getMe();
      if (!base.user) return;
      const merged: StoredSession = {
        ...base,
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
      // Network hiccup or not-yet-registered — keep existing session as-is.
    }
  };

  // Single source of truth for "persist a routing bundle as the active
  // session." Called after verify-otp, validate-token, and refresh —
  // whichever one just ran. Saves tokens only if this bundle carried
  // fresh ones (validate-token doesn't reissue tokens, refresh/login do).
  const hydrateSession = async (bundle: SessionWithTokens) => {
    if (bundle.tokens) {
      await saveTokens(bundle.tokens.accessToken, bundle.tokens.refreshToken);
    }
    const newSession: StoredSession = {
      isAdmin: bundle.isAdmin,
      isRegistered: bundle.isRegistered,
      requestStatus: bundle.requestStatus,
      user: bundle.user,
    };
    await saveSession(newSession);
    setSession(newSession);
    if (newSession.user) refreshProfile(newSession);
    return newSession;
  };

  const login = async (result: VerifyOtpResult) => {
    await hydrateSession(result);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Best-effort — clear locally regardless so the user isn't stuck.
    }
    await clearTokens();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, hydrateSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}