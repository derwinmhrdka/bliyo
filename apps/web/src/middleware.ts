import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { appUrl } from '@/lib/public-origin';

const PUBLIC_PREFIXES = ['/login', '/register', '/auth', '/r', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('bliyo_session')?.value;
  const isPublic =
    pathname === '/' ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!token && !isPublic) {
    return NextResponse.redirect(appUrl(request.headers, '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|home/|favicon.ico).*)'],
};
