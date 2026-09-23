import { NextResponse } from 'next/server';
import { apiBase, getRefreshToken, setSession, clearSession } from '@/lib/auth/session';
export async function POST() {
  const rt = await getRefreshToken();
  if (!rt) { await clearSession(); return NextResponse.json({ message: 'Your session expired. Log in again.' }, { status: 401 }); }
  try {
    const res = await fetch(apiBase() + '/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { await clearSession(); return NextResponse.json({ message: 'Your session expired. Log in again.' }, { status: 401 }); }
    await setSession(data.accessToken, data.refreshToken);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: 'VOLT cannot reach the server.' }, { status: 502 }); }
}
