'use client';

import { FormEvent, useState } from 'react';
import styles from '@/app/login/login.module.css';

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4.5 7.5 12 13l7.5-5.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

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

const googleMark = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
    />
  </svg>
);

export function LoginForm({ googleError }: { googleError: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(
    googleError ? 'Masuk dengan Google belum berhasil. Periksa konfigurasi SSO.' : '',
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message[0] : data.message;
        setError(message || 'Email atau kata sandi salah.');
        return;
      }
      window.location.href = data.redirect || '/';
    } catch {
      setError('Layanan sedang tidak tersedia.');
    } finally {
      setPending(false);
    }
  }

  const googleHref = '/api/auth/google';

  return (
    <form onSubmit={onSubmit} className="text-center">
      <div className="relative mb-3 text-left">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
          <MailIcon />
        </span>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          className="w-full rounded-control border-[1.5px] border-line py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-accent"
        />
      </div>
      <div className="mb-3 text-left">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
            <LockIcon />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Kata sandi"
            className="w-full rounded-control border-[1.5px] border-line py-2.5 pl-10 pr-11 text-sm outline-none focus:border-green-accent"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-mute hover:text-green-dark"
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            onClick={() => setShowPassword((value) => !value)}
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>
      </div>
      {error ? (
        <p className="mb-2 text-left text-xs font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`${styles.submit} mt-1.5 w-full rounded-control bg-green-dark px-3 py-[11px] text-sm font-bold text-white disabled:opacity-70`}
      >
        {pending ? 'Memproses' : 'Masuk'}
      </button>
      <div className="my-[18px] flex items-center gap-2.5 text-xs text-mute before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        Atau
      </div>
      <a
        href={googleHref}
        aria-label="Masuk dengan Google"
        title="Masuk dengan Google"
        className={`${styles.google} mx-auto flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] border-line bg-white transition-colors hover:border-green-accent`}
      >
        {googleMark}
      </a>
    </form>
  );
}
