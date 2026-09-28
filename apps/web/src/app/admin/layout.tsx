import { redirect } from 'next/navigation';
import { CmsShell } from '@/components/cms-shell';
import { getSession } from '@/lib/session';
import { sidebarIdentity } from '@/lib/sidebar-identity';

const items = [
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/user', label: 'User' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/transactions', label: 'Transactions' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/expired');
  }
  if (session.role === 'member') {
    redirect('/');
  }

  const identity = await sidebarIdentity(session.name);

  return (
    <CmsShell items={items} profile={{ href: '/admin/profile', ...identity }}>
      {children}
    </CmsShell>
  );
}
