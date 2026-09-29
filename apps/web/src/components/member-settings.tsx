'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from '@/lib/locale-shared';
import styles from './settings-form.module.css';

function readLocale(): Locale {
  if (typeof document === 'undefined') return 'id';
  return document.cookie.includes(`${LOCALE_COOKIE}=en`) ? 'en' : 'id';
}

export function MemberSettings() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('id');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocale(readLocale());
    const controller = new AbortController();
    fetch('/api/users/me', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error('Gagal');
        setNotifyEnabled(Boolean(data.notifyEnabled));
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Pengaturan gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setSaved(false);
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyEnabled }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(message || 'Pengaturan gagal disimpan.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Pengaturan gagal disimpan.');
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className={styles.muted}>Memuat pengaturan...</p>;

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      {error ? <p className={styles.error}>{error}</p> : null}
      {saved ? <p className={styles.ok}>Pengaturan disimpan.</p> : null}
      <div className={styles.fields}>
        <label className={styles.field}>
          Bahasa
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={notifyEnabled} onChange={(event) => setNotifyEnabled(event.target.checked)} />
          Kirim notifikasi
        </label>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.save} disabled={pending}>
          Simpan
        </button>
      </div>
    </form>
  );
}
