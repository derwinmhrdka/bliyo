'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/home.module.css';
import { LOCALE_COOKIE, type Locale } from '@/lib/locale-shared';

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.8c2.2 2.3 3.3 5.1 3.3 8.2S14.2 17.9 12 20.2C9.8 17.9 8.7 15.1 8.7 12S9.8 6.1 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

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

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
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
    <div className={styles.lang} ref={root}>
      <button
        type="button"
        className={styles.langButton}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon />
      </button>
      {open ? (
        <div className={styles.langMenu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={`${styles.langOption} ${locale === 'id' ? styles.langOptionOn : ''}`}
            onClick={() => choose('id')}
          >
            <IdFlag />
            <span>ID</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${styles.langOption} ${locale === 'en' ? styles.langOptionOn : ''}`}
            onClick={() => choose('en')}
          >
            <EnFlag />
            <span>EN</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
