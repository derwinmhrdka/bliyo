'use client';

import { useActionState, useEffect, useState } from 'react';
import { registerLink, type RegisterLinkState } from '@/app/actions/register-link';
import styles from '@/app/home.module.css';

const initialState: RegisterLinkState = { error: '', shortUrl: '' };

export function LinkForm({
  locale,
  placeholder,
  submit,
  pending: pendingLabel,
  resultLabel,
  copyLabel,
  copiedLabel,
}: {
  locale: 'id' | 'en';
  placeholder: string;
  submit: string;
  pending: string;
  resultLabel: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [state, action, pending] = useActionState(registerLink, initialState);
  const [didCopy, setDidCopy] = useState(false);
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<{ image: string; description: string } | null>(null);

  useEffect(() => {
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setPreview(null);
      return;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      setPreview(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/affiliate-links/preview?url=${encodeURIComponent(parsed.href)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data: { image?: string; description?: string }) => {
          if (data.image || data.description) {
            setPreview({ image: data.image || '', description: data.description || '' });
            return;
          }
          setPreview(null);
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === 'AbortError') return;
          setPreview(null);
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [url]);

  async function copy() {
    if (!state.shortUrl) return;
    await navigator.clipboard.writeText(state.shortUrl);
    setDidCopy(true);
  }

  return (
    <div className={styles.formWrap}>
      <form action={action} className={styles.form}>
        <input
          name="originalUrl"
          type="url"
          required
          placeholder={placeholder}
          className={styles.input}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" disabled={pending} className={styles.button}>
          {pending ? pendingLabel : submit}
        </button>
      </form>
      {preview ? (
        <div className={styles.preview}>
          {preview.image ? <img src={preview.image} alt="" /> : null}
          {preview.description ? <p>{preview.description}</p> : null}
        </div>
      ) : null}
      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.shortUrl ? (
        <div className={styles.result}>
          <p className={styles.resultLabel}>{resultLabel}</p>
          <p className={styles.resultUrl}>{state.shortUrl}</p>
          <button type="button" onClick={copy} className={styles.copy}>
            {didCopy ? copiedLabel : copyLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
