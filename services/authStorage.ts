import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'mp_access_token';
const REFRESH_TOKEN_KEY = 'mp_refresh_token';
const SESSION_KEY = 'mp_session';

export interface StoredSession {
  isAdmin: boolean;
  isRegistered: boolean;
  requestStatus: 'pending' | 'approved' | 'rejected' | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    societyId: number;
    memberType?: string | null;
    city?: string | null;
    pincode?: string | null;
    address?: string | null;
    society?: string | null;
    block?: string | null;
    flat?: string | null;
  } | null;
}

export async function saveTokens(accessToken: string, refreshToken: string | null) {
  console.log('saveTokens', accessToken, refreshToken);
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