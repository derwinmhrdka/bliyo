import { cookies } from 'next/headers';
import { LOCALE_COOKIE, type Locale } from './locale-shared';

export type { Locale };

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'id';
}
