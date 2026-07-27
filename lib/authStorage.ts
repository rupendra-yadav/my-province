// lib/authStorage.ts
// Wraps expo-secure-store for persisting JWT tokens AND basic session
// info (isAdmin, societyId, etc.) across app restarts.
// Requires: npx expo install expo-secure-store

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'mp_access_token';
const REFRESH_TOKEN_KEY = 'mp_refresh_token';
const SESSION_KEY = 'mp_session';

export interface StoredSession {
  isAdmin: boolean;
  user: { id: string; name: string; email: string; phone: string; societyId: number } | null;
}

export async function saveTokens(accessToken: string, refreshToken: string | null) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// TODO: once GET /auth/me exists on the backend, prefer calling that on
// app boot for fresh data instead of relying solely on this cached copy.
export async function saveSession(session: StoredSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
