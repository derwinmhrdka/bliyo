import Link from 'next/link';
import { Nunito } from 'next/font/google';
import { LoginForm } from '@/components/login-form';
import styles from './login.module.css';

const motto = Nunito({
  subsets: ['latin'],
  weight: '300',
  display: 'swap',
  adjustFontFallback: false,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-green-dark px-4 pb-10 pt-8">
      <svg
        className={styles.wave}
        viewBox="0 0 920 560"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 380 C 180 320, 340 440, 560 380 C 720 335, 820 400, 920 360 L920 560 L0 560 Z"
          fill="#155c33"
        />
      </svg>
      <svg
        className={`${styles.wave} ${styles.waveFront}`}
        viewBox="0 0 920 560"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 460 C 200 410, 380 500, 620 450 C 760 420, 840 470, 920 445 L920 560 L0 560 Z"
          fill="#1a6b3f"
        />
      </svg>
      <div className="relative z-10 mx-auto flex flex-col items-center">
        <img src="/brand/bliyo-logo.png" alt="Bliyo" className="h-14 w-auto" />
        <p className={`${motto.className} mt-2 text-center text-[0.95rem] font-light leading-snug tracking-wide text-[#e7f3ec]`}>
          Belanja hemat, komisi mengalir
        </p>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center">
      <div className={`${styles.card} w-full max-w-[360px] rounded-[12px] px-6 py-8 shadow-[0_10px_28px_rgba(14,61,35,0.22)] sm:px-7`}>
        <LoginForm googleError={params.error === 'google'} />
        <p className="mt-5 text-center text-sm text-mute">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-green-accent">
            Daftar Sekarang!
          </Link>
        </p>
      </div>
      </div>
    </main>
  );
}
