import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Halaman tidak ditemukan</h1>
      <Link href="/login" className={styles.link}>
        Ke halaman masuk
      </Link>
    </main>
  );
}
