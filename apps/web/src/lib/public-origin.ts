export function appOrigin(headers: Headers) {
  const configured = process.env.WEB_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  const host = (headers.get('x-forwarded-host') || headers.get('host') || '').split(',')[0].trim();
  const proto = (headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
  if (host && !host.startsWith('0.0.0.0')) {
    return `${proto}://${host}`;
  }
  return '';
}

export function appUrl(headers: Headers, path: string, fallback: string) {
  const origin = appOrigin(headers);
  if (!origin) return new URL(path, fallback);
  return new URL(path, `${origin}/`);
}
