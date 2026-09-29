'use client';

import { useEffect, useState, type FormEvent } from 'react';
import styles from '@/app/member/my-link/my-link.module.css';

type Status = 'processing' | 'note' | 'done' | 'rejected';

type LinkEvent = {
  id: string;
  title: string;
  createdAt: string;
};

type MineLink = {
  id: string;
  originalUrl: string;
  shortCode: string;
  status: Status;
  events: LinkEvent[];
};

const STATUS_LABEL: Record<Status, string> = {
  done: 'Selesai',
  note: 'Catatan',
  processing: 'Sedang diproses',
  rejected: 'Ditolak',
};

function formatDay(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(new Date(value));
}

export function MyLinkList() {
  const [links, setLinks] = useState<MineLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, { image: string; description: string }>>({});
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/affiliate-links/mine', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error('Gagal');
        setLinks(data);
        setError('');
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Link gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const link = links.find((item) => item.id === openId);
    if (!link || preview[link.id]) return;
    const controller = new AbortController();
    fetch(`/api/affiliate-links/preview?url=${encodeURIComponent(link.originalUrl)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { image?: string; description?: string }) => {
        setPreview((current) => ({
          ...current,
          [link.id]: { image: data.image || '', description: data.description || '' },
        }));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [openId, links, preview]);

  function toggle(id: string) {
    if (openId === id) {
      setOpenId(null);
      setHistoryId(null);
      return;
    }
    setOpenId(id);
    setHistoryId(id);
  }

  async function addLink(event: FormEvent) {
    event.preventDefault();
    const originalUrl = url.trim();
    if (!originalUrl) return;
    setAdding(true);
    setError('');
    try {
      const response = await fetch('/api/affiliate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(message || 'Link gagal didaftarkan.');
        return;
      }
      const created: MineLink = {
        id: data.id,
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
        status: 'processing',
        events: [{ id: `local-${Date.now()}`, title: 'Link didaftarkan', createdAt: new Date().toISOString() }],
      };
      setLinks((current) => [created, ...current]);
      setUrl('');
      setOpenId(created.id);
      setHistoryId(created.id);
    } catch {
      setError('Link gagal didaftarkan.');
    } finally {
      setAdding(false);
    }
  }

  async function withdraw(id: string) {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/affiliate-links/${id}/withdraw`, { method: 'POST' });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || 'Withdraw gagal.');
        return;
      }
      setLinks((current) =>
        current.map((link) =>
          link.id === id
            ? {
                ...link,
                events: [...link.events, { id: `local-${Date.now()}`, title: 'Withdraw diajukan', createdAt: new Date().toISOString() }],
              }
            : link,
        ),
      );
    } catch {
      setError('Withdraw gagal.');
    } finally {
      setPending(false);
    }
  }

  const history = links.find((link) => link.id === historyId);

  return (
    <>
      <form className={styles.add} onSubmit={(event) => void addLink(event)}>
        <input
          type="url"
          required
          value={url}
          placeholder="Tempel link produk"
          className={styles.addInput}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit" className={styles.addButton} disabled={adding}>
          {adding ? 'Mendaftarkan...' : 'Daftarkan'}
        </button>
      </form>
      {error ? <p className={styles.addError}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Memuat link...</p> : null}
      {!loading && !links.length ? <p className={styles.muted}>Belum ada link.</p> : null}
      <ul className={styles.list}>
        {links.map((link) => {
          const open = openId === link.id;
          const shot = preview[link.id];
          const description = shot?.description || link.originalUrl;
          const withdrawn = link.events.some((event) => event.title === 'Withdraw diajukan');
          const canWithdraw = !withdrawn && link.status !== 'done' && link.status !== 'rejected';
          const shortUrl = `${origin}/r/${link.shortCode}`;
          return (
            <li key={link.id} className={styles.row}>
              <button type="button" className={styles.summary} onClick={() => toggle(link.id)} aria-expanded={open}>
                <span className={styles.desc}>{open ? description : link.originalUrl}</span>
                <span className={styles.status}>
                  <span className={styles.led} data-status={link.status} aria-hidden="true" />
                  {STATUS_LABEL[link.status]}
                </span>
              </button>
              {open ? (
                <div className={styles.detail}>
                  {shot?.image ? <img src={shot.image} alt="" className={styles.shot} /> : null}
                  <div className={styles.copy}>
                    <p className={styles.og}>{shot?.description || 'Deskripsi belum tersedia.'}</p>
                    <a className={styles.link} href={shortUrl}>
                      {shortUrl}
                    </a>
                    <button
                      type="button"
                      className={styles.withdraw}
                      disabled={!canWithdraw || pending}
                      onClick={() => void withdraw(link.id)}
                    >
                      {withdrawn ? 'Withdraw diajukan' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {history ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Riwayat link">
          <div className={styles.modal}>
            <h2>Riwayat</h2>
            <ol className={styles.timeline}>
              {history.events.map((event) => (
                <li key={event.id} className={styles.event}>
                  <span className={styles.dot} aria-hidden="true" />
                  <p className={styles.when}>{formatDay(event.createdAt)}</p>
                  <p className={styles.what}>{event.title}</p>
                </li>
              ))}
            </ol>
            <button type="button" className={styles.close} onClick={() => setHistoryId(null)}>
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
