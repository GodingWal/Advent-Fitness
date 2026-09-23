import { NextResponse } from 'next/server';
import { apiBase, getAccessToken, getRefreshToken, setSession, clearSession } from '@/lib/auth/session';

async function forward(req: Request, path: string) {
  const at = await getAccessToken();
  if (!at) return NextResponse.json({ message: 'Your session expired. Log in again.' }, { status: 401 });
  const base = apiBase();
  const url = new URL(req.url);
  const target = `${base}/${path}${url.search}`;
  const init: RequestInit = {
    method: req.method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try { init.body = await req.text(); } catch { init.body = undefined; }
  }
  try {
    let res = await fetch(target, init);
    // Expired-session recovery: try one refresh on 401.
    if (res.status === 401) {
      const rt = await getRefreshToken();
      if (rt) {
        try {
          const rr = await fetch(`${base}/auth/refresh`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
          });
          if (rr.ok) {
            const rd = (await rr.json()) as { accessToken: string; refreshToken: string };
            await setSession(rd.accessToken, rd.refreshToken);
            init.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${rd.accessToken}` };
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              try { init.body = await req.text(); } catch { /* body already consumed; retry without */ }
            }
            res = await fetch(target, init);
          } else {
            await clearSession();
          }
        } catch { /* fall through */ }
      }
    }
    const text = await res.text();
    return new NextResponse(text || '{}', { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return NextResponse.json({ message: 'VOLT cannot reach the server. Check your connection and try again.' }, { status: 502 });
  }
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, (ctx.params.path ?? []).join('/'));
}
export async function POST(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, (ctx.params.path ?? []).join('/'));
}
export async function PUT(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, (ctx.params.path ?? []).join('/'));
}
export async function DELETE(req: Request, ctx: { params: { path: string[] } }) {
  return forward(req, (ctx.params.path ?? []).join('/'));
}
