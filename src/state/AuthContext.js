import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { http, configureHttp } from '../services/http';
import { getProfile as fetchProfile, updateProfile as saveProfile } from '../services/profile';
import { isValidEmail, isValidPassword } from '../utils/validation';
import { strings } from '../i18n/strings';

export const REFRESH_KEY = '@volt/auth-refresh';

const AuthContext = createContext(null);

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [hydrating, setHydrating] = React.useState(true);
  const [profile, setProfile] = React.useState(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  const accessTokenRef = useRef(null);
  const refreshInflightRef = useRef(null);
  const refreshingRef = useRef(false);

  const persistRefresh = useCallback(async (token) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(REFRESH_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      }
    } catch {
      // SecureStore may be unavailable in some test envs — tokens stay in memory.
    }
  }, []);

  const clearLocalAuth = useCallback(async () => {
    accessTokenRef.current = null;
    await persistRefresh(null);
    setSession(null);
    setProfile(null);
  }, [persistRefresh]);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const next = await fetchProfile();
      setProfile(next);
      return next;
    } catch {
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const next = await saveProfile(patch);
    if (next) setProfile(next);
    return next;
  }, []);

  const applyAuthResult = useCallback(
    async (data) => {
      const { accessToken, refreshToken, user } = data || {};
      if (!accessToken || !refreshToken) {
        throw new Error(strings.auth.genericError);
      }
      accessTokenRef.current = accessToken;
      await persistRefresh(refreshToken);
      if (user) setSession({ user });
      return user || null;
    },
    [persistRefresh]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const cleanEmail = normalizeEmail(email);
      if (!isValidEmail(cleanEmail)) throw new Error(strings.auth.invalidEmail);
      if (!isValidPassword(password)) throw new Error(strings.auth.passwordTooShort);
      const res = await http.post('/auth/login', { email: cleanEmail, password });
      const user = await applyAuthResult(res.data);
      refreshProfile().catch(() => {});
      return user;
    },
    [applyAuthResult, refreshProfile]
  );

  const register = useCallback(
    async ({ email, password, name }) => {
      const cleanEmail = normalizeEmail(email);
      if (!isValidEmail(cleanEmail)) throw new Error(strings.auth.invalidEmail);
      if (!isValidPassword(password)) throw new Error(strings.auth.passwordTooShort);
      const payload = { email: cleanEmail, password };
      if (name !== undefined && name !== null && String(name).trim() !== '') {
        payload.name = String(name).trim();
      }
      const res = await http.post('/auth/register', payload);
      const user = await applyAuthResult(res.data);
      refreshProfile().catch(() => {});
      return { user, devVerificationToken: res.data?.devVerificationToken ?? null };
    },
    [applyAuthResult, refreshProfile]
  );

  const refresh = useCallback(async () => {
    if (refreshInflightRef.current) return refreshInflightRef.current;
    const task = (async () => {
      refreshingRef.current = true;
      try {
        let stored = null;
        try {
          stored = await SecureStore.getItemAsync(REFRESH_KEY);
        } catch {
          stored = null;
        }
        if (!stored) throw new Error('No refresh token');
        const res = await http.post('/auth/refresh', { refreshToken: stored });
        const { accessToken, refreshToken } = res.data || {};
        if (!accessToken || !refreshToken) throw new Error('Invalid refresh response');
        accessTokenRef.current = accessToken;
        await persistRefresh(refreshToken);
        return accessToken;
      } finally {
        refreshingRef.current = false;
        refreshInflightRef.current = null;
      }
    })();
    refreshInflightRef.current = task;
    return task;
  }, [persistRefresh]);

  const me = useCallback(async () => {
    const res = await http.get('/auth/me');
    const user = res.data?.user ?? res.data;
    if (user) setSession({ user });
    return user || null;
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) throw new Error(strings.auth.invalidEmail);
    const res = await http.post('/auth/password-reset/request', { email: cleanEmail });
    return res.data || { sent: true };
  }, []);

  const confirmPasswordReset = useCallback(async ({ token, newPassword }) => {
    if (!token || !String(token).trim()) throw new Error(strings.auth.genericError);
    if (!isValidPassword(newPassword)) throw new Error(strings.auth.passwordTooShort);
    const res = await http.post('/auth/password-reset/confirm', {
      token: String(token).trim(),
      newPassword,
    });
    return res.data || null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await http.post('/auth/logout');
    } catch {
      // best-effort — always clear local state
    }
    await clearLocalAuth();
  }, [clearLocalAuth]);

  // Keep refs for the interceptor (avoids stale closures).
  const refreshRef = useRef(refresh);
  const meRef = useRef(me);
  const logoutRef = useRef(logout);
  const refreshProfileRef = useRef(refreshProfile);
  refreshRef.current = refresh;
  meRef.current = me;
  logoutRef.current = logout;
  refreshProfileRef.current = refreshProfile;

  useEffect(() => {
    configureHttp({
      getToken: async () => accessTokenRef.current,
      onUnauthorized: () => {
        if (refreshingRef.current || refreshInflightRef.current) return;
        (async () => {
          try {
            await refreshRef.current();
            await meRef.current();
          } catch {
            await logoutRef.current();
          }
        })();
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let stored = null;
        try {
          stored = await SecureStore.getItemAsync(REFRESH_KEY);
        } catch {
          stored = null;
        }
        if (stored) {
          try {
            await refreshRef.current();
            const user = await meRef.current();
            if (!cancelled && user) {
              refreshProfileRef.current().catch(() => {});
            } else if (!cancelled && !user) {
              await logoutRef.current();
            }
          } catch {
            if (!cancelled) await logoutRef.current();
          }
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.user),
      hydrating,
      profile,
      profileLoading,
      needsOnboarding:
        Boolean(session?.user) && Boolean(profile) && profile.onboardingCompleted !== true,
      refreshProfile,
      updateProfile,
      login,
      register,
      logout,
      signOut: logout,
      refresh,
      me,
      requestPasswordReset,
      confirmPasswordReset,
    }),
    [
      session,
      hydrating,
      profile,
      profileLoading,
      refreshProfile,
      updateProfile,
      login,
      register,
      logout,
      refresh,
      me,
      requestPasswordReset,
      confirmPasswordReset,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
