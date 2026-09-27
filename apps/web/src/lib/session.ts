import 'server-only';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from './cookies';

export type Session = {
  token: string;
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'member';
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
      return null;
    }
    const role = payload.role;
    if (role !== 'superadmin' && role !== 'admin' && role !== 'member') {
      return null;
    }
    return {
      token,
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
      name: typeof payload.name === 'string' ? payload.name : '',
      role,
    };
  } catch {
    return null;
  }
}
