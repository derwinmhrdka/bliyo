import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';
import styles from './register.module.css';

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <img src="/brand/bliyo-logo.png" alt="Bliyo" className={styles.logo} />
      </header>
      <section className={styles.card}>
        <h1>Register</h1>
        <RegisterForm />
        <Link href="/login" className={styles.back}>
          Sudah punya akun? Masuk
        </Link>
      </section>
    </main>
  );
}
