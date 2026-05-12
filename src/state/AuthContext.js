import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getJSON, removeItem, setJSON } from '../services/storage';

const AUTH_KEY = '@advent/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getJSON(AUTH_KEY);
      if (cancelled) return;
      if (stored?.token) setSession(stored);
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async ({ email }) => {
    const next = { token: `dev-token-${Date.now()}`, email };
    await setJSON(AUTH_KEY, next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    await removeItem(AUTH_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      hydrating,
      signIn,
      signOut,
    }),
    [session, hydrating, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
