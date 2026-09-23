import { NextResponse } from 'next/server';
import { apiBase, clearSession, getRefreshToken } from '@/lib/auth/session';
export async function POST() {
  const rt = await getRefreshToken();
  try { if (rt) await fetch(apiBase() + '/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) }); } catch {}
  await clearSession();
  return NextResponse.json({ success: true });
}
