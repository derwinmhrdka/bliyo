import 'server-only';
import { redirect } from 'next/navigation';
import { getSession } from './session';

export async function apiFetch(path: string, init?: RequestInit) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/expired');
  }

  const base = process.env.API_INTERNAL_URL;
  if (!base) {
    throw new Error('API_INTERNAL_URL kosong');
  }

  return fetch(`${base}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...init?.headers,
    },
  });
}
