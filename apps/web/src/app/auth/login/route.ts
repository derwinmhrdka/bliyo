import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
  }

  const apiUrl = process.env.API_INTERNAL_URL;
  if (!apiUrl) {
    return NextResponse.json({ message: 'Layanan sedang tidak tersedia.' }, { status: 500 });
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ message: 'Layanan sedang tidak tersedia.' }, { status: 502 });
  }

  const data = await apiResponse.json().catch(() => ({ message: 'Masuk gagal.' }));
  if (!apiResponse.ok) {
    return NextResponse.json(
      { message: data.message || 'Email atau kata sandi salah.' },
      { status: apiResponse.status },
    );
  }

  const redirectTo = data.user?.role === 'member' ? '/' : '/admin';
  const response = NextResponse.json({ redirect: redirectTo });
  response.cookies.set(SESSION_COOKIE, data.accessToken, sessionCookieOptions());
  return response;
}
