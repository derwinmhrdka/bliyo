import { LinkReview } from '@/components/link-review';
import styles from '../admin.module.css';

export default function AdminLinksPage() {
  return (
    <>
      <p className={styles.trail}>CMS Admin / Links</p>
      <h1 className={styles.title}>Links</h1>
      <LinkReview />
    </>
  );
}
