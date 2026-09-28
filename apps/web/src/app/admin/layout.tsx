import { redirect } from 'next/navigation';
import { CmsShell } from '@/components/cms-shell';
import { getSession } from '@/lib/session';

const items = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/profile', label: 'Profile' },
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

  return <CmsShell items={items}>{children}</CmsShell>;
}
