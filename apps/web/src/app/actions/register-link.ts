'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export type RegisterLinkState = {
  error: string;
  shortUrl: string;
};

export async function registerLink(
  _previous: RegisterLinkState,
  formData: FormData,
): Promise<RegisterLinkState> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const english = formData.get('locale') === 'en';
  const emptyLink = english ? 'Enter a product link.' : 'Masukkan link produk.';
  const unavailable = english ? 'The service is unavailable.' : 'Layanan sedang tidak tersedia.';
  const failed = english ? 'Could not register the link.' : 'Link gagal didaftarkan.';

  const originalUrl = String(formData.get('originalUrl') || '').trim();
  if (!originalUrl) {
    return { error: emptyLink, shortUrl: '' };
  }

  const base = process.env.API_INTERNAL_URL;
  const web = (process.env.WEB_PUBLIC_URL || 'http://localhost:13003').replace(/\/$/, '');
  if (!base) {
    return { error: unavailable, shortUrl: '' };
  }

  try {
    const response = await fetch(`${base}/api/affiliate-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ originalUrl }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = Array.isArray(data.message) ? data.message[0] : data.message;
      return { error: message || failed, shortUrl: '' };
    }
    if (session.role === 'member') {
      redirect('/member/my-link');
    }
    return { error: '', shortUrl: `${web}/r/${data.shortCode}` };
  } catch {
    return { error: unavailable, shortUrl: '' };
  }
}
