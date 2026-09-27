import { UnderDevelopment } from '@/components/under-development';
import styles from '../member.module.css';

export default function MemberSettingsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / Settings</p>
      <UnderDevelopment title="Settings" description="Pengaturan akun member menyusul." />
    </>
  );
}
