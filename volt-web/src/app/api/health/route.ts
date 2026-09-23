import { NextResponse } from 'next/server';
export async function GET() {
  const base = process.env.VOLT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(base + '/health', { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
    const body = await res.json();
    return NextResponse.json({ ok: body?.ok === true, mode: process.env.VOLT_API_URL ? 'proxy' : 'direct' });
  } catch { return NextResponse.json({ ok: false }, { status: 502 }); }
}
