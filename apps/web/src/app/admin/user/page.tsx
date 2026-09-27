import { UserManager } from '@/components/user-manager';
import { getSession } from '@/lib/session';
import styles from '../admin.module.css';

export default async function AdminUserPage() {
  const session = await getSession();

  return (
    <>
      <p className={styles.trail}>CMS Admin / User</p>
      <h1 className={styles.title}>User</h1>
      {session ? <UserManager selfId={session.id} selfRole={session.role} /> : null}
    </>
  );
}
