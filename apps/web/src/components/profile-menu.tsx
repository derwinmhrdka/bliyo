'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/home.module.css';
import { LOCALE_COOKIE, type Locale } from '@/lib/locale-shared';
import { LogoutButton } from './logout-button';

function IdFlag() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="6" fill="#ce1126" />
      <rect y="6" width="18" height="6" fill="#ffffff" />
    </svg>
  );
}

function EnFlag() {
  return (
    <svg width="18" height="12" viewBox="0 0 60 40" aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" strokeWidth="10" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#c8102e" strokeWidth="6" />
      <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" strokeWidth="16" />
      <path d="M30 0 V40 M0 20 H60" stroke="#c8102e" strokeWidth="9" />
    </svg>
  );
}

export function ProfileMenu({
  name,
  initial,
  avatar,
  dashboardHref,
  dasbor,
  keluar,
  locale,
  langLabel,
}: {
  name: string;
  initial: string;
  avatar?: string;
  dashboardHref: string;
  dasbor: string;
  keluar: string;
  locale: Locale;
  langLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function close(event: MouseEvent) {
      const target = event.target as Node;
      if (root.current?.contains(target)) return;
      if (document.getElementById('bliyo-portal')?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  function choose(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className={styles.profile} ref={root}>
      <button
        type="button"
        className={styles.avatar}
        title={name}
        aria-label={name}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {avatar ? <img src={avatar} alt="" /> : initial}
      </button>
      {open ? (
        <div className={styles.profileMenu}>
          <Link href={dashboardHref} className={styles.profileItem} onClick={() => setOpen(false)}>
            {dasbor}
          </Link>
          <LogoutButton label={keluar} className={styles.profileItem} />
          <div className={styles.profileLang} aria-label={langLabel}>
            <button
              type="button"
              className={`${styles.langOption} ${locale === 'id' ? styles.langOptionOn : ''}`}
              onClick={() => choose('id')}
            >
              <IdFlag />
              <span>ID</span>
            </button>
            <button
              type="button"
              className={`${styles.langOption} ${locale === 'en' ? styles.langOptionOn : ''}`}
              onClick={() => choose('en')}
            >
              <EnFlag />
              <span>EN</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
