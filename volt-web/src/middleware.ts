import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS = 'volt_at';
const PUBLIC = [
  '/',
  '/features',
  '/gym-access',
  '/for-gyms',
  '/safety',
  '/privacy',
  '/terms',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return NextResponse.next();
  const authed = Boolean(req.cookies.get(ACCESS)?.value);
  if (PUBLIC.some((p) => pathname === p)) return NextResponse.next();
  const isOnboarding = pathname.startsWith('/onboarding');
  const isApp = pathname === '/app' || pathname.startsWith('/app/');
  if ((isApp || isOnboarding) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app', '/app/:path*', '/onboarding/:path*'],
};
