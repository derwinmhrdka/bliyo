import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(code)) {
    return new NextResponse('Link tidak ditemukan', { status: 404 });
  }

  const base = process.env.API_INTERNAL_URL;
  if (!base) {
    return new NextResponse('Layanan sedang tidak tersedia', { status: 502 });
  }

  const response = await fetch(`${base}/api/affiliate-links/code/${code}`, { cache: 'no-store' });
  if (!response.ok) {
    return new NextResponse('Link tidak ditemukan', { status: 404 });
  }

  const data = await response.json().catch(() => null);
  if (typeof data?.originalUrl !== 'string' || !/^https?:\/\//i.test(data.originalUrl)) {
    return new NextResponse('Link tidak ditemukan', { status: 404 });
  }

  return NextResponse.redirect(data.originalUrl);
}
