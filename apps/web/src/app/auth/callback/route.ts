import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookies';
import { appUrl } from '@/lib/public-origin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return NextResponse.redirect(appUrl(request.headers, '/login?error=google', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const destination = payload.role === 'member' ? '/' : '/admin';
    const response = NextResponse.redirect(appUrl(request.headers, destination, request.url));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.redirect(appUrl(request.headers, '/login?error=google', request.url));
  }
}
