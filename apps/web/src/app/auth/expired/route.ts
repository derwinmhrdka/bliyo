import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookies';
import { appUrl } from '@/lib/public-origin';

export async function GET(request: Request) {
  const response = NextResponse.redirect(appUrl(request.headers, '/login', request.url));
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
