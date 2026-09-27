import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'Registration data is incomplete.' }, { status: 400 });
  }

  const apiUrl = process.env.API_INTERNAL_URL;
  if (!apiUrl) {
    return NextResponse.json({ message: 'The service is unavailable.' }, { status: 500 });
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: 'The service is unavailable.' }, { status: 502 });
  }

  const data = await apiResponse.json().catch(() => ({ message: 'Registration failed.' }));
  if (!apiResponse.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    return NextResponse.json({ message: message || 'Registration failed.' }, { status: apiResponse.status });
  }

  const response = NextResponse.json({ redirect: '/' });
  response.cookies.set(SESSION_COOKIE, data.accessToken, sessionCookieOptions());
  return response;
}
