import { MerchantSettings } from '@/components/merchant-settings';
import styles from '../admin.module.css';

export default function AdminSettingsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Admin / Settings</p>
      <h1 className={styles.title}>Settings</h1>
      <MerchantSettings />
    </>
  );
}
