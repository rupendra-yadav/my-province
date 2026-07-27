// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, saveSession, saveTokens, clearTokens, StoredSession } from '../lib/authStorage';
import { VerifyOtpResult } from '../lib/endpoints';

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
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (result: VerifyOtpResult) => {
    if (result.tokens) {
      await saveTokens(result.tokens.accessToken, result.tokens.refreshToken);
    }
    const newSession: StoredSession = { isAdmin: result.isAdmin, user: result.user };
    await saveSession(newSession);
    setSession(newSession);
  };

  const logout = async () => {
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
