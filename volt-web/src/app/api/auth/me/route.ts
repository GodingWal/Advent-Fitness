import { NextResponse } from 'next/server';
import { fetchMe, getAccessToken } from '@/lib/auth/session';
export async function GET() {
  const at = await getAccessToken();
  if (!at) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const user = await fetchMe(at);
  if (!user) return NextResponse.json({ message: 'Your session expired. Log in again.' }, { status: 401 });
  return NextResponse.json({ user });
}
