import { UnderDevelopment } from '@/components/under-development';
import styles from './member.module.css';

export default function MemberDashboardPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / Dashboard</p>
      <UnderDevelopment
        title="Dashboard Member"
        description="Ringkasan komisi dan link milik user akan tampil di sini."
      />
    </>
  );
}
