import { UnderDevelopment } from '@/components/under-development';
import styles from '../admin.module.css';

export default function AdminSettingsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Admin / Settings</p>
      <UnderDevelopment title="Settings" description="Konfigurasi sistem menyusul." />
    </>
  );
}
