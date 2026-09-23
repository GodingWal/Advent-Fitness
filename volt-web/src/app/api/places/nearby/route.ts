import { NextResponse } from 'next/server';
export async function GET(req: Request) {
  const base = process.env.VOLT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const url = new URL(req.url);
  const q = url.searchParams.toString();
  try {
    const res = await fetch(base + '/places/nearby?' + q, { cache: 'no-store' });
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch { return NextResponse.json({ message: 'VOLT cannot reach the server.' }, { status: 502 }); }
}
