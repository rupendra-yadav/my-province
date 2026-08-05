// services/api.ts
// Single shared API client, using axios. Every screen should call
// `apiFetch` (or the small helpers below) rather than using axios
// directly, so the auth header, envelope-unwrapping, and error shape
// stay consistent everywhere.

import axios, { AxiosError } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './authStorage';

// TODO: set EXPO_PUBLIC_API_URL in a .env file at the project root, e.g.:
//   EXPO_PUBLIC_API_URL=http://192.168.1.5/api/parisar/api/v1
// Use your machine's LAN IP for physical devices, 10.0.2.2 for the
// Android emulator, or localhost for the iOS simulator.
const BASE_URL =  'http://192.168.122.140/api/parisar/api/v1';

export class ApiError extends Error {
  code: number;
  errorCode: string | null;
  errors: Record<string, string> | null;

  constructor(code: number, message: string, errorCode: string | null, errors: Record<string, string> | null) {
    super(message);
    this.code = code;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

interface Envelope<T> {
  status: boolean;
  code: number;
  message: string;
  data: T | null;
  errorCode?: string | null;
  errors?: Record<string, string> | null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach Authorization header — default true
  query?: Record<string, string | number | undefined>;
}

const client = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ''),
  timeout: 15000,
});

/**
 * Makes the raw HTTP call and always returns an Envelope, even for
 * non-2xx responses — our backend's error responses are still valid
 * JSON envelopes (see utils/response.ts on the server), axios just
 * treats non-2xx as a thrown error by default, so we catch that and
 * pull the envelope back out of err.response.data.
 */
async function rawRequest<T>(path: string, options: RequestOptions): Promise<Envelope<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await client.request<Envelope<T>>({
      url: path,
      method: options.method ?? 'GET',
      headers,
      data: options.body,
      params: options.query,
    });

    console.log('apiFetch', path, options, res.data);
    return res.data;
  } catch (err) {
    const axiosErr = err as AxiosError<Envelope<T>>;

    if (axiosErr.response) {
      // Server responded (4xx/5xx) — our failure() envelope is still
      // valid JSON here, so just hand it back to apiFetch to unwrap.
      return axiosErr.response.data;
    }

    // No response reached us at all — wrong IP/host, server not
    // running, no network, blocked by firewall, etc.
    throw new ApiError(0, `Could not reach the server: ${axiosErr.message}`, 'NETWORK_ERROR', null);
  }
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Returns true on success, false if refresh failed (caller should then
 * force the user back to login).
 *
 * NOTE: POST /auth/refresh isn't implemented on the backend yet — this
 * will currently always fail until that endpoint is built. Left in
 * place so wiring it up later is a one-file change.
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const envelope = await rawRequest<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
    if (envelope.status && envelope.data) {
      await saveTokens(envelope.data.accessToken, envelope.data.refreshToken);
      return true;
    }
  } catch {
    // fall through to false
  }
  return false;
}

/**
 * Main entry point for all API calls. Unwraps the envelope's `data` on
 * success. Throws ApiError on failure — catch it in screens to read
 * `.errorCode` for branching (e.g. show "resend OTP" on OTP_EXPIRED).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let envelope = await rawRequest<T>(path, options);

  if (!envelope.status && envelope.code === 401 && options.auth !== false) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      envelope = await rawRequest<T>(path, options);
    } else {
      await clearTokens();
      // Caller (a top-level auth guard) should catch this errorCode and
      // redirect to the phone/login screen.
      throw new ApiError(401, 'Session expired. Please log in again.', 'SESSION_EXPIRED', null);
    }
  }

  if (!envelope.status) {
    throw new ApiError(envelope.code, envelope.message, envelope.errorCode ?? null, envelope.errors ?? null);
  }

  return envelope.data as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => apiFetch<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, options?: Partial<RequestOptions>) =>
    apiFetch<T>(path, { method: 'POST', body, ...options }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
};