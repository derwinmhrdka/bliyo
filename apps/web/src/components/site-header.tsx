import Link from 'next/link';
import styles from '@/app/home.module.css';
import type { Locale } from '@/lib/locale-shared';
import { LanguageSwitch } from './language-switch';
import { ProfileMenu } from './profile-menu';

export function SiteHeader({
  name,
  dashboardHref,
  locale,
  masuk,
  register,
  welcome,
  dasbor,
  keluar,
  langLabel,
}: {
  name?: string;
  dashboardHref?: string;
  locale: Locale;
  masuk: string;
  register: string;
  welcome: string;
  dasbor: string;
  keluar: string;
  langLabel: string;
}) {
  const initial = name?.trim().charAt(0).toUpperCase() || 'B';
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <header className={styles.header}>
      <svg className={styles.wave} viewBox="0 0 920 120" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 62 C 160 28, 320 96, 520 58 C 680 28, 800 78, 920 48 L920 120 L0 120 Z"
          fill="#155c33"
        />
      </svg>
      <svg
        className={`${styles.wave} ${styles.waveFront}`}
        viewBox="0 0 920 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 86 C 180 62, 360 108, 560 80 C 720 58, 820 92, 920 74 L920 120 L0 120 Z"
          fill="#1a6b3f"
        />
      </svg>
      <Link href="/" className={styles.brand}>
        <img src="/brand/bliyo-logo.png" alt="Bliyo" className={styles.logo} />
      </Link>
      {name && dashboardHref ? (
        <div className={styles.actions}>
          <p className={styles.welcome}>
            {welcome} {firstName}{!!firstName && '!'}
          </p>
          <ProfileMenu
          name={name}
          initial={initial}
          dashboardHref={dashboardHref}
          dasbor={dasbor}
          keluar={keluar}
          locale={locale}
          langLabel={langLabel}
        />
        </div>
      ) : (
        <div className={styles.actions}>
          <Link href="/register" className={styles.loginLink}>
            {register}
          </Link>
          <Link href="/login" className={styles.loginLink}>
            {masuk}
          </Link>
          <LanguageSwitch locale={locale} label={langLabel} />
        </div>
      )}
    </header>
  );
}
