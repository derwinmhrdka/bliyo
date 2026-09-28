import 'server-only';
import { apiFetch } from './api';

export async function sidebarIdentity(fullName: string) {
  let firstName = fullName.trim().split(/\s+/)[0] || '';
  let avatar = '';
  const response = await apiFetch('/api/users/me');
  if (response.ok) {
    const profile = (await response.json()) as { firstName?: string | null; avatarData?: string | null };
    firstName = profile.firstName?.trim() || firstName;
    avatar = profile.avatarData || '';
  }
  return { firstName, avatar };
}
