import { MemberSettings } from '@/components/member-settings';
import styles from '../member.module.css';

export default function MemberSettingsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / Settings</p>
      <h1 className={styles.title}>Settings</h1>
      <MemberSettings />
    </>
  );
}
