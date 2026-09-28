'use client';

import { useState } from 'react';
import styles from '@/app/register/register.module.css';

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.2 6.5 12 6.5 21.5 12 21.5 12 17.8 17.5 12 17.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.75" />
      {hidden ? <path d="M5 19L19 5" stroke="currentColor" strokeWidth="1.75" /> : null}
    </svg>
  );
}

export function PasswordField({
  value,
  onChange,
  required,
  autoComplete,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  children?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.secretBox}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className={styles.secretInput}
        required={required}
      />
      <button
        type="button"
        className={styles.eye}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        onClick={() => setVisible((current) => !current)}
      >
        <EyeIcon hidden={!visible} />
      </button>
      {children}
    </span>
  );
}
