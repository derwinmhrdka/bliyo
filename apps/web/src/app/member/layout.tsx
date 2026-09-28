import { redirect } from 'next/navigation';
import { CmsShell } from '@/components/cms-shell';
import { getSession } from '@/lib/session';

const items = [
  { href: '/member', label: 'Dashboard', exact: true },
  { href: '/member/my-link', label: 'My Link' },
  { href: '/member/profile', label: 'Profile' },
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

  return <CmsShell items={items}>{children}</CmsShell>;
}
