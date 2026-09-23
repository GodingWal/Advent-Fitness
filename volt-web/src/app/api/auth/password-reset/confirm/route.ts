import { NextResponse } from 'next/server';
import { apiBase, setSession, clearSession, isSameOrigin } from '@/lib/auth/session';
import { authErrorMessage } from '@/lib/auth/messages';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ message: 'Invalid origin.' }, { status: 403 });
  let body: unknown = {}; try { body = await req.json(); } catch { body = {}; }
  try {
    const res = await fetch(apiBase() + '/auth/password-reset/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ message: authErrorMessage(res.status, data?.code), code: data?.code }, { status: res.status });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ message: authErrorMessage(0) }, { status: 502 }); }
}
