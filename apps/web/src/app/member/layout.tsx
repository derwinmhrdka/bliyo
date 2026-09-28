import { redirect } from 'next/navigation';
import { CmsShell } from '@/components/cms-shell';
import { getSession } from '@/lib/session';
import { sidebarIdentity } from '@/lib/sidebar-identity';

const items = [
  { href: '/member/profile', label: 'Profile' },
  { href: '/member', label: 'Dashboard', exact: true },
  { href: '/member/my-link', label: 'My Link' },
  { href: '/member/settings', label: 'Settings' },
  { href: '/member/transaction', label: 'Transaction' },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/expired');
  }
  if (session.role !== 'member') {
    redirect('/admin');
  }

  const identity = await sidebarIdentity(session.name);

  return (
    <CmsShell items={items} profile={{ href: '/member/profile', ...identity }}>
      {children}
    </CmsShell>
  );
}
